/**
 * Content negotiation helpers shared by the Cloudflare Worker (runtime) and the
 * markdown endpoints (build time).
 *
 * This module must stay free of Astro imports so it can be bundled into the
 * Worker.
 */

export const MARKDOWN_MEDIA_TYPE = `text/markdown`;

/** Name of the markdown variant generated next to every HTML page. */
export const MARKDOWN_VARIANT_FILE = `index.md`;

interface MediaRange {
    type:    string;
    subtype: string;
    quality: number;
}

function parseAcceptHeader(accept: string | null | undefined): Array<MediaRange> {
    if (!accept) {
        return [];
    }

    return accept
        .split(`,`)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const [
                range,
                ...parameters
            ] = part.split(`;`);
            const [
                type = ``,
                subtype = ``,
            ] = (range ?? ``).trim().toLowerCase().split(`/`);

            let quality = 1;

            for (const parameter of parameters) {
                const [
                    name,
                    value,
                ] = parameter.split(`=`);
                if (name?.trim().toLowerCase() !== `q`) {
                    continue;
                }
                const parsed = Number.parseFloat(value ?? ``);
                if (!Number.isNaN(parsed)) {
                    quality = Math.min(Math.max(parsed, 0), 1);
                }
            }

            return {
                type,
                subtype,
                quality,
            };
        });
}

function specificity(range: MediaRange): number {
    if (range.type === `*`) {
        return 0;
    }
    if (range.subtype === `*`) {
        return 1;
    }
    return 2;
}

/**
 * RFC 9110 quality lookup: the most specific matching media range wins, and
 * wildcard fallbacks are honoured (so `text/markdown;q=0.5, * / *` still
 * prefers HTML).
 */
function qualityFor(ranges: Array<MediaRange>, type: string, subtype: string): number {
    let bestSpecificity = -1;
    let quality = 0;

    for (const range of ranges) {
        const matches = (range.type === `*` && range.subtype === `*`)
            || (range.type === type && range.subtype === `*`)
            || (range.type === type && range.subtype === subtype);

        if (!matches) {
            continue;
        }

        const currentSpecificity = specificity(range);

        if (
            currentSpecificity > bestSpecificity
            || (currentSpecificity === bestSpecificity && range.quality > quality)
        ) {
            bestSpecificity = currentSpecificity;
            quality = range.quality;
        }
    }

    return quality;
}

/**
 * Quality of an explicitly listed media type, ignoring `type/*` and wildcard
 * ranges. Used so that generic clients (`Accept: * / *`) keep receiving HTML.
 */
function explicitQuality(ranges: Array<MediaRange>, type: string, subtype: string): number {
    let quality = 0;

    for (const range of ranges) {
        if (range.type === type && range.subtype === subtype) {
            quality = Math.max(quality, range.quality);
        }
    }

    return quality;
}

/**
 * Decide whether a request should receive markdown instead of HTML.
 *
 * Markdown is only served when `text/markdown` is explicitly requested with a
 * quality higher than (or equal to) the best HTML alternative, so browsers and
 * generic HTTP clients keep getting HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
    const ranges = parseAcceptHeader(accept);
    const markdownQuality = explicitQuality(ranges, `text`, `markdown`);

    if (markdownQuality <= 0) {
        return false;
    }

    const htmlQuality = Math.max(
        qualityFor(ranges, `text`, `html`),
        qualityFor(ranges, `application`, `xhtml+xml`)
    );

    return markdownQuality >= htmlQuality;
}

/**
 * Whether the last path segment looks like a file (`/rss.xml`, `/favicon.svg`).
 * Those are never negotiated: they already are machine readable.
 */
export function isAssetPath(pathname: string): boolean {
    const lastSegment = pathname.slice(pathname.lastIndexOf(`/`) + 1);

    return lastSegment.includes(`.`);
}

/**
 * Map an HTML path to its markdown variant.
 *
 * `/` -> `/index.md`
 * `/blog/` -> `/blog/index.md`
 * `/blog/a-post` -> `/blog/a-post/index.md`
 */
export function toMarkdownPath(pathname: string): string | null {
    if (!pathname.startsWith(`/`) || isAssetPath(pathname)) {
        return null;
    }

    const normalized = pathname.replace(/\/+$/, ``);

    return `${ normalized }/${ MARKDOWN_VARIANT_FILE }`;
}

/**
 * Add a dimension to the `Vary` header without duplicating existing values.
 */
export function appendVary(headers: Headers, value: string): void {
    const current = headers.get(`Vary`);

    if (!current) {
        headers.set(`Vary`, value);
        return;
    }

    const values = current.split(`,`).map((entry) => entry.trim().toLowerCase());

    if (values.includes(`*`) || values.includes(value.toLowerCase())) {
        return;
    }

    headers.set(`Vary`, `${ current }, ${ value }`);
}
