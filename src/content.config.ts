import {
    defineCollection, z
} from "astro:content";
import { CareerPathsList } from "./lib/career-paths.ts";
import { glob } from 'astro/loaders';

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
    loader: glob({
        pattern: `**/*.{md,mdx}`,
        base:    `./src/content/blog`,
    }),
    schema: ({
        image,
    }) => z.object({
        title:           z.string(),
        description:     z.string(),
        pubDate:         z.date(),
        updatedDate:     z.date().optional(),
        heroImage:       image().optional(),
        heroClass:      z.string().optional(),
        draft:           z.boolean().default(false),
        tags:            z.array(z.string()).default([]),

        // Author ID from authors.ts
        author:          z.string(),
        readingTime:     z.string().optional(),
    }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
    certifications,
    blog,
};
