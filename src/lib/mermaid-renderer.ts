/**
 * Server-side Mermaid rendering utility
 * Generates SVG diagrams at build time using @mermaid-js/mermaid-cli
 */

import {
    writeFile,
    unlink,
    readFile
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { run } from "@mermaid-js/mermaid-cli";

const RANDOM_BYTES = 8;

/**
 * Renders a Mermaid diagram to SVG at build time
 * @param code - The Mermaid diagram code
 * @returns The rendered SVG as a string
 */
export async function renderMermaidToSVG(code: string): Promise<string> {
    // Generate temporary file paths
    const tmpId = randomBytes(RANDOM_BYTES).toString(`hex`);
    const inputPath = join(tmpdir(), `mermaid-${ tmpId }.mmd`);
    const outputPath = join(tmpdir(), `mermaid-${ tmpId }.svg`);

    try {

        // Write the mermaid code to a temporary file
        await writeFile(inputPath, code, `utf-8`);

        // Render using mermaid-cli
        await run(
            inputPath,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            outputPath as `${ string }.svg`,
            {
                outputFormat:    `svg`,
                parseMMDOptions: {
                    backgroundColor: `transparent`,
                    mermaidConfig:   {
                        theme:      `default`,
                        fontFamily: `Inter, system-ui, sans-serif`,
                    },
                },
            }
        );

        // Read the generated SVG
        const svg = await readFile(outputPath, `utf-8`);

        // Clean up temporary files
        await Promise.all([
            unlink(inputPath),
            unlink(outputPath),
        ]);

        return svg;
    }
    catch (error) {

        // Clean up temporary files on error
        try {
            await Promise.all([
                unlink(inputPath),
                unlink(outputPath),
            ]);
        }
        catch {

            // Ignore cleanup errors
        }

        throw new Error(`Mermaid rendering failed: ${ error instanceof Error ? error.message : String(error) }`);
    }
}
