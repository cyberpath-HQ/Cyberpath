/**
 * @import {Root} from 'mdast'
 */

import { visit } from 'unist-util-visit';
import {
    getLinkMappings, type LinkDefinition, type LinkMappings
} from '../data/auto-link-mappings';
import path from 'path';

const LINK_MAPPINGS = await getLinkMappings();

/** Constant for zero/empty checks */
const ZERO = 0;

/** Constant for single increment */
const ONE = 1;

/**
 * Configuration options for the auto-link plugin
 */
export interface AutoLinkPluginOptions {
    /** Base URL for internal links (default: 'https://cyberpath-hq.com') */
    baseUrl?: string

    /** Maximum times to link the same term per document (default: 1) */
    maxLinksPerTerm?: number

    /** Custom link mappings to add or override defaults */
    customMappings?: LinkMappings

    /** Terms to exclude from auto-linking */
    excludeTerms?: Array<string>

    /** URLs to exclude from auto-linking (e.g., current page URL to prevent self-references) */
    excludeUrls?: Array<string>

    /** Enable debug logging (default: false) */
    is_debug?: boolean
}

/**
 * Represents a match found in the text
 */
interface FoundMatch {
    term:       string
    definition: LinkDefinition
    start:      number
    end:        number
}

/**
 * Options for pattern building
 */
interface PatternOptions {
    term:              string
    is_case_sensitive: boolean
    is_whole_word:     boolean
}

/**
 * Builds a regex pattern for matching a term
 */
function buildPattern(opts: PatternOptions): RegExp {
    const escaped = opts.term.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    const pattern = opts.is_whole_word ? `\\b${ escaped }\\b` : escaped;
    const flags = opts.is_case_sensitive ? `g` : `gi`;
    return new RegExp(pattern, flags);
}

/**
 * Checks if a URL is internal based on its format
 * Internal URLs start with '/' or have no protocol
 */
function isInternalUrl(url: string): boolean {
    return url.startsWith(`/`) || (!url.startsWith(`http://`) && !url.startsWith(`https://`));
}

/**
 * Options for URL resolution
 */
interface ResolveUrlOptions {
    url:     string
    baseUrl: string
}

/**
 * Resolves a URL to its full form using URL objects
 */
function resolveUrl(opts: ResolveUrlOptions): URL {
    if (isInternalUrl(opts.url)) {
        // For internal URLs, combine with base
        const base = new URL(opts.baseUrl);
        return new URL(opts.url, base);
    }

    // For external URLs, return as-is
    return new URL(opts.url);
}

/**
 * Resolves alias references to get the actual definition
 */
function resolveDefinition(
    term: string,
    mappings: LinkMappings,
    visited = new Set<string>()
): LinkDefinition | null {
    if (visited.has(term)) {
        // Circular reference detected
        return null;
    }

    visited.add(term);

    const definition = mappings[term];
    if (!definition) {
        return null;
    }

    // If it's an alias, resolve it
    if (definition.aliasOf) {
        const resolvedDef = resolveDefinition(definition.aliasOf, mappings, visited);
        if (!resolvedDef) {
            return null;
        }

        // Merge with any override properties from the alias
        return {
            ...resolvedDef,
            caseSensitive: definition.caseSensitive ?? resolvedDef.caseSensitive,
            wholeWord:     definition.wholeWord ?? resolvedDef.wholeWord,
        };
    }

    return definition;
}

/**
 * Checks if a range overlaps with any existing matches
 */
function checkOverlaps(
    start: number,
    end: number,
    matches: Array<FoundMatch>
): boolean {
    return matches.some(
        (m) => (start >= m.start && start < m.end) ||
               (end > m.start && end <= m.end) ||
               (start <= m.start && end >= m.end)
    );
}

/**
 * State for processing text nodes
 */
interface ProcessingState {
    mappings:      LinkMappings
    sorted_terms:  Array<string>
    linked_counts: Map<string, number>
    max_links:     number
    base_url:      string
    is_debug:      boolean
}

/**
 * Finds all matches in a text string
 */
function findMatches(text: string, state: ProcessingState): Array<FoundMatch> {
    const matches: Array<FoundMatch> = [];

    for (const term of state.sorted_terms) {
        const definition = resolveDefinition(term, state.mappings);
        if (!definition) {
            continue;
        }

        const term_key = term.toLowerCase();
        const count = state.linked_counts.get(term_key) ?? ZERO;

        if (count >= state.max_links) {
            continue;
        }

        const is_case_sensitive = definition.caseSensitive ?? false;
        const is_whole_word = definition.wholeWord ?? true;
        const regex = buildPattern({
            term,
            is_case_sensitive,
            is_whole_word,
        });

        let match_result: RegExpExecArray | null;
        while ((match_result = regex.exec(text)) !== null) {
            const start = match_result.index;
            const end = start + match_result[ZERO].length;

            if (!checkOverlaps(start, end, matches)) {
                matches.push({
                    term:       match_result[ZERO],
                    definition,
                    start,
                    end,
                });

                state.linked_counts.set(term_key, count + ONE);
                if (count + ONE >= state.max_links) {
                    break;
                }
            }
        }
    }

    return matches;
}

/**
 * Creates text node
 */
function createTextNode(value: string): Record<string, unknown> {
    return {
        type: `text`,
        value,
    };
}

/**
 * Creates link node
 */
