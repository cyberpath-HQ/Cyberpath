/**
 * @import {Root} from 'mdast'
 */

import { visit } from 'unist-util-visit';

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
                    return;
                }

                // Extract link text
                let linkText = ``;
                if (children && children.length > 0) {
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

                console.log(`[utm] Modified: ${ url } → ${ parsedUrl.href }`);
            }
            catch (error) {
                // Silently skip malformed URLs (relative paths, etc.)
                // Only log if it's not a known relative path pattern
                if (!url.startsWith(`#`) && !url.startsWith(`/`)) {
                    console.warn(`[utm] Could not parse URL: ${ url }`);
                }
            }
        });
    };
}
