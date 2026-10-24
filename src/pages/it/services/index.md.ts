import type { APIRoute } from "astro";

import { servicesMarkdown } from "@/lib/agent-markdown/landing";
import { siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

export const GET: APIRoute = () => createMarkdownResponse(servicesMarkdown(`it`, {
    url:         siteUrl(`/it/services/`),
    title:       `CyberPath Servizi | Soluzioni di Cybersecurity per Aziende`,
    description: `Esplora i nostri servizi di cybersecurity: SOCaaS (Bastion), penetration test, formazione sulla sicurezza e backup sicuro. Protezione di livello enterprise per la tua azienda.`,
}));
