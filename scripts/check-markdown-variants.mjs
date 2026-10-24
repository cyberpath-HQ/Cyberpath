#!/usr/bin/env node
/**
 * Validates the "Markdown for Agents" output.
 *
 * Local build check (default):
 *   node scripts/check-markdown-variants.mjs
 *   - every generated HTML page must have a sibling index.md
 *   - every markdown variant must have YAML frontmatter with a title and a body
 *
 * Remote check:
 *   node scripts/check-markdown-variants.mjs --remote https://cyberpath-hq.com
 *   - `Accept: text/markdown` must end on a text/markdown response (directly, or
 *     after a redirect to `<path>/index.md`)
 *   - a browser-like request for the same URL must keep returning text/html
 */
import {
    readdir, readFile, stat
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DIST = path.resolve(import.meta.dirname, `../dist`);

/** Pages that intentionally have no markdown variant. */
const IGNORED_PAGE_PREFIXES = [ `/404` ];

async function walk(directory, predicate, results = []) {
    let entries;

    try {
        entries = await readdir(directory, {
            withFileTypes: true,
        });
    }
    catch {
        return results;
    }

    for (const entry of entries) {
        const full = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            await walk(full, predicate, results);
            continue;
        }

        if (predicate(full)) {
            results.push(full);
        }
    }

    return results;
}

function toUrlPath(file, suffix) {
    const relative = path.relative(DIST, file).split(path.sep)
        .join(`/`);

    return `/${ relative.slice(0, -suffix.length) }`;
}

async function findHtmlPages() {
    return walk(DIST, (file) => file.endsWith(`${ path.sep }index.html`) || file.endsWith(`/index.html`));
}

function stripCodeFences(source) {
    return source.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, ``);
}

function validateMarkdown(source, file) {
    const problems = [];
    const prose = stripCodeFences(source);

    if (!source.startsWith(`---\n`)) {
        problems.push(`missing YAML frontmatter`);
    }
    if (!/^title:\s*\S/m.test(source)) {
        problems.push(`missing frontmatter title`);
    }

    const body = prose.replace(/^---\n[\s\S]*?\n---\n/, ``).trim();

    if (body.length < 20) {
        problems.push(`body is empty or too short`);
    }
    if (/^import\s+/m.test(prose)) {
        problems.push(`leftover import statement`);
    }
    if (/<(Alert|InfoBox|FeatureGrid|FeatureCard|Newsletter|Mermaid)[\s/>]/.test(prose)) {
        problems.push(`leftover MDX component`);
    }

    if (problems.length > 0) {
        console.error(`✗ ${ path.relative(DIST, file) }: ${ problems.join(`, `) }`);
    }

    return problems.length === 0;
}

async function checkLocal() {
    const pages = await findHtmlPages();
    const missing = [];

    for (const page of pages) {
        const urlPath = toUrlPath(page, `index.html`);

        if (IGNORED_PAGE_PREFIXES.some((prefix) => urlPath.startsWith(prefix))) {
            continue;
        }

        try {
            await stat(path.join(path.dirname(page), `index.md`));
        }
        catch {
            missing.push(urlPath);
        }
    }

    const markdownFiles = await walk(DIST, (file) => file.endsWith(`${ path.sep }index.md`) || file.endsWith(`/index.md`));

    let invalid = 0;

    for (const file of markdownFiles) {
        const source = await readFile(file, `utf8`);
        if (!validateMarkdown(source, file)) {
            invalid += 1;
        }
    }

    console.log(`HTML pages:        ${ pages.length }`);
    console.log(`Markdown variants: ${ markdownFiles.length }`);
    console.log(`Missing variants:  ${ missing.length }`);

    if (missing.length > 0) {
        console.error(missing.map((urlPath) => `  - ${ urlPath }`).join(`\n`));
    }

    if (missing.length > 0 || invalid > 0) {
        console.error(`\nMarkdown coverage check failed (${ missing.length } missing, ${ invalid } invalid).`);
        process.exitCode = 1;
        return;
    }

    console.log(`\nAll pages have a valid markdown variant.`);
}

