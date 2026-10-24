import {
    estimateTokens, renderMarkdownDocument
} from "./document";
import type { MarkdownDocument } from "./types";

export const MARKDOWN_CONTENT_TYPE = `text/markdown; charset=utf-8`;

/**
 * Build the response returned by every `index.md` endpoint.
 *
 * Astro keeps the body (and drops the headers) for a static build; the headers
 * document the intended representation and are correct when an endpoint is
 * served on demand.
 */
export function createMarkdownResponse(document: MarkdownDocument): Response {
    const markdown = renderMarkdownDocument(document);

    return new Response(markdown, {
        headers: {
            "Content-Type":      MARKDOWN_CONTENT_TYPE,
            "Content-Length":    String(new TextEncoder().encode(markdown).length),
            Vary:                `Accept`,
            "X-Markdown-Tokens": String(estimateTokens(markdown)),
        },
    });
}
