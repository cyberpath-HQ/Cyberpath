import type { APIRoute } from "astro";

import { markdownRedirect, siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";
import type { MarkdownDocument } from "@/lib/agent-markdown/types";

export const GET: APIRoute = () => {
    const redirect = markdownRedirect({
        title:       "CyberPath",
        url:         siteUrl("/"),
        target:      siteUrl("/it/"),
        description: "The root URL redirects to the localized landing page. Use the English or Italian landing page linked below.",
        status:      303,
    });

    const document: MarkdownDocument = {
        frontmatter: redirect.frontmatter,
        body:        [
            redirect.body,
            "",
            "## Languages",
            "",
            `- [English landing page](${ siteUrl("/en/") })`,
            `- [Italian landing page](${ siteUrl("/it/") })`,
            "",
            "## Elsewhere",
            "",
            `- [Blog](${ siteUrl("/blog/") })`,
            `- [English services](${ siteUrl("/en/services/") })`,
            `- [Italian services](${ siteUrl("/it/services/") })`,
        ].join("\n"),
    };

    return createMarkdownResponse(document);
};
