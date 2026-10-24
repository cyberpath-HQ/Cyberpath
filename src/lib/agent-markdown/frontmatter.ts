import type { FrontmatterValue } from "./types";

function serializeValue(value: FrontmatterValue): string {
    if (Array.isArray(value)) {
        return `[${ value.map((item) => serializeValue(item)).join(`, `) }]`;
    }
    if (typeof value === `string`) {
        // JSON strings are valid YAML double quoted scalars, which keeps the
        // serialization free of escaping bugs for quotes, colons and newlines.
        return JSON.stringify(value);
    }
    return String(value);
}

/**
 * Serialize a frontmatter object into a YAML block.
 *
 * Returns an empty string when there is nothing to serialize, so callers can
 * concatenate the result with the body without special casing.
 */
export function serializeFrontmatter(frontmatter: Record<string, FrontmatterValue | undefined>): string {
    const lines: Array<string> = [];

    for (const [
        key,
        value,
    ] of Object.entries(frontmatter)) {
        if (value === undefined) {
            continue;
        }
        if (Array.isArray(value) && value.length === 0) {
            continue;
        }
        if (typeof value === `string` && value.trim() === ``) {
            continue;
        }
        lines.push(`${ key }: ${ serializeValue(value) }`);
    }

    if (lines.length === 0) {
        return ``;
    }

    return `---\n${ lines.join(`\n`) }\n---\n\n`;
}
