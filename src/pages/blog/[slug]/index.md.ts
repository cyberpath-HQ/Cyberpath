import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

import { blogEntryToMarkdown } from "@/lib/agent-markdown/blog";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

export const getStaticPaths = (async () => {
    const posts = await getCollection("blog", ({ data }) => {
        return data.draft !== true;
    });

    return posts.map((post) => {
        return {
            params: { slug: post.id },
            props:  { entry: post },
        };
    });
}) satisfies GetStaticPaths;

interface Props {
    entry: CollectionEntry<"blog">;
}

export const GET: APIRoute<Props> = async ({ props }) => {
    return createMarkdownResponse(await blogEntryToMarkdown(props.entry));
};
