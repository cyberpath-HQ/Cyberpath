import { remark } from "remark";
import remarkMdx from "remark-mdx";
import type { Root } from "mdast";

/**
 * Convert MDX source into plain markdown without re-serializing the document.
 *
 * Re-parsing the whole document into a new mdast tree and stringifying it again
 * breaks the formatting: the stringifier escapes newlines introduced by the
 * transformation (`&#xA;`), reflows prose and can merge code fences with the
 * surrounding text. This module keeps the original source untouched and only
 * splices the ranges that actually have to change:
 *
 * - `import`/`export` statements and `{expressions}` are removed
 * - MDX components become their markdown equivalent (`Alert`/`InfoBox`/
 *   `FeatureCard` → blockquote, `FeatureGrid` → list, `Mermaid` → image)
 * - relative link and image targets are rewritten through `resolveTarget`
 *
 * Everything else (code fences, tables, inline formatting, line breaks) is
 * served exactly as it is written in the source file.
 */

const DIAGRAM_REPOSITORY_BASE = `https://raw.githubusercontent.com/cyberpath-HQ/cyberpath-exported-charts/refs/heads/main`;

/** Regex for the target part of a markdown link or image, anchored to the whole node. */
const LINK_TARGET_PATTERN = /^(!?\[[\s\S]*\]\()(<[^>]*>|[^\s)]*)((?:\s+(?:"[^"]*"|'[^']*'))?\s*\))$/;

const COMPONENTS_WITH_TITLE = new Set([
    `Alert`,
    `InfoBox`,
    `FeatureCard`,
]);

export interface MdxToMarkdownOptions {
    /** Post slug, used to build the URLs of the exported Mermaid diagrams. */
    fileSlug?: string

    /** Rewrites a link/image target. Returning `null` keeps the original target. */
    resolveTarget?: (target: string) => string | null
}

interface Edit {
    start: number
    end:   number
    text:  string
}

interface ConversionContext {
    fileSlug:      string
    resolveTarget: MdxToMarkdownOptions[`resolveTarget`]
    diagramIndex:  number
}

type AnyNode = Record<string, any>;

function rangeOf(node: AnyNode): { start: number
    end: number } | null {
    const start = node.position?.start?.offset;
    const end = node.position?.end?.offset;

    if (typeof start !== `number` || typeof end !== `number`) {
        return null;
    }

    return {
        start, end,
    };
}

/**
 * Apply non-overlapping edits expressed as offsets in `source`.
 *
 * Edits are applied from the end of the string so the offsets of the previous
 * ones stay valid.
 */
function applyEdits(source: string, edits: Array<Edit>): string {
    const sorted = [ ...edits ].sort((a, b) => b.start - a.start);

    let result = source;
    let limit = source.length;

    for (const edit of sorted) {
        if (edit.end > limit) {
            continue;
        }
        result = `${ result.slice(0, edit.start) }${ edit.text }${ result.slice(edit.end) }`;
        limit = edit.start;
    }

    return result;
}

function attributeValue(node: AnyNode, name: string): string {
    const attribute = (node.attributes ?? []).find((entry: AnyNode) => {
        return entry.name === name && entry.type === `mdxJsxAttribute`;
    });

    const value = attribute?.value;

    if (typeof value === `string`) {
        return value;
    }

    if (value && typeof value === `object` && typeof value.value === `string`) {
        return value.value;
    }

    return ``;
}

/**
 * Remove the common indentation introduced by the JSX wrapper so quoted
 * content reads like normal markdown.
 *
 * Only the continuation lines are considered: the first line of the content
 * never carries the wrapper indentation.
 */
function dedent(markdown: string): string {
    const lines = markdown.split(`\n`);
    const indents = lines
        .slice(1)
        .filter((line) => line.trim() !== ``)
        .map((line) => /^[ \t]*/.exec(line)?.[0].length ?? 0);

    if (indents.length === 0) {
        return markdown;
    }

    const common = Math.min(...indents);

    if (common === 0) {
        return markdown;
    }

    return lines
        .map((line, index) => {
            return index > 0 && line.trim() !== `` ? line.slice(common) : line;
        })
        .join(`\n`);
}

function blockquote(markdown: string): string {
    return markdown
        .trim()
        .split(`\n`)
        .map((line) => {
            return line.trim() === `` ? `>` : `> ${ line }`;
        })
        .join(`\n`);
}

function cardToListItem(title: string, body: string): string {
    const trimmed = body.trim();

    if (trimmed === ``) {
        return `- **${ title }**`;
    }

    const [
        first,
        ...rest
    ] = trimmed.split(`\n`);

    const continuation = rest
        .map((line) => {
            return line.trim() === `` ? `\n` : `\n  ${ line }`;
        })
        .join(``);

    return `- **${ title }**: ${ first }${ continuation }`;
}

/**
 * Render the children of an MDX element using their original source, applying
 * nested conversions (so a component inside a component still becomes
 * markdown instead of being dropped or leaked as JSX).
 */
function renderChildren(node: AnyNode, source: string, context: ConversionContext): string {
    const children: Array<AnyNode> = node.children ?? [];
    const first = children[0];
    const last = children[children.length - 1];

    if (!first || !last) {
        return ``;
    }

    const start = first.position?.start?.offset;
    const end = last.position?.end?.offset;

    if (typeof start !== `number` || typeof end !== `number`) {
        return ``;
    }

    const slice = source.slice(start, end);
    const edits = children
        .flatMap((child) => collectEdits(child, source, context))
        .filter((edit) => edit.start >= start && edit.end <= end)
        .map((edit) => {
            return {
                start: edit.start - start,
                end:   edit.end - start,
                text: edit.text,
            };
        });

    return dedent(applyEdits(slice, edits));
}

function linkEdits(node: AnyNode, source: string, context: ConversionContext): Array<Edit> {
    const children: Array<AnyNode> = node.children ?? [];
    const edits = children.flatMap((child) => collectEdits(child, source, context));
    const range = rangeOf(node);

    if (!range) {
        return edits;
    }

    const raw = source.slice(range.start, range.end);
    const match = LINK_TARGET_PATTERN.exec(raw);

    if (!match) {
        return edits;
    }

    const rawTarget = match[2];
    const target = rawTarget.startsWith(`<`) && rawTarget.endsWith(`>`)
        ? rawTarget.slice(1, -1)
        : rawTarget;

    const resolved = context.resolveTarget?.(target) ?? null;

    if (resolved === null) {
        return edits;
    }

    const urlStart = range.start + match[1].length;
    const urlEnd = urlStart + rawTarget.length;

    return [
        ...edits,
        {
            start: urlStart,
            end:   urlEnd,
            text:  rawTarget.startsWith(`<`) ? `<${ resolved }>` : resolved,
        },
    ];
}

function jsxEdits(node: AnyNode, source: string, context: ConversionContext): Array<Edit> {
    const range = rangeOf(node);

    if (!range) {
        return [];
    }

    const replace = (text: string): Array<Edit> => {
        return [
            {
                start: range.start,
                end:   range.end,
                text,
            },
        ];
    };

    const name: string = node.name ?? ``;
    const title = attributeValue(node, `title`);

    if (name === `Mermaid`) {
        context.diagramIndex += 1;
        const suffix = context.diagramIndex === 1 ? `` : `%20(${ context.diagramIndex - 1 })`;

        return replace(`![Chart](${ DIAGRAM_REPOSITORY_BASE }/${ context.fileSlug }/diagram${ suffix }.png)`);
    }

    if (name === `Newsletter`) {
        return replace(``);
    }

    if (COMPONENTS_WITH_TITLE.has(name)) {
        const body = renderChildren(node, source, context);
        const variant = name === `Alert`
            ? attributeValue(node, `variant`) || attributeValue(node, `type`)
            : ``;
        const heading = variant === ``
            ? `**${ title }**`
            : `**${ title }** (${ variant.toUpperCase() })`;

        return replace(blockquote(`${ heading }\n\n${ body }`));
    }

    if (name === `FeatureGrid`) {
        const items = (node.children ?? [])
            .filter((child: AnyNode) => child.name === `FeatureCard`)
            .map((card: AnyNode) => {
                const body = renderChildren(card, source, context);

                return cardToListItem(attributeValue(card, `title`), body);
            });

        return replace(items.join(`\n`));
    }

    // Unknown component: keep its content (already markdown in the source) and
    // drop the wrapper, or remove it entirely when it is self closing.
    const inner = renderChildren(node, source, context).trim();

    return replace(inner);
}

function collectEdits(node: AnyNode, source: string, context: ConversionContext): Array<Edit> {
    const range = rangeOf(node);

    switch (node.type) {
        case `mdxjsEsm`:
        case `mdxTextExpression`:
        case `mdxFlowExpression`:
            return range
                ? [
                    {
                        start: range.start,
                        end:   range.end,
                        text:  ``,
                    },
                ]
                : [];

        case `mdxJsxFlowElement`:
        case `mdxJsxTextElement`:
            return jsxEdits(node, source, context);

        case `link`:
        case `image`:
            return linkEdits(node, source, context);

        default:
            return (node.children ?? []).flatMap((child: AnyNode) => collectEdits(child, source, context));
    }
}

/**
 * Collapse runs of blank lines left behind by removed blocks while leaving the
 * content of fenced code blocks byte for byte untouched.
 */
function collapseBlankLines(markdown: string): string {
    const lines = markdown.split(`\n`);
    const output: Array<string> = [];

    let fence: { character: string
        length:                 number } | null = null;

    for (const line of lines) {
        const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line);

        if (fence) {
            output.push(line);

            const closing = /^\s{0,3}(`{3,}|~{3,})\s*$/.exec(line);

            if (
                closing &&
                closing[1][0] === fence.character &&
                closing[1].length >= fence.length
            ) {
                fence = null;
            }

            continue;
        }

        if (fenceMatch) {
            fence = {
                character: fenceMatch[1][0],
                length:    fenceMatch[1].length,
            };
            output.push(line);
            continue;
        }

        if (line.trim() === ``) {
            if (output.length === 0 || output[output.length - 1] === ``) {
                continue;
            }
            output.push(``);
            continue;
        }

        output.push(line);
    }

    return `${ output.join(`\n`).trim() }\n`;
}

/**
 * Convert an MDX document into plain markdown, preserving the original
 * formatting of everything that does not have to change.
 */
export async function mdxToMarkdown(source: string, options: MdxToMarkdownOptions = {}): Promise<string> {
    const tree = remark()
        .use(remarkMdx)
        .parse(source) as unknown as Root;

    const context: ConversionContext = {
        fileSlug:      options.fileSlug ?? ``,
        resolveTarget: options.resolveTarget,
        diagramIndex:  0,
    };

    const edits = collectEdits(tree as unknown as AnyNode, source, context);

    return collapseBlankLines(applyEdits(source, edits));
}
