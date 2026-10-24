/**
 * OpenAPI 3.1 description of the read-only surfaces this site exposes.
 *
 * This is what the homepage `service-desc` Link header points at. It is built
 * at build time (see `src/pages/openapi.json.ts`) and served as static JSON.
 */
import {
    API_CATALOG_PATH,
    LLMS_TXT_PATH,
    RSS_PATH,
    SITE_ORIGIN,
    SITEMAP_PATH
} from "./links";

const CERTIFICATION_SCHEMA = {
    type:                 `object`,
    description:          `A cybersecurity certification catalogued by CyberPath.`,
    required:             [
        `title`,
        `acronym`,
        `provider`,
        `slug`,
    ],
    properties:           {
        title:           {
            type:        `string`,
            description: `Full certification name.`,
        },
        acronym:         {
            type:        `string`,
            description: `Short name used in the badge and listings.`,
        },
        last_updated_at: {
            type:        `string`,
            format:      `date-time`,
            description: `When the record was last reviewed.`,
        },
        image:           {
            type:        `string`,
            description: `Path to the certification badge.`,
        },
        reference:       {
            type:        `string`,
            format:      `uri`,
            description: `Provider page for the certification.`,
        },
        aliases:         {
            type:  `array`,
            items: {
                type: `string`,
            },
        },
        career_paths:    {
            type:        `array`,
            items:       {
                type: `string`,
            },
            description: `Career paths the certification is relevant to.`,
        },
        price:           {
            type:        `string`,
            description: `Exam price as published by the provider.`,
        },
        currency:        {
            type:        `string`,
            description: `Currency of \`price\`.`,
        },
        provider:        {
            type:        `string`,
            description: `Organisation issuing the certification.`,
        },
        slug:            {
            type:        `string`,
            description: `\`<provider>/<certification>\` identifier used in site URLs.`,
        },
    },
    additionalProperties: true,
} as const;

const FUSE_INDEX_SCHEMA = {
    type:                 `object`,
    description:          `Fuse.js search index over the certification records.`,
    required:             [
        `keys`,
        `records`,
    ],
    properties:           {
        keys: {
            type:  `array`,
            items: {
                type:       `object`,
                properties: {
                    id: {
                        type: `string`,
                    },
                    path: {
                        type:  `array`,
                        items: {
                            type: `string`,
                        },
                    },
                    weight: {
                        type:   `number`,
                        format: `float`,
                    },
                    src: {
                        type: `string`,
                    },
                },
            },
        },
        records: {
            type:  `array`,
            items: {
                type:        `object`,
                description: `Positional record (\`i\`) plus the values keyed by field (\`$\`).`,
                properties:  {
                    i: {
                        type: `integer`,
                    },
                    $: {
                        type: `object`,
                    },
                },
            },
        },
    },
    additionalProperties: true,
} as const;

interface OpenApiResponseObject {
    description: string
    content:     Record<string, { schema: Record<string, unknown> }>
}

function jsonResponse(description: string, schema: Record<string, unknown>): OpenApiResponseObject {
    return {
        description,
        content:     {
            "application/json": {
                schema,
            },
        },
    };
}

function textResponse(description: string, mediaType: string): OpenApiResponseObject {
    return {
        description,
        content:     {
            [mediaType]: {
                schema: {
                    type: `string`,
                },
            },
        },
    };
}

export function buildOpenApiDocument(): Record<string, unknown> {
    return {
        openapi: `3.1.0`,
        info:    {
            title:       `CyberPath content API`,
            version:     `1.0.0`,
            summary:     `Read-only access to CyberPath articles, feeds, the sitemap and the certification database.`,
            description: [
                `CyberPath is a static cybersecurity publication. Everything listed here is immutable,`,
                `cacheable and unauthenticated: there are no write operations and no API keys.`,
                ``,
                `Pages also answer \`Accept: text/markdown\` with a Markdown representation; adding`,
                `\`index.md\` to a page URL requests the same document directly.`,
            ].join(`\n`),
            contact:     {
                name:  `CyberPath`,
                url:   `${ SITE_ORIGIN }/`,
                email: `it@cyberpath-hq.com`,
            },
        },
        servers: [
            {
                url:         SITE_ORIGIN,
                description: `CyberPath main website`,
            },
        ],
        tags: [
            {
                name: `discovery`,
            },
            {
                name: `content`,
            },
            {
                name: `certifications`,
            },
        ],
        paths: {
            [API_CATALOG_PATH]:     {
                get: {
                    tags:        [ `discovery` ],
                    operationId: `getApiCatalog`,
                    summary:     `RFC 9727 API catalog (linkset)`,
                    responses:   {
                        200: {
                            description: `Linkset listing the APIs and machine-readable resources of this publisher.`,
                            content:     {
                                "application/linkset+json": {
                                    schema: {
                                        type: `object`,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            [LLMS_TXT_PATH]:        {
                get: {
                    tags:        [ `discovery` ],
                    operationId: `getLlmsTxt`,
                    summary:     `Machine-oriented overview of the site`,
                    responses:   {
                        200: textResponse(`Markdown document describing the site and its main sections.`, `text/plain`),
                    },
                },
            },
            [RSS_PATH]:             {
                get: {
                    tags:        [ `content` ],
                    operationId: `getBlogFeed`,
                    summary:     `RSS feed of the blog`,
                    responses:   {
                        200: textResponse(`RSS 2.0 feed of published articles.`, `application/rss+xml`),
                    },
                },
            },
            [SITEMAP_PATH]:         {
                get: {
                    tags:        [ `content` ],
                    operationId: `getSitemapIndex`,
                    summary:     `Sitemap index of every indexable page`,
                    responses:   {
                        200: textResponse(`Sitemap index referencing the URL sets of each section.`, `application/xml`),
                    },
                },
            },
            "/database/data.json":  {
                get: {
                    tags:        [ `certifications` ],
                    operationId: `listCertifications`,
                    summary:     `All certification records`,
                    description: `Served by the CertDb host; requests to this path on the main site redirect there.`,
                    responses:   {
                        200: jsonResponse(`Every certification, with provider, price and career paths.`, {
                            type:  `array`,
                            items: CERTIFICATION_SCHEMA,
                        }),
                    },
                },
            },
            "/database/data-index.json": {
                get: {
                    tags:        [ `certifications` ],
                    operationId: `getCertificationSearchIndex`,
                    summary:     `Search index over the certification records`,
                    responses:   {
                        200: jsonResponse(`Fuse.js index used by the database search page.`, FUSE_INDEX_SCHEMA),
                    },
                },
            },
            "/career-paths/{path}/data.json": {
                get: {
                    tags:        [ `certifications` ],
                    operationId: `listCareerPathCertifications`,
                    summary:     `Certifications relevant to one career path`,
                    parameters:  [
                        {
                            name:        `path`,
                            in:          `path`,
                            required:    true,
                            description: `Kebab-case career path name, e.g. \`blue-team-specialist\`.`,
                            schema:      {
                                type: `string`,
                            },
                        },
                    ],
                    responses: {
                        200: jsonResponse(`Certifications grouped under the requested career path.`, {
                            type:  `array`,
                            items: CERTIFICATION_SCHEMA,
                        }),
                    },
                },
            },
        },
    };
}
