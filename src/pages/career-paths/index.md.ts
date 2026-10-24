import type { APIRoute } from "astro";

import { markdownRedirect, siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

const TARGET = `https://certdb.cyberpath-hq.com/career-paths`;

export const GET: APIRoute = () => createMarkdownResponse(markdownRedirect({
    title:     `CyberPath CertDb — Career Paths`,
    url:       siteUrl(`/career-paths/`),
    target:    TARGET,
    linkLabel: `Open the career paths page on CyberPath CertDb`,
    status:    301,
}));
