import type { APIRoute } from "astro";

import { buildApiCatalog } from "@/lib/agent-discovery/catalog";
import {
    API_CATALOG_MEDIA_TYPE,
    API_CATALOG_PROFILE,
    discoveryLinkHeader
} from "@/lib/agent-discovery/links";

const JSON_INDENT = 2;

/**
 * RFC 9727 API catalog.
 *
 * The JSON twin of `/.well-known/api-catalog`: GitHub Pages serves files by
 * extension, so the extensionless well-known URI is resolved to this document
 * by the Cloudflare Worker (see `worker/index.ts`).
 */
export const GET: APIRoute = () => {
    const body = `${ JSON.stringify(buildApiCatalog(), null, JSON_INDENT) }\n`;

    return new Response(body, {
        headers: {
            "Content-Type":  `${ API_CATALOG_MEDIA_TYPE }; profile="${ API_CATALOG_PROFILE }"`,
            "Cache-Control": `public, max-age=3600`,
            Link:            discoveryLinkHeader(),
        },
    });
};
