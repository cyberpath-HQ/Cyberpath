/**
 * @import {Root} from 'mdast'
 */

import { visit } from 'unist-util-visit';
import {
    LINK_MAPPINGS, type LinkDefinition, type LinkMappings
} from '../data/auto-link-mappings';

/** Constant for zero/empty checks */
const ZERO = 0;

/** Constant for single increment */
const ONE = 1;

/** Constant for slice offset */
const SLICE_OFFSET = -1;

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
 * Options for URL resolution
 */
interface ResolveUrlOptions {
    definition: LinkDefinition
    baseUrl:    string
}

/**
 * Resolves a URL based on whether it's internal or external
 */
function resolveUrl(opts: ResolveUrlOptions): string {
    if (opts.definition.internal) {
        const base = opts.baseUrl.endsWith(`/`)
            ? opts.baseUrl.slice(ZERO, SLICE_OFFSET)
            : opts.baseUrl;
        const path = opts.definition.url.startsWith(`/`)
            ? opts.definition.url
            : `/${ opts.definition.url }`;
        return `${ base }${ path }`;
    }
    return opts.definition.url;
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
        const definition = state.mappings[term];
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
    const url = resolveUrl({
        definition: match_data.definition,
        baseUrl:    base_url,
    });

    const link_node: Record<string, unknown> = {
        type:     `link`,
        url,
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

        if (state.is_debug) {
            console.log(`[auto-link] Linked "${ m.term }" → ${ link_node.url }`);
        }

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

    if (opts.state.is_debug) {
        console.log(`[auto-link] Found ${ matches.length } matches in text`);
    }

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
        is_debug = false,
    } = options;

    const mappings: LinkMappings = {
        ...LINK_MAPPINGS,
        ...customMappings,
    };

    const exclude_set = new Set(excludeTerms.map((t) => t.toLowerCase()));

    const sorted_terms = Object.keys(mappings)
        .filter((term) => !exclude_set.has(term.toLowerCase()))
        .sort((a, b) => b.length - a.length);

    /**
     * @param {Root} tree
     * @returns {void}
     */
    /* eslint-disable @typescript-eslint/explicit-function-return-type */
    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
    return function transformer(tree: unknown, _file: unknown) {
        const linked_counts = new Map<string, number>();

        const state: ProcessingState = {
            mappings,
            sorted_terms,
            linked_counts,
            max_links: maxLinksPerTerm,
            base_url:  baseUrl,
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
    };
}
