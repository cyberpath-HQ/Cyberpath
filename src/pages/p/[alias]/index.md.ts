import type { APIRoute, GetStaticPaths } from "astro";

import postAliases from "@/data/post-aliases.json";
import { markdownRedirect, siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

/**
 * Short links (`/p/<alias>`) are HTTP redirects to the canonical post URL, so
 * their markdown variant is a markdown redirect that points at the article.
 */
export const getStaticPaths = (() => {
    return Object.entries(postAliases).map(([ slug, alias ]) => {
        return {
            params: { alias },
            props:  { slug },
        };
    });
}) satisfies GetStaticPaths;

interface Props {
    slug: string;
}

export const GET: APIRoute<Props> = ({ params, props }) => {
    const alias = params.alias ?? "";
    const target = siteUrl(`/blog/${ props.slug }/`);

    return createMarkdownResponse(markdownRedirect({
        title:       `CyberPath Blog — ${ props.slug.replace(/-/g, " ") }`,
        url:         siteUrl(`/p/${ alias }/`),
        target,
        linkLabel:   "Read the article",
        description: `This is a short link to the article at ${ target }. Fetch that URL for the full content.`,
        status:      301,
    }));
};
