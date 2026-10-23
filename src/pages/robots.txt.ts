import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /
Content-Signal: ai-train=yes, search=yes, ai-input=yes

Sitemap: ${ sitemapURL.href }
`;

/**
 * Dynamically generate robots.txt
 * @param param0 Astro API route
 */
export const GET: APIRoute = ({
    site,
}): Response => {
    const sitemapURL = new URL(`sitemap-index.xml`, site);
    return new Response(getRobotsTxt(sitemapURL));
};
