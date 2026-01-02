#!/usr/bin/env node
/**
 * Generate Astro redirect configuration from post aliases
 * This script reads post-aliases.json and generates JavaScript code
 * for Astro's redirects configuration
 */

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALIASES_FILE = path.join(__dirname, `..`, `src`, `data`, `post-aliases.json`);

async function generateRedirects() {
    if (!existsSync(ALIASES_FILE)) {
        console.log(`{}`);
        return {};
    }

    const content = await readFile(ALIASES_FILE, `utf-8`);
    const aliases = JSON.parse(content);

    const redirects = {};

    for (const [
        slug,
        alias,
    ] of Object.entries(aliases)) {
        redirects[`/p/${ alias }`] = {
            status:      301,
            destination: `/blog/${ slug }`,
        };
    }

    return redirects;
}

// CLI interface
if (import.meta.url === `file://${ process.argv[1] }`) {
    generateRedirects()
        .then((redirects) => {
            console.log(JSON.stringify(redirects, null, 2));
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export {
    generateRedirects
};
