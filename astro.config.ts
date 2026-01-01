/* eslint-disable no-inline-comments */
// @ts-check
import mdx from "@astrojs/mdx";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "astro/config";
import expressiveCode from 'astro-expressive-code';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import remarkAutoLink from "./src/lib/auto-link-remark-plugin";
import remarkUtmParams from "./src/lib/utm-remark-plugin";

import playformInline from "@playform/inline";

// https://astro.build/config
export default defineConfig({
    site:          `https://cyberpath-hq.com`,
    base:          `/`,
    trailingSlash: `ignore`,
    integrations:  [
        react(),
        sitemap({
            filter: (page) => !(
                page.includes(`/database`) ||
        page.includes(`/developers`) ||
        page.includes(`/contributors`) ||
        page.includes(`/career-paths`)
            ),
        }),
        expressiveCode({
            removeUnusedThemes: true,
            shiki:              true,
            plugins:            [
                pluginCollapsibleSections(),
                pluginLineNumbers(),
            ],
            themes: [ `github-dark` ],
        }),
        mdx({
            extendMarkdownConfig: true,
            gfm:                  true,
            optimize:             true,
        }),
        playformInline({
            Beasties: {
                minimumExternalSize: 1024, // 1 KB
                pruneSource:         true,
                mergeStylesheets:    true,
                inlineFonts:         true,
                preloadFonts:        true,
                keyframes:           `critical`,
                compress:            true,
            },
        }),
    ],
    build:        {
        assets: `assets`,
    },
    markdown: {
        shikiConfig: {
            themes: {
                light: `github-dark`,
                dark:  `github-dark`,
            },
            wrap:         false,
        },
        remarkPlugins: [
            [
                remarkAutoLink,
                {},
            ],
            [
                remarkUtmParams,
                {},
            ],
        ],
    },
    compressHTML:   true,
    output:        `static`,
    image:        {
        domains: [ `githubusercontent.com` ],
    },
    prefetch: {
        defaultStrategy: `viewport`,
        prefetchAll:     true,
    },
    scopedStyleStrategy: `class`,
    vite:                {
        plugins: [
            tailwindcss({
                optimize: true,
            }),
        ],
        appType: `mpa`,

    },
});
