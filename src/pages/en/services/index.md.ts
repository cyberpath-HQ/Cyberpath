import type { APIRoute } from "astro";

import { servicesMarkdown } from "@/lib/agent-markdown/landing";
import { siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

export const GET: APIRoute = () => createMarkdownResponse(servicesMarkdown(`en`, {
    url:         siteUrl(`/en/services/`),
    title:       `CyberPath Services | Cybersecurity Solutions for Business`,
    description: `Explore our cybersecurity services: SOCaaS (Bastion), penetration testing, security awareness training, and secure backup. Enterprise-grade protection for your business.`,
}));
