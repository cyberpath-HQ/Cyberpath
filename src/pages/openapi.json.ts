import type { APIRoute } from "astro";

import { buildOpenApiDocument } from "@/lib/agent-discovery/openapi";

const JSON_INDENT = 2;

/** OpenAPI 3.1 description advertised by the `service-desc` Link header. */
export const GET: APIRoute = () => {
    const body = `${ JSON.stringify(buildOpenApiDocument(), null, JSON_INDENT) }\n`;

    return new Response(body, {
        headers: {
            "Content-Type":  `application/vnd.oai.openapi+json;version=3.1`,
            "Cache-Control": `public, max-age=3600`,
        },
    });
};
