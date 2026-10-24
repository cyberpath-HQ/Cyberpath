/**
 * Machine-readable resources advertised to agents.
 *
 * These paths are used twice: the Cloudflare Worker emits them as `Link`
 * response headers (RFC 8288), and the build-time documents (the RFC 9727 API
 * catalog, the OpenAPI description and `llms.txt`) describe the same set. They
 * live here so an advertised URL and the document answering it cannot drift.
 *
 * This module must stay free of Astro imports so it can be bundled into the
 * Worker.
 */

export const SITE_ORIGIN = `https://cyberpath-hq.com`;
export const CERTDB_ORIGIN = `https://certdb.cyberpath-hq.com`;

export type DiscoveryRelation = `api-catalog` | `service-desc` | `service-doc` | `describedby`;

export interface DiscoveryLink {
    readonly rel:  DiscoveryRelation
    readonly href: string
    readonly type: string
}

/** Paths served by build-time endpoints (see `src/pages`). */
export const API_CATALOG_PATH = `/.well-known/api-catalog`;

/** Physical build output answering `API_CATALOG_PATH` (see `worker/index.ts`). */
export const API_CATALOG_DOCUMENT_PATH = `/api-catalog.json`;

export const OPENAPI_PATH = `/openapi.json`;
export const LLMS_TXT_PATH = `/llms.txt`;
export const SERVICE_DOC_PATH = `/blog/`;
export const RSS_PATH = `/rss.xml`;
export const SITEMAP_PATH = `/sitemap-index.xml`;

export const API_CATALOG_MEDIA_TYPE = `application/linkset+json`;
export const API_CATALOG_PROFILE = `https://www.rfc-editor.org/info/rfc9727`;
export const OPENAPI_MEDIA_TYPE = `application/vnd.oai.openapi+json;version=3.1`;

/**
 * Advertised on the homepage (and every other HTML page the Worker serves).
 *
 * `service-doc` points at the blog because the articles are the only
 * human-readable documentation this site publishes; the machine-readable
 * description is the OpenAPI document.
 */
export const DISCOVERY_LINKS: ReadonlyArray<DiscoveryLink> = [
    {
        rel:  `api-catalog`,
        href: API_CATALOG_PATH,
        type: API_CATALOG_MEDIA_TYPE,
    },
    {
        rel:  `service-desc`,
        href: OPENAPI_PATH,
        type: OPENAPI_MEDIA_TYPE,
    },
    {
        rel:  `service-doc`,
        href: SERVICE_DOC_PATH,
        type: `text/html`,
    },
    {
        rel:  `describedby`,
        href: LLMS_TXT_PATH,
        type: `text/plain`,
    },
];

/**
 * Serialize one link-value: `<target>; rel="..."; type="..."`.
 *
 * Targets stay relative so the header is correct on every hostname the site
 * answers on (apex, `www`, local development).
 */
export function serializeLink(link: DiscoveryLink): string {
    return `<${ link.href }>; rel="${ link.rel }"; type="${ link.type }"`;
}

/** Comma-separated `Link` header value for the given links. */
export function discoveryLinkHeader(links: ReadonlyArray<DiscoveryLink> = DISCOVERY_LINKS): string {
    return links.map(serializeLink).join(`, `);
}
