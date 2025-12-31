import {
    defineCollection, z
} from "astro:content";
import { CareerPathsList } from "./lib/career-paths.ts";
import { glob } from 'astro/loaders';
import { BLOG_COLLECTION_LOADER } from "./lib/blog-collection-loader.ts";

const certifications = defineCollection({
    loader: glob({
        pattern: `**/*.{md,mdx}`,
        base:    `./src/content/certifications`,
    }),
    schema: () => z.object({
        title:           z.string(),
        acronym:         z.string(),
        last_updated_at: z.date(),
        reference:       z.string(),
        aliases:         z.array(z.string()).optional(),
        draft:           z.boolean().default(false),
        career_paths:    z.array(z.enum(CareerPathsList)),
        price:           z.string(),
        currency:        z.string(),
    }),
});

const blog = defineCollection({
    loader: BLOG_COLLECTION_LOADER,
    schema: ({
        image,
    }) => z.object({
        title:           z.string(),
        description:     z.string(),
        pubDate:         z.date(),
        updatedDate:     z.date().optional(),
        heroImage:       image().optional(),
        heroClass:       z.string().optional(),
        draft:           z.boolean().default(false),
        tags:            z.array(z.string()).default([]),

        // Optional category override
        category:        z.string().optional(),

        // Author ID from authors.ts
        author:          z.string(),

        // Optional link hooks for auto-linking with custom wordings
        linkHooks:       z.array(z.string()).optional(),
    }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
    certifications,
    blog,
};
