/**
 * RFC 9727 API catalog document.
 *
 * The catalog is a linkset (RFC 9264) whose entries point at the parts of the
 * site an agent can consume without a browser: the feeds, the machine-readable
 * documents and the certification data API hosted on CertDb.
 */
import {
    CERTDB_ORIGIN,
    LLMS_TXT_PATH,
    OPENAPI_MEDIA_TYPE,
    OPENAPI_PATH,
    RSS_PATH,
    SERVICE_DOC_PATH,
    SITE_ORIGIN,
    SITEMAP_PATH
} from "./links";

export interface LinksetLink {
    href:   string
    type?:  string
    title?: string
}

export interface ApiCatalogEntry {
    anchor:          string
    "service-desc"?: Array<LinksetLink>
    "service-doc"?:  Array<LinksetLink>
    describedby?:    Array<LinksetLink>

    /** RFC 6573 `item`: a member of the catalog. */
    item?:           Array<LinksetLink>
}

export interface ApiCatalogDocument {
    linkset: Array<ApiCatalogEntry>
}

function siteUrl(pathname: string): string {
    return new URL(pathname, SITE_ORIGIN).toString();
}

/**
 * Build the catalog.
 *
 * Two anchors: the site itself (documented through OpenAPI, the blog and
 * `llms.txt`) and the CertDb JSON API, whose records are the closest thing
 * this publisher has to a queryable API.
 */
export function buildApiCatalog(): ApiCatalogDocument {
    return {
        linkset: [
            {
                anchor:         siteUrl(`/`),
                "service-desc": [
                    {
                        href:  siteUrl(OPENAPI_PATH),
                        type:  OPENAPI_MEDIA_TYPE,
                        title: `OpenAPI 3.1 description of the CyberPath content API`,
                    },
                ],
                "service-doc": [
                    {
                        href:  siteUrl(SERVICE_DOC_PATH),
                        type:  `text/html`,
                        title: `CyberPath articles`,
                    },
                ],
                describedby: [
                    {
                        href:  siteUrl(LLMS_TXT_PATH),
                        type:  `text/plain`,
                        title: `llms.txt overview for language models`,
                    },
                ],
                item: [
                    {
                        href:  siteUrl(RSS_PATH),
                        type:  `application/rss+xml`,
                        title: `Blog feed`,
                    },
                    {
                        href:  siteUrl(SITEMAP_PATH),
                        type:  `application/xml`,
                        title: `Sitemap index`,
                    },
                ],
            },
            {
                anchor: `${ CERTDB_ORIGIN }/`,
                item:   [
                    {
                        href:  `${ CERTDB_ORIGIN }/database/data-index.json`,
                        type:  `application/json`,
                        title: `Search index for the certification database`,
                    },
                    {
                        href:  `${ CERTDB_ORIGIN }/database/data.json`,
                        type:  `application/json`,
                        title: `All certification records`,
                    },
                    {
                        href:  `${ CERTDB_ORIGIN }/career-paths/{path}/data.json`,
                        type:  `application/json`,
                        title: `Certifications grouped by career path`,
                    },
                ],
            },
        ],
    };
}
