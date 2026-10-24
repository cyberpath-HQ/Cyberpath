import type { APIRoute } from "astro";

import { markdownRedirect, siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

const TARGET = `https://certdb.cyberpath-hq.com/database`;

export const GET: APIRoute = () => createMarkdownResponse(markdownRedirect({
    title:     `CyberPath CertDb — Certification Database`,
    url:       siteUrl(`/database/`),
    target:    TARGET,
    linkLabel: `Open the certification database on CyberPath CertDb`,
    status:    301,
}));
