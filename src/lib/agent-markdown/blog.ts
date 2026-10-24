import path from "node:path";
import type { CollectionEntry } from "astro:content";
import getReadingTime from "reading-time";
import { remark } from "remark";
import remarkMdx from "remark-mdx";

import { getAuthor } from "../../data/authors";
import remarkToPlainMarkdown from "../to-plain-markdown-remark-plugin";
import {
    SITE_URL, siteUrl
} from "./redirect";
import type { MarkdownDocument } from "./types";

const REPOSITORY_RAW_BASE = `https://raw.githubusercontent.com/cyberpath-HQ/Cyberpath/master/`;
const BLOG_CONTENT_DIR = `src/content/blog`;

/**
 * Resolve a link or image target from an MDX file to something an agent can
 * fetch: site relative URLs become absolute, content relative assets point to
 * the repository (they are not published as separate files) and links to other
 * posts point to their HTML page.
 */
function resolveTarget(target: string): string | null {
    if (
        target.startsWith(`#`) ||
        target.startsWith(`mailto:`) ||
        target.startsWith(`tel:`) ||
        /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(target)
    ) {
        return null;
    }

    if (target.startsWith(`/`)) {
        return new URL(target, SITE_URL).toString();
    }

    const resolved = path.posix.normalize(path.posix.join(BLOG_CONTENT_DIR, target));

    if (/\.mdx?$/.test(resolved)) {
        const slug = path.posix.basename(resolved).replace(/\.mdx?$/, ``);

        return siteUrl(`/blog/${ slug }/`);
    }

    return `${ REPOSITORY_RAW_BASE }${ resolved }`;
}

function rewriteLinksAndImages(markdown: string): string {
    return markdown.replace(
        /(!?\[[^\]]*\]\()([^)\s]+)([^)]*\))/g,
        (match, prefix: string, target: string, suffix: string) => {
            const resolved = resolveTarget(target);

            return resolved === null
                ? match
                : `${ prefix }${ resolved }${ suffix }`;
        }
    );
}

/**
 * Convert a blog entry (MDX) into the markdown served to agents.
 *
 * The MDX source is reused instead of the rendered HTML, so the output keeps
 * readable code blocks and drops the site chrome entirely.
 */
export async function blogEntryToMarkdown(entry: CollectionEntry<`blog`>): Promise<MarkdownDocument> {
    const source = entry.body ?? ``;

    const processor = remark()
        .use(remarkMdx)
        .use(remarkToPlainMarkdown, {
            fileSlug: entry.id,
        });

    const processed = String(await processor.process(source));
    const body = rewriteLinksAndImages(processed)
        .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, ``)
        .replace(/\n{3,}/g, `\n\n`)
        .trim();

    const heading = entry.data.title.trim();

    const content = /^#\s/.test(body)
        ? body
        : `# ${ heading }\n\n${ body }`;

    const author = getAuthor(entry.data.author);

    return {
        frontmatter: {
            title:        heading,
            description:  entry.data.description,
            url:          siteUrl(`/blog/${ entry.id }/`),
            date:         entry.data.pubDate.toISOString(),
            updated:      entry.data.updatedDate?.toISOString(),
            author:       author?.name ?? entry.data.author,
            tags:         entry.data.tags,
            reading_time: getReadingTime(source).text,
            type:         `article`,
        },
        body: content,
    };
}
