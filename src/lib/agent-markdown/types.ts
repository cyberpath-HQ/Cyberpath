/**
 * Types shared by the "Markdown for Agents" build-time generators.
 *
 * Every page that is published with content negotiation gets a markdown
 * variant generated at build time. Those variants live next to the HTML
 * output (for example `/blog/<slug>/index.md`) and are served by the
 * Cloudflare Worker in `worker/` when a client asks for
 * `Accept: text/markdown`.
 */

export type FrontmatterScalar = string | number | boolean;

export type FrontmatterValue = FrontmatterScalar | ReadonlyArray<FrontmatterScalar>;

export interface MarkdownDocument {
    /**
     * YAML frontmatter fields, in insertion order.
     * Empty strings, `undefined` values and empty arrays are dropped.
     */
    frontmatter: Record<string, FrontmatterValue | undefined>

    /** Markdown body, without frontmatter. */
    body:        string
}

export interface MarkdownRedirectOptions {
    /** Human readable page title. */
    title:        string

    /** Absolute URL of the page that hosts the real content. */
    target:       string

    /** Absolute URL of the page that triggered the redirect (the markdown variant's canonical HTML URL). */
    url:          string

    /** Short explanation of why the content is not served here. */
    description?: string

    /** Label for the link to the destination. */
    linkLabel?:   string

    /** HTTP status the HTML page uses, when known. */
    status?:      number
}
