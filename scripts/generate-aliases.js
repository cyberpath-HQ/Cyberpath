#!/usr/bin/env node
/**
 * Generate and manage short URL aliases for blog posts
 * Aliases are 5-character unique identifiers that persist across changes
 */

import {
    readFile, writeFile
} from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALIASES_FILE = path.join(__dirname, `..`, `src`, `data`, `post-aliases.json`);
const BLOG_DIR = path.join(__dirname, `..`, `src`, `content`, `blog`);
const ALIAS_LENGTH = 5;

/**
 * Generate a random N-character alias
 */
function generateAlias(length = ALIAS_LENGTH) {
    const chars = `abcdefghijklmnopqrstuvwxyz0123456789`;
    let alias = ``;
    for (let i = 0; i < length; i++) {
        alias += chars[Math.floor(Math.random() * chars.length)];
    }
    return alias;
}

/**
 * Load existing aliases
 */
async function loadAliases() {
    if (!existsSync(ALIASES_FILE)) {
        return {};
    }
    const content = await readFile(ALIASES_FILE, `utf-8`);
    return JSON.parse(content);
}

/**
 * Save aliases to file
 */
async function saveAliases(aliases) {
    // Sort aliases by key for consistent ordering
    const sorted = Object.keys(aliases)
        .sort()
        .reduce((acc, key) => {
            acc[key] = aliases[key];
            return acc;
        }, {});

    await writeFile(ALIASES_FILE, JSON.stringify(sorted, null, 2) + `\n`);
}

/**
 * Get all blog post slugs
 */
async function getBlogPostSlugs() {
    const files = await glob(`**/*.{md,mdx}`, {
        cwd: BLOG_DIR,
    });
    return files.map((file) => path.basename(file).replace(/\.(md|mdx)$/, ``));
}

/**
 * Check if aliases are unique (no duplicates)
 */
function checkUniqueness(aliases) {
    const values = Object.values(aliases);
    const uniqueValues = new Set(values);

    if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((v, i, arr) => arr.indexOf(v) !== i);
        throw new Error(`Duplicate aliases found: ${ [ ...new Set(duplicates) ].join(`, `) }`);
    }

    return true;
}

/**
 * Detect mutations in aliases (existing aliases that were changed)
 */
function detectMutations(oldAliases, newAliases) {
    const mutations = [];

    for (const [
        slug,
        oldAlias,
    ] of Object.entries(oldAliases)) {
        if (newAliases[slug] && newAliases[slug] !== oldAlias) {
            mutations.push({
                slug,
                oldAlias,
                newAlias: newAliases[slug],
            });
        }
    }

    return mutations;
}

/**
 * Generate aliases for all blog posts
 * - Adds aliases for new posts
 * - Removes aliases for deleted posts
 * - Preserves existing aliases
 * - Ensures uniqueness
 */
async function generateAliases(options = {}) {
    const {
        allowMutations = false, verbose = true,
    } = options;

    const oldAliases = await loadAliases();
    const slugs = await getBlogPostSlugs();
    const slugSet = new Set(slugs);

    // Start with old aliases
    const newAliases = {
        ...oldAliases,
    };
    const existingAliasValues = new Set(Object.values(newAliases));

    // Track changes
    const added = [];
    const removed = [];

    // Remove aliases for posts that no longer exist
    for (const slug of Object.keys(newAliases)) {
        if (!slugSet.has(slug)) {
            removed.push({
                slug,
                alias: newAliases[slug],
            });
            delete newAliases[slug];
            existingAliasValues.delete(oldAliases[slug]);
        }
    }

    // Add aliases for new posts
    for (const slug of slugs) {
        if (!newAliases[slug]) {
            // Generate unique alias
            let alias;
            let attempts = 0;
            const maxAttempts = 100;

            do {
                alias = generateAlias();
                attempts++;

                if (attempts >= maxAttempts) {
                    throw new Error(`Failed to generate unique alias for ${ slug } after ${ maxAttempts } attempts`);
                }
            } while (existingAliasValues.has(alias));

            newAliases[slug] = alias;
            existingAliasValues.add(alias);
            added.push({
                slug,
                alias,
            });
        }
    }

    // Check for mutations
    const mutations = detectMutations(oldAliases, newAliases);

    if (mutations.length > 0 && !allowMutations) {
        console.error(`\n❌ ERROR: Alias mutations detected!\n`);
        console.error(`The following aliases were changed:\n`);

        for (const {
            slug, oldAlias, newAlias,
        } of mutations) {
            console.error(`  - ${ slug }: ${ oldAlias } → ${ newAlias }`);
        }

        console.error(`\nAlias mutations break existing short URLs and are not allowed.`);
        console.error(`If you intentionally want to mutate aliases, add [allow-alias-mutation] to your commit message.`);
        console.error(`\nTo fix this, revert the changes to src/data/post-aliases.json\n`);

        process.exit(1);
    }

    // Verify uniqueness
    checkUniqueness(newAliases);

    // Save if there are changes
    const hasChanges = added.length > 0 || removed.length > 0 || mutations.length > 0;

    if (hasChanges) {
        await saveAliases(newAliases);

        if (verbose) {
            console.log(`\n✅ Alias changes:`);

            if (added.length > 0) {
                console.log(`\n  Added (${ added.length }):`);
                for (const {
                    slug, alias,
                } of added) {
                    console.log(`    + ${ slug }: ${ alias }`);
                }
            }

            if (removed.length > 0) {
                console.log(`\n  Removed (${ removed.length }):`);
                for (const {
                    slug, alias,
                } of removed) {
                    console.log(`    - ${ slug }: ${ alias }`);
                }
            }

            if (mutations.length > 0) {
                console.log(`\n  Mutated (${ mutations.length }):`);
                for (const {
                    slug, oldAlias, newAlias,
                } of mutations) {
                    console.log(`    ~ ${ slug }: ${ oldAlias } → ${ newAlias }`);
                }
            }

            console.log(`\n  Saved to ${ ALIASES_FILE }`);
        }
    }
    else if (verbose) {
        console.log(`✅ No alias changes needed`);
    }

    return {
        aliases: newAliases,
        added,
        removed,
        mutations,
        hasChanges,
    };
}

