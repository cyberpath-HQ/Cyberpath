import type { APIRoute } from "astro";

import { markdownRedirect, siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

const TARGET = "https://certdb.cyberpath-hq.com/developers";

export const GET: APIRoute = () => {
    return createMarkdownResponse(markdownRedirect({
        title:     "CyberPath CertDb — Developers",
        url:       siteUrl("/developers/"),
        target:    TARGET,
        linkLabel: "Open the developers page on CyberPath CertDb",
        status:    301,
    }));
};
