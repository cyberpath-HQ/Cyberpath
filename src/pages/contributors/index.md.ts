import type { APIRoute } from "astro";

import { markdownRedirect, siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

const TARGET = "https://certdb.cyberpath-hq.com/contributors";

export const GET: APIRoute = () => {
    return createMarkdownResponse(markdownRedirect({
        title:     "CyberPath CertDb — Contributors",
        url:       siteUrl("/contributors/"),
        target:    TARGET,
        linkLabel: "Open the contributors page on CyberPath CertDb",
        status:    301,
    }));
};
