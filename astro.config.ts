// @ts-check
import mdx from "@astrojs/mdx";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

import sentry from "@sentry/astro";
import spotlightjs from "@spotlightjs/astro";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    site:         "https://cyberpath-hq.com",
    base:         "/",
    trailingSlash: "ignore",
    integrations: [
        tailwind({
            nesting: true,
        }),
        sentry({
            enabled: import.meta.env.DEV,
        }),
        spotlightjs(),
        react(),
        sitemap({
            filter: (page) => !(
                page.includes("/database") || 
                page.includes("/developers") || 
                page.includes("/contributors") ||
                page.includes("/career-paths")
            )
        }),
        mdx({
            extendMarkdownConfig: true,
            gfm:                  true,
        }),
    ],
    build:        {
        assets: "assets",
    }
});
