import { visit } from 'unist-util-visit';
import { remove } from 'unist-util-remove';
import type { Root } from 'mdast';
import type { VFile } from 'vfile';

export default function remarkToPlainMarkdown(options: { fileSlug?: string } = {}) {
    const {
        fileSlug = ``,
    } = options;
    return function transformer(tree: Root, _file: VFile): void {
        let diagramIndex = 0;
        const getPlainText = (node: any): string => {
            if (node.type === `text`) {
                return node.value;
            }
            if (node.children) {
                return node.children.map(getPlainText).join(``);
            }
            return ``;
        };

        const standardTypes = new Set([
            `root`,
            `heading`,
            `text`,
            `paragraph`,
            `blockquote`,
            `list`,
            `listItem`,
            `code`,
            `thematicBreak`,
            `emphasis`,
            `strong`,
            `delete`,
            `inlineCode`,
            `break`,
            `link`,
            `image`,
            `linkReference`,
            `imageReference`,
            `footnote`,
            `footnoteReference`,
            `footnoteDefinition`,
            `table`,
            `tableRow`,
            `tableCell`,
            `definition`,
        ]);

        const mdxTypes = new Set([
            `mdxjsEsm`,
            `mdxJsxTextElement`,
            `mdxJsxFlowElement`,
            `mdxTextExpression`,
            `mdxFlowExpression`,
        ]);

        // First, remove non-standard non-MDX nodes
        remove(tree, (node) => !standardTypes.has(node.type) && !mdxTypes.has(node.type));

        // Then, visit and customize MDX nodes
        visit(tree, (node, index, parent) => {
            if (node.type === `mdxjsEsm` || node.type === `mdxTextExpression` || node.type === `mdxFlowExpression`) {
                if (parent && typeof index === `number`) {
                    parent.children.splice(index, 1);
                }
                return;
            }
            if (mdxTypes.has(node.type)) {
                const mdxNode = node as any;
                if (mdxNode.name === `Mermaid`) {
                    diagramIndex++;
                    const suffix = diagramIndex === 1 ? `` : `%20(${ diagramIndex - 1 })`;
                    const url = `https://raw.githubusercontent.com/cyberpath-HQ/cyberpath-exported-charts/refs/heads/main/${ fileSlug }/diagram${ suffix }.png`;
                    const nodes = [
                        {
                            type:  `text`,
                            value: `\n\n`,
                        },
                        {
                            type:  `image`,
                            url,
                            alt:   `Chart`,
                            title: `Chart`,
                        },
                        {
                            type:  `text`,
                            value: `\n\n`,
                        },
                    ];
                    if (parent && typeof index === `number`) {
                        (parent.children as any).splice(index, 1, ...nodes);
                    }
                }
                else if (mdxNode.name === `Newsletter`) {
                    if (parent && typeof index === `number`) {
                        parent.children.splice(index, 1);
                    }
                }
                else if (mdxNode.name === `Alert`) {
                    const variant = mdxNode.attributes?.find((attr: any) => attr.name === `variant`)?.value ?? ``;
                    const title = mdxNode.attributes?.find((attr: any) => attr.name === `title`)?.value ?? ``;
                    const body = mdxNode.children ? mdxNode.children.map(getPlainText).join(` `) : ``;
                    const newNode = {
                        type:     `blockquote`,
                        children: [
                            {
                                type:     `paragraph`,
                                children: [
                                    {
                                        type:     `emphasis`,
                                        children: [
                                            {
                                                type:  `text`,
                                                value: `${ variant.toUpperCase() }`,
                                            },
                                        ],
                                    },
                                    {
                                        type:  `text`,
                                        value: `\n`,
                                    },
                                    {
                                        type:     `strong`,
                                        children: [
                                            {
                                                type:  `text`,
                                                value: `${ title }`,
                                            },
                                        ],
                                    },
                                    {
                                        type:  `text`,
                                        value: `:\n${ body }`,
                                    },
                                ],
                            },
                        ],
                    };
                    if (parent && typeof index === `number`) {
                        (parent.children as Array<unknown>)[index] = newNode;
                    }
                }
                else if (mdxNode.name === `InfoBox`) {
                    const title = mdxNode.attributes?.find((attr: any) => attr.name === `title`)?.value ?? ``;
                    const body = mdxNode.children ? mdxNode.children.map(getPlainText).join(` `) : ``;
                    const newNode = {
                        type:     `blockquote`,
                        children: [
                            {
                                type:     `paragraph`,
                                children: [
                                    {
                                        type:     `strong`,
                                        children: [
                                            {
                                                type:  `text`,
                                                value: title,
                                            },
                                        ],
                                    },
                                    {
                                        type:  `text`,
                                        value: `\n${ body }`,
                                    },
                                ],
                            },
                        ],
                    };
                    if (parent && typeof index === `number`) {
                        (parent.children as Array<unknown>)[index] = newNode;
                    }
                }
                else if (mdxNode.name === `FeatureCard`) {
                    const title = mdxNode.attributes?.find((attr: any) => attr.name === `title`)?.value ?? ``;
                    if (parent?.type === `mdxJsxFlowElement` && (parent as any).name === `FeatureGrid`) {
                        // inside FeatureGrid, will be handled by FeatureGrid
                        return;
                    }

                    // outside, transform to blockquote
                    const content = mdxNode.children ?? [];
                    const newNode = {
                        type:     `blockquote`,
                        children: [
                            {
                                type:     `paragraph`,
                                children: [
                                    {
                                        type:     `strong`,
                                        children: [
                                            {
                                                type:  `text`,
                                                value: title,
                                            },
                                        ],
                                    },
                                    ...content,
                                ],
                            },
                        ],
                    };
                    if (parent && typeof index === `number`) {
                        (parent.children as Array<unknown>)[index] = newNode;
                    }

                }
                else if (mdxNode.name === `FeatureGrid`) {
                    // transform to list
                    const listItems = (mdxNode.children ?? []).filter((child: any) => child.name === `FeatureCard`).map((card: any) => {
                        const title = card.attributes?.find((attr: any) => attr.name === `title`)?.value ?? ``;
                        const body = card.children ? card.children.map(getPlainText).join(` `) : ``;
                        return {
                            type:     `listItem`,
                            children: [
                                {
                                    type:     `paragraph`,
                                    children: [
                                        {
                                            type:     `strong`,
                                            children: [
                                                {
                                                    type:  `text`,
                                                    value: title,
                                                },
                                            ],
                                        },
                                        {
                                            type:  `text`,
                                            value: `: ${ body }`,
                                        },
                                    ],
                                },
                            ],
                        };
                    });
                    const newNode = {
                        type:     `list`,
                        ordered:  false,
                        children: listItems,
                    };
                    if (parent && typeof index === `number`) {
                        (parent.children as Array<unknown>)[index] = newNode;
                    }
                }
                else {
                    // other MDX JSX, remove
                    if (parent && typeof index === `number`) {
                        parent.children.splice(index, 1);
                    }
                }
            }
        });

        // Insert newlines between blocks to fix concatenation
        const isBlock = (node: any): boolean => [
            `heading`,
            `paragraph`,
            `blockquote`,
            `list`,
            `code`,
            `thematicBreak`,
            `table`,
        ].includes(node.type);
        visit(tree, (node: any) => {
            if (node.children) {
                for (let i = node.children.length - 1; i > 0; i--) {
                    const current = node.children[i];
                    const prev = node.children[i - 1];
                    if (isBlock(prev) && isBlock(current)) {
                        node.children.splice(i, 0, {
                            type:  `text`,
                            value: `\n\n`,
                        });
                    }
                }
            }
        });

        // Merge text lines within paragraphs to single lines
        const visitParagraphs = (node: any, ancestors: Array<any> = []): void => {
            if (node.type === `paragraph` && node.children) {
                const HAS_BLOCKQUOTE_OR_TABLE_ANCESTOR = ancestors.some(
                    (ancestor: any) => ancestor.type === `blockquote` || ancestor.type === `table` || ancestor.type === `tableRow`
                );
                const is_table = node.children.some(
                    (child: any) => child.type === `table` ||
                        child.type === `tableRow` ||
                        child.type === `tableCell` ||
                        child.value?.split(`|`).length >= 3
                );
                if (!HAS_BLOCKQUOTE_OR_TABLE_ANCESTOR && !is_table) {
                    for (const child of node.children) {
                        if (child.type === `text` && child.value.includes(`\n`)) {
                            child.value = child.value.replace(/\n/g, ` `);
                        }
                    }
                }
            }
            if (node.children) {
                for (const child of node.children) {
                    visitParagraphs(child, [
                        ...ancestors,
                        node,
                    ]);
                }
            }
        };
        visitParagraphs(tree);
    };
}
