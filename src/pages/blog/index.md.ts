import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import getReadingTime from "reading-time";

import { getAuthor } from "@/data/authors";
import { blogIndexMarkdown } from "@/lib/agent-markdown/blog-index";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

export const GET: APIRoute = async () => {
    const posts = await getCollection("blog", ({ data }) => {
        return data.draft !== true;
    });

    return createMarkdownResponse(blogIndexMarkdown(
        posts.map((post) => {
            return {
                id:          post.id,
                title:       post.data.title,
                description: post.data.description,
                pubDate:     post.data.pubDate,
                author:      getAuthor(post.data.author)?.name ?? post.data.author,
                tags:        post.data.tags,
                readingTime: getReadingTime(post.body ?? "").text,
            };
        })
    ));
};
