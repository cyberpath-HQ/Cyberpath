import type { APIRoute } from "astro";

import { landingMarkdown } from "@/lib/agent-markdown/landing";
import { siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

export const GET: APIRoute = () => createMarkdownResponse(landingMarkdown(`en`, {
    url:         siteUrl(`/en/`),
    title:       `CyberPath - Bastion SOCaaS | Enterprise Security for SMB`,
    description: `Bastion provides enterprise-grade SOC as a Service for small and medium businesses. 24/7 security monitoring, threat detection, and incident response at an affordable price.`,
}));
