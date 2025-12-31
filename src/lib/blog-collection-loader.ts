import { glob } from "astro/loaders";

export const BLOG_COLLECTION_PATTERN = `**/*.{md,mdx}`;
export const BLOG_COLLECTION_BASE = `./src/content/blog`;

export const BLOG_COLLECTION_LOADER = glob({
    pattern: BLOG_COLLECTION_PATTERN,
    base:    BLOG_COLLECTION_BASE,
});
