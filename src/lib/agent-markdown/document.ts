import { serializeFrontmatter } from "./frontmatter";
import type { MarkdownDocument } from "./types";

/**
 * Approximate number of tokens in a markdown document.
 *
 * Four characters per token is a reasonable average for English prose and
 * code, which is all we need for the advisory `x-markdown-tokens` header.
 */
export function estimateTokens(markdown: string): number {
    return Math.ceil(markdown.length / 4);
}

/**
 * Render a markdown document (frontmatter + body) as a single string.
 */
export function renderMarkdownDocument(document: MarkdownDocument): string {
    const frontmatter = serializeFrontmatter(document.frontmatter);
    const body = document.body.trim();

    return `${ frontmatter }${ body }\n`;
}
