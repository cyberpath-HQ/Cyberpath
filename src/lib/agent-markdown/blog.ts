import path from "node:path";
import type { CollectionEntry } from "astro:content";
import getReadingTime from "reading-time";

import { getAuthor } from "../../data/authors";
import { mdxToMarkdown } from "../mdx-to-markdown";
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

/**
 * Convert a blog entry (MDX) into the markdown served to agents.
 *
 * The MDX source is reused instead of the rendered HTML, so the output keeps
 * readable code blocks and drops the site chrome entirely. Only the MDX
 * specific parts (imports, components, expressions) are rewritten, the rest of
 * the article is served exactly as it was authored.
 */
export async function blogEntryToMarkdown(entry: CollectionEntry<`blog`>): Promise<MarkdownDocument> {
    const source = entry.body ?? ``;

    const body = await mdxToMarkdown(source, {
        fileSlug:      entry.id,
        resolveTarget,
    });

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
