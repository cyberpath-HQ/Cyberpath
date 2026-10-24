import { siteUrl } from "./redirect";
import type { MarkdownDocument } from "./types";

export interface BlogIndexPost {
    id:          string
    title:       string
    description: string
    pubDate:     Date
    author:      string
    tags:        Array<string>
    readingTime: string
}

const DESCRIPTION = `Insights, tutorials, and thoughts on cybersecurity, certifications, and career development.`;

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/**
 * Markdown variant of the blog listing.
 *
 * The HTML page renders its list client side (React island); agents get the
 * same information as a plain list of links instead.
 */
export function blogIndexMarkdown(posts: Array<BlogIndexPost>): MarkdownDocument {
    const sorted = [ ...posts ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
    const tags = [ ...new Set(sorted.flatMap((post) => post.tags)) ].sort();

    const lines: Array<string> = [
        `# CyberPath Blog`,
        ``,
        DESCRIPTION,
        ``,
        `## Latest articles`,
        ``,
    ];

    for (const post of sorted) {
        lines.push(
            `- [${ post.title }](${ siteUrl(`/blog/${ post.id }/`) }) — ${ formatDate(post.pubDate) } · ${ post.author } · ${ post.readingTime }`,
            `  ${ post.description }`
        );
    }

    if (tags.length > 0) {
        lines.push(``, `## Topics`, ``, tags.map((tag) => `\`${ tag }\``).join(`, `));
    }

    lines.push(
        ``,
        `## Feeds`,
        ``,
        `- [RSS feed](${ siteUrl(`/rss.xml`) })`,
        `- [Markdown version of this page](${ siteUrl(`/blog/index.md`) })`
    );

    return {
        frontmatter: {
            title:       `CyberPath Blog`,
            description: DESCRIPTION,
            url:         siteUrl(`/blog/`),
            count:       sorted.length,
            type:        `website`,
        },
        body: lines.join(`\n`),
    };
}