/**
 * Get alias for a specific slug
 */
async function getAlias(slug) {
    const aliases = await loadAliases();
    return aliases[slug] || null;
}

/**
 * Validate aliases file
 */
async function validateAliases() {
    const aliases = await loadAliases();
    const slugs = await getBlogPostSlugs();
    const slugSet = new Set(slugs);

    const issues = [];

    // Check uniqueness
    try {
        checkUniqueness(aliases);
    }
    catch (error) {
        issues.push(`Uniqueness error: ${ error.message }`);
    }

    // Check for orphaned aliases
    const orphaned = [];
    for (const slug of Object.keys(aliases)) {
        if (!slugSet.has(slug)) {
            orphaned.push(slug);
        }
    }

    if (orphaned.length > 0) {
        issues.push(`Orphaned aliases (${ orphaned.length }): ${ orphaned.join(`, `) }`);
    }

    // Check for missing aliases
    const missing = [];
    for (const slug of slugs) {
        if (!aliases[slug]) {
            missing.push(slug);
        }
    }

    if (missing.length > 0) {
        issues.push(`Missing aliases (${ missing.length }): ${ missing.join(`, `) }`);
    }

    if (issues.length > 0) {
        console.error(`\n❌ Validation failed:\n`);
        for (const issue of issues) {
            console.error(`  - ${ issue }`);
        }
        console.error(``);
        return false;
    }

    console.log(`✅ Aliases are valid`);
    return true;
}

// CLI interface
if (import.meta.url === `file://${ process.argv[1] }`) {
    const command = process.argv[2];

    if (command === `generate`) {
        const allowMutations = process.argv.includes(`--allow-mutations`);
        generateAliases({
            allowMutations,
        })
            .then((result) => {
                if (!result.hasChanges) {
                    process.exit(0);
                }

                // Exit with 2 if there are changes (so workflows can detect it)
                process.exit(result.mutations.length > 0 ? 2 : 0);
            })
            .catch((error) => {
                console.error(error.message);
                process.exit(1);
            });
    }
    else if (command === `validate`) {
        validateAliases()
            .then((valid) => {
                process.exit(valid ? 0 : 1);
            })
            .catch((error) => {
                console.error(error.message);
                process.exit(1);
            });
    }
    else if (command === `get`) {
        const slug = process.argv[3];
        if (!slug) {
            console.error(`Usage: generate-aliases.js get <slug>`);
            process.exit(1);
        }
        getAlias(slug).then((alias) => {
            if (alias) {
                console.log(alias);
            }
            else {
                console.error(`No alias found for ${ slug }`);
                process.exit(1);
            }
        });
    }
    else {
        console.log(`Usage: generate-aliases.js [command] [options]`);
        console.log(``);
        console.log(`Commands:`);
        console.log(`  generate [--allow-mutations]  Generate/update aliases for all blog posts`);
        console.log(`  validate                       Validate aliases for consistency`);
        console.log(`  get <slug>                     Get alias for a specific post`);
        console.log(``);
        console.log(`Options:`);
        console.log(`  --allow-mutations              Allow existing aliases to be changed`);
    }
}

export {
    generateAliases, getAlias, loadAliases, validateAliases
};
