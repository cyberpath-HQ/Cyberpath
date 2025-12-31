/**
 * @import {Root} from 'mdast'
 */

import { visit } from 'unist-util-visit';
import path from 'path';

/** Constant for zero/empty checks */
const ZERO = 0;

/** Constant for single increment */
const ONE = 1;

/**
 * Configuration options for UTM parameter injection
 */
export interface UtmPluginOptions {
    /** Base URL for resolving relative links (default: 'https://cyberpath-hq.com') */
    baseUrl?:        string

    /** UTM source parameter (default: extracted from baseUrl domain) */
    source?:         string

    /** UTM medium parameter (default: 'blog') */
    medium?:         string

    /** Field name from vfile.data to use for utm_campaign (default: 'title') */
    campaignField?:  string

    /** Comma-separated domains to exclude from UTM injection */
    excludeDomains?: Array<string>
}

/**
 * Remark plugin that injects UTM parameters into all links in markdown documents.
 *
 * @param {UtmPluginOptions} [options] Configuration options
 * @returns {Function} Transformer function
 *
 * @example
 * ```
 * import {remark} from 'remark'
 * import {remarkUtmParams} from './plugin.js'
 *
 * const file = await remark()
 *   .use(remarkUtmParams, {
 *     baseUrl: 'https://cyberpath-hq.com',
 *     source: 'cyberpath-hq.com',
 *     medium: 'blog',
 *     campaignField: 'title'
 *   })
 *   .process(markdown)
 * ```
 */
export default function remarkUtmParams(options: UtmPluginOptions = {}) {
    const {
        baseUrl = `https://cyberpath-hq.com`,
        source = new URL(baseUrl).hostname,
        medium = `blog`,
        campaignField = `title`,
        excludeDomains = [],
    } = options;

    /**
   * @param {Root} tree
   * @returns {void}
   */
    return function transformer(tree: unknown, file: any) {
        const campaign = String(file.data.astro.frontmatter?.[campaignField] ?? `blog-post`);
        const excludeSet = new Set(excludeDomains);
        const historyLength = file.history?.length ?? ZERO;
        const filename = file.history?.[historyLength - ONE] ?? `unknown`;
        const pageUrl = `/blog/${ path.basename(filename).replace(/\.(md|mdx)$/, ``) }`;

        // Statistics tracking
        let linksModified = ZERO;
        let linksSkipped = ZERO;
        let linksErrored = ZERO;

        visit(tree, `link`, (node: any) => {
            const {
                url, children,
            } = node;

            try {
                // Resolve relative URLs with baseUrl context
                const parsedUrl = new URL(url, baseUrl);
                const {
                    hostname,
                } = parsedUrl;

                // Skip excluded domains
                if (hostname && excludeSet.has(hostname)) {
                    linksSkipped++;
                    return;
                }

                // Extract link text
                let linkText = ``;
                if (children && children.length > ZERO) {
                    linkText = children
                        .filter((child: any) => child.type === `text`)
                        .map((child: any) => child.value)
                        .join(``);
                }

                // Build or update search parameters
                const params = new URLSearchParams(parsedUrl.search);
                params.set(`utm_source`, source);
                params.set(`utm_medium`, medium);
                params.set(`utm_campaign`, campaign);
                if (linkText) {
                    params.set(`utm_content`, linkText);
                }

                parsedUrl.search = params.toString();
                node.url = parsedUrl.href;
                linksModified++;
            }
            catch (_error) {
                // Silently skip malformed URLs (relative paths, etc.)
                // Only log if it's not a known relative path pattern
                if (!url.startsWith(`#`) && !url.startsWith(`/`)) {
                    linksErrored++;
                }
            }
        });

        // Print summary if any modifications were made
        if (linksModified > ZERO || linksSkipped > ZERO || linksErrored > ZERO) {
            console.group(`\n[UTM Parameters Plugin]`);
            console.log(`Page URL: ${ pageUrl }`);
            console.log(`Links enhanced with UTM parameters: ${ linksModified }`);
            if (linksSkipped > ZERO) {
                console.log(`Links skipped (excluded domains): ${ linksSkipped }`);
            }
            if (linksErrored > ZERO) {
                console.log(`Links with parse errors: ${ linksErrored }`);
            }
            console.group(`Campaign Details`);
            console.log(`Name: ${ campaign }`);
            console.log(`Source: ${ source }`);
            console.log(`Medium: ${ medium }`);
            console.groupEnd();
            console.groupEnd();
        }
    };
}