function createLinkNode(
    match_data: FoundMatch,
    base_url: string
): Record<string, unknown> {
    if (!match_data.definition.url) {
        throw new Error(`Link definition must have a URL: ${ match_data.term }`);
    }

    const resolved_url = resolveUrl({
        url:     match_data.definition.url,
        baseUrl: base_url,
    });

    const link_node: Record<string, unknown> = {
        type:     `link`,
        url:      resolved_url.href,
        children: [ createTextNode(match_data.term) ],
    };

    if (match_data.definition.title) {
        link_node.title = match_data.definition.title;
    }

    return link_node;
}

/**
 * Builds new children from matches
 */
function buildChildren(
    text: string,
    matches: Array<FoundMatch>,
    state: ProcessingState
): Array<Record<string, unknown>> {
    const new_children: Array<Record<string, unknown>> = [];
    let last_index = ZERO;

    for (const m of matches) {
        if (m.start > last_index) {
            new_children.push(createTextNode(text.slice(last_index, m.start)));
        }

        const link_node = createLinkNode(m, state.base_url);
        new_children.push(link_node);

        last_index = m.end;
    }

    if (last_index < text.length) {
        new_children.push(createTextNode(text.slice(last_index)));
    }

    return new_children;
}

/**
 * Options for processing a text node
 */
interface ProcessNodeOptions {
    node:   Record<string, unknown>
    index:  number
    parent: Record<string, unknown>
    state:  ProcessingState
}

/**
 * Processes a text node
 */
function processNode(opts: ProcessNodeOptions): void {
    const text = String(opts.node.value ?? ``);
    if (!text || text.trim().length === ZERO) {
        return;
    }

    const matches = findMatches(text, opts.state);

    if (matches.length === ZERO) {
        return;
    }

    matches.sort((a, b) => a.start - b.start);

    const new_children = buildChildren(text, matches, opts.state);
    const {
        children,
    } = opts.parent;
    if (Array.isArray(children)) {
        children.splice(opts.index, ONE, ...new_children);
    }
}

/**
 * Remark plugin that automatically links cybersecurity terms to relevant URLs.
 *
 * @param options - Configuration options
 * @returns Transformer function
 *
 * @example
 * ```
 * import { remark } from 'remark'
 * import remarkAutoLink from './auto-link-remark-plugin.js'
 *
 * const file = await remark()
 *   .use(remarkAutoLink, {
 *     baseUrl: 'https://cyberpath-hq.com',
 *     maxLinksPerTerm: 1
 *   })
 *   .process(markdown)
 * ```
 */
export default function remarkAutoLink(options: AutoLinkPluginOptions = {}) {
    const {
        baseUrl = `https://cyberpath-hq.com`,
        maxLinksPerTerm = ONE,
        customMappings = {},
        excludeTerms = [],
        excludeUrls = [],
        is_debug = false,
    } = options;

    const mappings: LinkMappings = {
        ...LINK_MAPPINGS,
        ...customMappings,
    };

    const exclude_set = new Set(excludeTerms.map((t) => t.toLowerCase()));

    /**
     * @param {Root} tree
     * @returns {void}
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    return function transformer(tree: unknown, file: any): void {
        const historyLength = file.history?.length ?? ZERO;
        const filename = path.basename(
            file.history?.[historyLength - ONE] ?? `unknown`
        ).replace(/\.(md|mdx)$/, ``);
        const linked_counts = new Map<string, number>();

        const current_page_url = `/blog/${ filename }`;

        // Get current page URL from context to prevent self-references
        const all_exclude_urls = [
            ...excludeUrls,
            current_page_url,
        ];
        const exclude_urls_set = new Set(all_exclude_urls.map((u) => u.toLowerCase()));

        // Filter out terms that point to excluded URLs
        const filtered_mappings: LinkMappings = {};
        for (const [
            term,
            def,
        ] of Object.entries(mappings)) {
            const resolved_def = resolveDefinition(term, mappings);
            if (resolved_def?.url) {
                const normalized_url = resolved_def.url.toLowerCase();
                if (!exclude_urls_set.has(normalized_url)) {
                    filtered_mappings[term] = def;
                }
            }
        }

        const sorted_terms = Object.keys(filtered_mappings)
            .filter((term) => !exclude_set.has(term.toLowerCase()))
            .sort((a, b) => b.length - a.length);

        const state: ProcessingState = {
            mappings:      filtered_mappings,
            sorted_terms,
            linked_counts,
            max_links:     maxLinksPerTerm,
            base_url:      baseUrl,
            is_debug,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion
        const tree_node = tree as any;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        visit(tree_node, `text`, (node: any, index: number | undefined, parent: any) => {
            if (!parent || parent.type === `link`) {
                return;
            }

            if (index === undefined || !Array.isArray(parent.children)) {
                return;
            }

            processNode({
                node,
                index,
                parent,
                state,
            });
        });

        // Calculate total links added
        const totalLinksAdded = Array.from(linked_counts.values()).reduce((sum, count) => sum + count, ZERO);
        const uniqueTermsLinked = linked_counts.size;

        // Print summary if any links were added
        if (totalLinksAdded > ZERO) {
            console.group(`\n[Auto-Link Plugin]`);
            console.log(`Page URL: ${ current_page_url }`);
            console.log(`Links created: ${ totalLinksAdded }`);
            console.log(`Unique terms linked: ${ uniqueTermsLinked }`);

            if (linked_counts.size > ZERO) {
                console.group(`Link distribution by term:`);
                const sortedCounts = Array.from(linked_counts.entries())
                    .sort((a, b) => b[ONE] - a[ONE]);
                for (const [
                    term,
                    count,
                ] of sortedCounts) {
                    console.log(`• "${ term }": ${ count }x`);
                }
                console.groupEnd();
            }
            console.groupEnd();
        }
    };
}
