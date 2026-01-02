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

import playformCompress from "@playform/compress";

// Import post aliases for redirect configuration
import postAliases from "./src/data/post-aliases.json";
import type { RedirectConfig } from "astro";

// Generate redirects from aliases
// eslint-disable-next-line @typescript-eslint/naming-convention
const redirects: Record<string, RedirectConfig> = {};
for (const [
    slug,
    alias,
] of Object.entries(postAliases)) {
    redirects[`/p/${ alias }`] = {
        status:      301,
        destination: `/blog/${ slug }`,
    };
}

// https://astro.build/config
export default defineConfig({
    site:          `https://cyberpath-hq.com`,
    base:          `/`,
    trailingSlash: `ignore`,
    redirects,
    integrations:  [
        react(),
        sitemap({
            filter: (page) => !(
                page.includes(`/database`) ||
                page.includes(`/developers`) ||
                page.includes(`/contributors`) ||
                page.includes(`/career-paths`) ||
                page.includes(`/p/`) // Exclude alias redirects from sitemap
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
        playformCompress({
            CSS: {
                csso: {
                    comments:    false,
                    sourceMap:   false,
                    restructure: true,
                },
            },
            HTML: {
                "html-minifier-terser": {
                    caseSensitive:                 false,
                    collapseBooleanAttributes:     true,
                    collapseInlineTagWhitespace:   false,
                    collapseWhitespace:            true,
                    conservativeCollapse:          false,
                    decodeEntities:                true,
                    html5:                         true,
                    keepClosingSlash:              false,
                    continueOnParseError:          true,
                    minifyCSS:                     true,
                    minifyJS:                      true,
                    removeComments:                true,
                    removeRedundantAttributes:     true,
                    removeScriptTypeAttributes:    true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype:               true,
                    noNewlinesBeforeTagClose:      true,
                    minifyURLs:                    true,
                    processConditionalComments:    true,
                    processScripts:                [ `application/ld+json` ],
                    removeEmptyAttributes:         true,
                    removeAttributeQuotes:         true,
                    quoteCharacter:                `"`,
                    removeOptionalTags:            true,
                    sortAttributes:                true,
                    sortClassName:                 true,
                    removeTagWhitespace:           false,
                },
            },
            JavaScript: {
                terser: {
                    compress: {
                        drop_console:         true,
                        drop_debugger:        true,
                        arguments:            true,
                        arrows:               true,
                        booleans:             true,
                        booleans_as_integers: true,
                        collapse_vars:        true,
                        comparisons:          true,
                        computed_props:       true,
                        conditionals:         true,
                        dead_code:            true,
                        directives:           true,
                        ecma:                 2020,
                        evaluate:             true,
                        expression:           true,
                        hoist_funs:           true,
                        hoist_props:          true,
                        if_return:            true,
                        inline:               true,
                        join_vars:            true,
                        keep_fargs:           false,
                        keep_infinity:        false,
                        loops:                true,
                        module:               true,
                        negate_iife:          true,
                        properties:           true,
                        passes:               3,
                        reduce_funcs:         true,
                        reduce_vars:          true,
                        sequences:            true,
                        side_effects:         true,
                        switches:             true,
                        toplevel:             true,
                        typeofs:              true,
                        keep_classnames:      false,
                        keep_fnames:          false,
                        ie8:                  false,
                    },
                    ecma:     2020,
                    mangle:   true,
                    module:   true,
                    enclose:  true,
                    safari10: false,
                    ie8:      false,
                    format:   {
                        comments:          false,
                        braces:            false,
                        ecma:              2020,
                        indent_level:      0,
                        inline_script:     true,
                        keep_numbers:      false,
                        keep_quoted_props: false,
                        quote_keys:        false,
                        quote_style:       0,
                        semicolons:        true,
                        safari10:          false,
                        shebang:           false,
                    },
                },
            },
            Image: {
                sharp: {
                    webp: {
                        quality:        75,
                        smartSubsample: true,
                        smartDeblock:   true,
                        nearLossless:   false,
                        alphaQuality:   75,
                        effort:         4,
                        lossless:       false,
                        mixed:          false,
                    },
                    avif: {
                        quality:           75,
                        effort:            4,
                        lossless:          false,
                    },
                    jpeg: {
                        quality:             75,
                        optimiseCoding:      true,
                        optimiseScans:       true,
                        optimizeCoding:      true,
                        optimizeScans:       true,
                        overshootDeringing:  true,
                        quantisationTable:   3,
                        trellisQuantisation: true,
                        progressive:         true,
                    },
                    png: {
                        quality:             75,
                        compressionLevel:    9,
                        adaptiveFiltering:   true,
                        progressive:         true,
                    },
                },
            },
            JSON: {
                space: 0,
            },
            SVG: {
                svgo: {
                    multipass:      true,
                    floatPrecision: 2,
                    datauri:        undefined,
                    js2svg:         {
                        indent: 0,
                        pretty: false,
                    },
                    plugins: [
                        {
                            name:   `cleanupAttrs`,
                            params: {
                                newlines: true,
                                trim:     true,
                                spaces:   true,
                            },
                        },
                        `cleanupEnableBackground`,
                        {
                            name:   `cleanupIds`,
                            params: {
                                remove: true,
                                minify: true,
                                force:  true,
                            },
                        },
                        {
                            name:   `cleanupListOfValues`,
                            params: {
                                floatPrecision: 3,
                                leadingZero:    true,
                                defaultPx:      true,
                                convertToPx:    true,
                            },
                        },
                        {
                            name:   `cleanupNumericValues`,
                            params: {
                                floatPrecision: 3,
                                leadingZero:    true,
                                defaultPx:      true,
                                convertToPx:    true,
                            },
                        },
                        `collapseGroups`,
                        {
                            name:   `convertColors`,
                            params: {
                                currentColor: false,
                                names2hex:    true,
                                rgb2hex:      true,
                                shorthex:     true,
                                shortname:    true,
                            },
                        },
                        `convertEllipseToCircle`,
                        `convertOneStopGradients`,
                        {
                            name:   `convertPathData`,
                            params: {
                                applyTransforms:        true,
                                applyTransformsStroked: true,
                                straightCurves:         true,
                                convertToQ:             true,
                                lineShorthands:         true,
                                convertToZ:             true,
                                curveSmoothShorthands:  true,
                                floatPrecision:         3,
                                transformPrecision:     5,
                                smartArcRounding:       true,
                                removeUseless:          true,
                                collapseRepeated:       true,
                                utilizeAbsolute:        true,
                                negativeExtraSpace:     true,
                                forceAbsolutePath:      false,
                                leadingZero:            true,
                                noSpaceAfterFlags:      true,
                            },
                        },
                        {
                            name:   `convertShapeToPath`,
                            params: {
                                convertArcs:    true,
                                floatPrecision: 3,
                            },
                        },
                        {
                            name:   `convertStyleToAttrs`,
                            params: {
                                keepImportant: false,
                            },
                        },
                        {
                            name:   `convertTransform`,
                            params: {
                                convertToShorts:    true,
                                degPrecision:       3,
                                floatPrecision:     3,
                                transformPrecision: 5,
                                matrixToTransform:  true,
                                shortTranslate:     true,
                                shortScale:         true,
                                shortRotate:        true,
                                removeUseless:      true,
                                collapseIntoOne:    true,
                            },
                        },
                        {
                            name:   `inlineStyles`,
                            params: {
                                onlyMatchedOnce:        true,
                                removeMatchedSelectors: true,
                            },
                        },
                        {
                            name:   `mergePaths`,
                            params: {
                                force:             false,
                                floatPrecision:    3,
                                noSpaceAfterFlags: true,
                            },
                        },
                        `mergeStyles`,
                        `minifyStyles`,
                        `removeComments`,
                        {
                            name:   `removeDesc`,
                            params: {
                                removeAny: true,
                            },
                        },
                        `removeDoctype`,
                        `removeEditorsNSData`,
                        `removeEmptyAttrs`,
                        `removeEmptyContainers`,
                        {
                            name:   `removeEmptyText`,
                            params: {
                                text:  true,
                                tspan: true,
                                tref:  true,
                            },
                        },
                        {
                            name:   `removeHiddenElems`,
                            params: {
                                isHidden:            true,
                                displayNone:         true,
                                opacity0:            true,
                                circleR0:            true,
                                ellipseRX0:          true,
                                ellipseRY0:          true,
                                rectWidth0:          true,
                                rectHeight0:         true,
                                patternWidth0:       true,
                                patternHeight0:      true,
                                imageWidth0:         true,
                                imageHeight0:        true,
                                pathEmptyD:          true,
                                polylineEmptyPoints: true,
                                polygonEmptyPoints:  true,
                            },
                        },
                        `removeMetadata`,
                        `removeNonInheritableGroupAttrs`,
                        `removeOffCanvasPaths`,
                        `removeRasterImages`,
                        `removeScriptElement`,
                        `removeTitle`,
                        {
                            name:   `removeUnknownsAndDefaults`,
                            params: {
                                unknownContent:            true,
                                unknownAttrs:              true,
                                defaultAttrs:              true,
                                defaultMarkupDeclarations: true,
                                uselessOverrides:          true,
                                keepDataAttrs:             true,
                                keepAriaAttrs:             true,
                                keepRoleAttr:              false,
                            },
                        },
                        `removeUnusedNS`,
                        `removeUselessDefs`,
                        `removeUselessStrokeAndFill`,
                        `removeXMLProcInst`,
                        {
                            name:   `removeXlink`,
                            params: {
                                includeLegacy: true,
                            },
                        },
                        `reusePaths`,
                        `sortAttrs`,
                        `sortDefsChildren`,
                    ],
                },
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
