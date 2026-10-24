import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { SITE_ORIGIN } from "@/lib/agent-discovery/links";

function siteUrl(pathname: string): string {
    return new URL(pathname, SITE_ORIGIN).toString();
}

const DESCRIPTION = `CyberPath is an Italian cybersecurity company offering penetration testing and managed SOC services (SOCaaS) to small and medium-sized businesses, with a focus on NIS2 compliance. The site also hosts a blog with in-depth articles on offensive security, defensive engineering, certifications and career paths, plus a searchable certification database. All content is static, read-only and publicly accessible without authentication.`;

/**
 * `llms.txt`: a short, machine-oriented map of the site.
 *
 * Kept deliberately small — the article list is the only part generated from
 * content, so the orientation text stays curated.
 */
export const GET: APIRoute = async() => {
    const posts = await getCollection(`blog`, ({
        data,
    }) => data.draft !== true);

    const sorted = [ ...posts ].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    const lines: Array<string> = [
        `# CyberPath`,
        ``,
        `> ${ DESCRIPTION }`,
        ``,
        `Pages answer \`Accept: text/markdown\` with a Markdown representation; appending \`index.md\` to a page URL returns the same document directly.`,
        ``,
        `## Main sections`,
        ``,
        `- [Services (English)](${ siteUrl(`/en/`) }): penetration testing and SOCaaS for SMEs.`,
        `- [Servizi (italiano)](${ siteUrl(`/it/`) }): penetration test e SOCaaS per le PMI italiane.`,
        `- [Blog](${ siteUrl(`/blog/`) }): cybersecurity articles, tutorials and certification notes.`,
        `- [Certification database](${ siteUrl(`/database/`) }): searchable catalogue of security certifications with prices, providers and career paths.`,
        `- [Career paths](${ siteUrl(`/career-paths/`) }): role descriptions and the certifications relevant to each.`,
        `- [Contributors](${ siteUrl(`/contributors/`) }): people writing for CyberPath.`,
        ``,
        `## Machine-readable resources`,
        ``,
        `- [API catalog](${ siteUrl(`/.well-known/api-catalog`) }): RFC 9727 linkset listing every machine-readable surface below.`,
        `- [OpenAPI description](${ siteUrl(`/openapi.json`) }): OpenAPI 3.1 document for the feeds and the certification data API.`,
        `- [RSS feed](${ siteUrl(`/rss.xml`) }): the latest articles.`,
        `- [Sitemap](${ siteUrl(`/sitemap-index.xml`) }): every indexable page.`,
        `- [robots.txt](${ siteUrl(`/robots.txt`) }): crawl rules and content signals.`,
        ``,
        `## Articles`,
        ``,
    ];

    for (const post of sorted) {
        lines.push(`- [${ post.data.title }](${ siteUrl(`/blog/${ post.id }/`) }): ${ post.data.description }`);
    }

    lines.push(``);

    return new Response(lines.join(`\n`), {
        headers: {
            "Content-Type": `text/plain; charset=utf-8`,
        },
    });
};
