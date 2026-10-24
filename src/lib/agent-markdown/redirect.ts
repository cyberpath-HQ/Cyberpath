import type {
    MarkdownDocument, MarkdownRedirectOptions
} from "./types";

export const SITE_URL = `https://cyberpath-hq.com`;

/**
 * Build an absolute URL for a path on the main site.
 */
export function siteUrl(pathname: string): string {
    return new URL(pathname, SITE_URL).toString();
}

/**
 * Markdown redirect document.
 *
 * Some pages on this site are only redirects (career paths, the certification
 * database, the developers page). Agents cannot execute the HTML meta refresh,
 * so instead of an empty HTML shell they get a small markdown document that
 * states the destination in both the frontmatter (machine readable) and the
 * body (human readable).
 */
export function markdownRedirect(options: MarkdownRedirectOptions): MarkdownDocument {
    const {
        title,
        target,
        url,
        description,
        linkLabel = `Open the destination`,
        status = 301,
    } = options;

    const reason = description ??
        `This page is not hosted on cyberpath-hq.com. Its content lives on CyberPath CertDb.`;

    return {
        frontmatter: {
            title,
            description:     reason,
            url,
            redirect_url:    target,
            redirect_status: status,
            type:            `redirect`,
        },
        body: [
            `# ${ title }`,
            ``,
            reason,
            ``,
            `**Destination:** <${ target }>`,
            ``,
            `- [${ linkLabel }](${ target })`,
        ].join(`\n`),
    };
}