async function checkRemote(baseUrl) {
    const markdownFiles = await walk(DIST, (file) => file.endsWith(`${ path.sep }index.md`) || file.endsWith(`/index.md`));
    const base = baseUrl.replace(/\/+$/, ``);
    const baseOrigin = new URL(base).origin;
    let failures = 0;
    let redirected = 0;
    let direct = 0;
    /** Sections whose requests are redirected off-site before the worker sees them. */
    const offSite = new Map();

    const queue = [ ...markdownFiles ];
    const concurrency = 8;

    async function checkUrl() {
        for (;;) {
            const file = queue.shift();

            if (!file) {
                return;
            }

            const urlPath = toUrlPath(file, `index.md`);
            const url = `${ base }${ urlPath }`;

            try {
                // Redirects are followed on purpose: a redirect to `<path>/index.md`
                // is an acceptable way to serve the markdown representation.
                const response = await fetch(url, {
                    headers: {
                        Accept: `text/markdown`,
                    },
                    redirect: `follow`,
                });
                const contentType = (response.headers.get(`content-type`) ?? ``).toLowerCase();
                const body = await response.text();
                const finalUrl = new URL(response.url);
                const problems = [];

                if (!response.ok) {
                    problems.push(`status ${ response.status }`);
                }
                if (!contentType.startsWith(`text/markdown`)) {
                    const offSiteRedirect = response.redirected && finalUrl.origin !== baseOrigin;

                    problems.push(
                        offSiteRedirect
                            ? `redirected off-site to ${ finalUrl.origin } before the worker could negotiate`
                            : `content-type "${ contentType || `missing` }"`
                    );

                    if (offSiteRedirect) {
                        const section = urlPath.split(`/`).slice(0, 2).join(`/`) || `/`;
                        offSite.set(section, (offSite.get(section) ?? 0) + 1);
                    }
                }
                if (body.length < 20) {
                    problems.push(`empty body`);
                }

                if (problems.length > 0) {
                    failures += 1;
                    console.error(`✗ ${ urlPath }: ${ problems.join(`, `) }`);
                    continue;
                }

                if (finalUrl.pathname === urlPath) {
                    direct += 1;
                }
                else {
                    redirected += 1;
                }
            }
            catch (error) {
                failures += 1;
                console.error(`✗ ${ urlPath }: ${ error.message }`);
            }
        }
    }

    await Promise.all(Array.from({
        length: concurrency,
    }, checkUrl));

    try {
        const htmlResponse = await fetch(`${ base }/blog/`, {
            headers: {
                Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
            },
            redirect: `follow`,
        });
        const contentType = (htmlResponse.headers.get(`content-type`) ?? ``).toLowerCase();

        if (!contentType.includes(`text/html`)) {
            failures += 1;
            console.error(`✗ /blog/: HTML default broken, content-type "${ contentType }"`);
        }
    }
    catch (error) {
        failures += 1;
        console.error(`✗ /blog/: ${ error.message }`);
    }

    console.log(`Checked ${ markdownFiles.length } markdown URLs against ${ base }.`);
    console.log(`  served at the requested URL: ${ direct }`);
    console.log(`  served through a redirect:   ${ redirected }`);
    console.log(`  redirected off-site:         ${ [ ...offSite.values() ].reduce((total, count) => total + count, 0) }`);

    if (offSite.size > 0) {
        console.error(
            [
                ``,
                `These sections are redirected to another origin before the Worker runs, so they`,
                `never reach the markdown negotiation:`,
                ...[ ...offSite.entries() ].map(([ section, count ]) => `  ${ section }  (${ count } URLs)`),
                ``,
                `Fix: in the Cloudflare redirect rule for those sections, keep the rule from`,
                `matching markdown requests:`,
                ``,
                `  and not any(http.request.headers["accept"][*] contains "text/markdown")`,
                ``,
                `See docs/markdown-for-agents.md#sections-redirected-at-the-edge`,
            ].join(`\n`)
        );
    }

    if (failures > 0) {
        console.error(`\nContent negotiation check failed (${ failures } problems).`);
        process.exitCode = 1;
        return;
    }

    console.log(`Content negotiation works.`);
}

const remoteIndex = process.argv.indexOf(`--remote`);

if (remoteIndex !== -1) {
    await checkRemote(process.argv[remoteIndex + 1] ?? `https://cyberpath-hq.com`);
}
else {
    await checkLocal();
}
