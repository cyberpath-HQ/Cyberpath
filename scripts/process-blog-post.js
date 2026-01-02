/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * Process blog post through remark plugins
 * This script processes a blog post MDX file and applies all remark plugins
 * to get the transformed markdown content for external publishing platforms
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our remark plugins
import { loadAliases } from './generate-aliases.js';
import { pascal } from 'radash';

const console_backup = {
    log:      console.log,
    group:    console.group,
    groupEnd: console.groupEnd,
    error:    console.error,
    warn:     console.warn,
    info:     console.info,
    debug:    console.debug,
    trace:    console.trace,
    table:    console.table,
};

function silence() {
    console.log = () => {};
    console.group = () => {};
    console.groupEnd = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.trace = () => {};
    console.table = () => {};
    global.console.log = () => {};
    global.console.group = () => {};
    global.console.groupEnd = () => {};
    global.console.error = () => {};
    global.console.warn = () => {};
    global.console.info = () => {};
    global.console.debug = () => {};
    global.console.trace = () => {};
    global.console.table = () => {};
    globalThis.console.log = () => {};
    globalThis.console.group = () => {};
    globalThis.console.groupEnd = () => {};
    globalThis.console.error = () => {};
    globalThis.console.warn = () => {};
    globalThis.console.info = () => {};
    globalThis.console.debug = () => {};
    globalThis.console.trace = () => {};
    globalThis.console.table = () => {};
}

function restoreConsole() {
    console.log = console_backup.log;
    console.group = console_backup.group;
    console.groupEnd = console_backup.groupEnd;
    console.error = console_backup.error;
    console.warn = console_backup.warn;
    console.info = console_backup.info;
    console.debug = console_backup.debug;
    console.trace = console_backup.trace;
    console.table = console_backup.table;
    global.console.log = console_backup.log;
    global.console.group = console_backup.group;
    global.console.groupEnd = console_backup.groupEnd;
    global.console.error = console_backup.error;
    global.console.warn = console_backup.warn;
    global.console.info = console_backup.info;
    global.console.debug = console_backup.debug;
    global.console.trace = console_backup.trace;
    global.console.table = console_backup.table;
    globalThis.console.log = console_backup.log;
    globalThis.console.group = console_backup.group;
    globalThis.console.groupEnd = console_backup.groupEnd;
    globalThis.console.error = console_backup.error;
    globalThis.console.warn = console_backup.warn;
    globalThis.console.info = console_backup.info;
    globalThis.console.debug = console_backup.debug;
    globalThis.console.trace = console_backup.trace;
    globalThis.console.table = console_backup.table;
}

/**
 * Process a blog post file and return frontmatter + processed content
 */
async function processBlogPost(filePath, platform = `devto`) {
    // Read the file
    const content = await readFile(filePath, `utf-8`);

    // Parse frontmatter
    silence();
    const matter = (await import(`gray-matter`)).default;
    const {
        data: frontmatter, content: markdownContent,
    } = matter(content);
    restoreConsole();

    // Get filename without extension for URL generation
    const filename = path.basename(filePath).replace(/\.(md|mdx)$/, ``);

    // Determine UTM source based on platform
    const utmSource = platform === `devto`
        ? `dev.to`
        : platform === `medium`
            ? `medium.com`
            : platform === `twitter`
                ? `twitter.com`
                : `external`;


    silence();

    const remarkAutoLink = (await import(`../src/lib/auto-link-remark-plugin.ts`)).default;
    const remarkUtmParams = (await import(`../src/lib/utm-remark-plugin.ts`)).default;
    const {
        remark,
    } = await import(`remark`);

    const remarkMdx = (await import(`remark-mdx`)).default;

    // Process markdown with remark plugins
    const processor = remark()
        .use(remarkMdx)
        .use(remarkAutoLink, {
            baseUrl:         `https://cyberpath-hq.com`,
            maxLinksPerTerm: 1,

            // Don't link to the current page
            excludeUrls:     [ `/blog/${ filename }` ],
            is_silent:       true,
        })
        .use(remarkUtmParams, {
            baseUrl:       `https://cyberpath-hq.com`,
            source:        utmSource,
            medium:        platform,
            campaignField: `title`,
            is_silent:     true,
        });

    // Create a mock vfile structure for the plugins
    const mockFile = {
        history: [ filePath ],
        data:    {
            astro: {
                frontmatter: frontmatter,
            },
        },
    };

    // Process the content
    const result = await processor.process({
        value: markdownContent,
        ...mockFile,
    });

    restoreConsole();

    // Remove JSX/MDX components from the output for external platforms
    let processedContent = String(result);

    // Remove import statements
    processedContent = processedContent.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, ``);

    // Remove JSX components (basic removal - may need refinement)
    processedContent = processedContent.replace(/<[A-Z][A-Za-z0-9]*(\s+[^>]*)?\s*\/>/g, ``);
    processedContent = processedContent.replace(/<[A-Z][A-Za-z0-9]*(\s+[^>]*)?>(.*?)<\/[A-Z][A-Za-z0-9]*>/gs, ``);

    // Clean up extra whitespace
    processedContent = processedContent.trim();

    // Load aliases and get short URL
    const aliases = await loadAliases();
    const alias = aliases[filename] || null;
    const shortUrl = alias ? `https://cyberpath-hq.com/p/${ alias }` : null;

    // Generate canonical URL
    const canonicalUrl = `https://cyberpath-hq.com/blog/${ filename }`;

    // For Twitter, use short URL if available
    const urlToUse = (platform === `twitter` && shortUrl) ? shortUrl : canonicalUrl;

    // Add UTM parameters to URL
    const urlWithUtm = `${ urlToUse }?${ new URLSearchParams({
        utm_source:   utmSource,
        utm_medium:   platform,
        utm_campaign: frontmatter.title ?? `blog-post`,
    }).toString() }`;

    frontmatter.tags = (frontmatter.tags ?? []).map((tag) => pascal(tag))
        .filter((tag) => !tag.includes(`&`));

    return {
        frontmatter: {
            ...frontmatter,
            canonicalUrl: urlWithUtm,
            originalUrl:  canonicalUrl,
            shortUrl:     shortUrl,
            alias:        alias,
            slug:         filename,
        },
        content: processedContent.replaceAll(`\n\n`, `@@NEWLINE@@`)
            .replaceAll(`\n`, ` `)
            .replaceAll(`@@NEWLINE@@`, `\n\n`),
        platform,
    };
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error(`Usage: node process-blog-post.js <blog-post-file> [platform]`);
        console.error(`Platform: devto, medium, twitter (default: devto)`);
        process.exit(1);
    }

    const blogPostFile = args[0];
    const platform = args[1] || `devto`;

    try {
        const result = await processBlogPost(blogPostFile, platform);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error(`Error processing blog post:`, error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${ process.argv[1] }`) {
    main();
}

export {
    processBlogPost
};
