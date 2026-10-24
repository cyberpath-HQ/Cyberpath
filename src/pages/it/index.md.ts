import type { APIRoute } from "astro";

import { landingMarkdown } from "@/lib/agent-markdown/landing";
import { siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

export const GET: APIRoute = () => createMarkdownResponse(landingMarkdown(`it`, {
    url:         siteUrl(`/it/`),
    title:       `CyberPath - Bastion SOCaaS | Sicurezza Enterprise per PMI`,
    description: `Bastion offre SOC come servizio di livello enterprise per piccole e medie aziende. Monitoraggio sicurezza 24/7, rilevamento minacce e risposta agli incidenti.`,
}));
