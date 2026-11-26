/**
 * Content negotiation worker for cyberpath-hq.com.
 *
 * The site itself is a static Astro build hosted on GitHub Pages, which cannot
 * look at the `Accept` header. This Worker sits in front of it and serves the
 * markdown variants generated at build time (`<path>/index.md`) when a client
 * asks for `Accept: text/markdown`.
 *
 * Everything else is forwarded to the origin untouched, so browsers keep
 * receiving HTML. HTML responses get RFC 8288 `Link` headers advertising the
 * site's machine-readable documents, and `/.well-known/api-catalog` resolves to
 * the RFC 9727 API catalog generated at build time.
 */
import { estimateTokens } from "../src/lib/agent-markdown/document";
import {
    appendVary,
    MARKDOWN_MEDIA_TYPE,
    prefersMarkdown,
    toMarkdownPath,
} from "../src/lib/agent-markdown/negotiation";
import {
    API_CATALOG_DOCUMENT_PATH,
    API_CATALOG_MEDIA_TYPE,
    API_CATALOG_PATH,
    API_CATALOG_PROFILE,
    discoveryLinkHeader,
} from "../src/lib/agent-discovery/links";

export interface Env {
    /**
     * Optional origin override, used for local development:
     * `ORIGIN_URL=http://127.0.0.1:4321` in `worker/.dev.vars`.
     * Leave unset in production so requests go to the zone origin.
     */
    ORIGIN_URL?: string;
}

/**
 * The worker serves exactly two hostnames. `wrangler.jsonc` only attaches it to
 * these routes, and this allowlist makes that explicit: a request for any other
 * hostname (an added route, a misconfigured custom domain) is forwarded
 * untouched instead of being served a markdown variant.
 */
const ALLOWED_HOSTS = new Set([
    `cyberpath-hq.com`,
    `www.cyberpath-hq.com`,
]);

/** Hostnames used by `wrangler dev` / `astro preview` while developing locally. */
const LOCAL_HOSTS = new Set([
    `localhost`,
    `127.0.0.1`,
    `0.0.0.0`,
]);

const MARKDOWN_CACHE_CONTROL = `public, max-age=3600`;
const MARKDOWN_CACHE_TTL_SECONDS = 3600;

/**
 * An HTML page names the content-hashed bundles of the deployment that built
 * it. GitHub Pages serves every file with `cache-control: max-age=86400`, so a
 * browser or shared cache can keep the page for a day after a new deployment
 * has replaced those bundles. The stale page then requests a chunk that no
 * longer exists, GitHub Pages answers with its HTML 404 page, and the browser
 * refuses to execute it as a module (`disallowed MIME type "text/html"`),
 * leaving that island un-hydrated. Revalidate documents instead: unchanged
 * pages cost a `304`, and the hashed assets keep the long cache below.
 */
const HTML_CACHE_CONTROL = `no-cache`;

/** Build output under `/assets/` is content-hashed, so a new build changes its URL. */
const HASHED_ASSET_CACHE_CONTROL = `public, max-age=31536000, immutable`;

/** Error responses must not outlive the deployment that produced them. */
const UNCACHEABLE_CACHE_CONTROL = `no-store`;

/** Session key that keeps the stale-chunk recovery below from reloading in a loop. */
const STALE_ASSET_RELOAD_KEY = `cyberpath:stale-asset-reload`;

/** How long the recovery waits before it is willing to reload a page again. */
const STALE_ASSET_RELOAD_COOLDOWN_MS = 30_000;

/**
 * GitHub Pages answers the `www` hostname with a `301` to the apex domain, so
 * every document the worker fetches upstream is read from the canonical origin.
 * The response is still served on whichever of the two allowed hostnames the
 * agent called, so `www` works without a redirect hop.
 */
const CANONICAL_ORIGIN = `https://cyberpath-hq.com`;

/** Upper bound on same-site origin redirects followed inside the Worker. */
const MAX_ORIGIN_REDIRECTS = 3;

/**
 * GitHub Pages picks the media type from the file extension, so the
 * extensionless `/.well-known/api-catalog` is served from its JSON twin and
 * relabelled here.
 */
const API_CATALOG_CONTENT_TYPE = `${ API_CATALOG_MEDIA_TYPE }; profile="${ API_CATALOG_PROFILE }"`;

function isAllowedHost(hostname: string): boolean {
    const normalized = hostname.toLowerCase();

    return ALLOWED_HOSTS.has(normalized) || LOCAL_HOSTS.has(normalized);
}

function originUrl(url: URL, env: Env): URL {
    return new URL(`${ url.pathname }${ url.search }`, env.ORIGIN_URL ?? CANONICAL_ORIGIN);
}

function buildRequest(method: string, target: URL, headers: Headers): Request {
    headers.delete(`host`);

    return new Request(target.toString(), {
        method,
        headers,
        redirect: `manual`,
        cf:       { cacheEverything: true, cacheTtl: MARKDOWN_CACHE_TTL_SECONDS },
    });
}

/**
 * Forward a request to the origin (GitHub Pages).
 *
 * Every `GET`/`HEAD` is rewritten to the canonical apex origin before it leaves
 * the Worker. GitHub Pages answers `www` with a `301` to the apex, and an edge
 * rule that sends the apex back to `www` then closes the loop
 * (`www → 301 apex → 303 www → …`). Reading the content from the canonical
 * origin once and serving it under whichever hostname the client asked for
 * removes the origin half of that loop entirely.
 *
 * A subrequest to the same zone is not routed back into this Worker, so the
 * HTML branch never negotiates again.
 */
function fetchOrigin(request: Request, env: Env): Promise<Response> {
    if (request.method !== `GET` && request.method !== `HEAD`) {
        return fetch(request);
    }

    return fetchCanonical(request, env);
}

async function fetchCanonical(request: Request, env: Env): Promise<Response> {
    let target = originUrl(new URL(request.url), env);

    for (let hop = 0; ; hop += 1) {
        const response = await fetch(buildOriginRequest(request, target));
        const next = hop < MAX_ORIGIN_REDIRECTS ? sameSiteRedirectTarget(response) : null;

        if (next === null) {
            return response;
        }

        await response.body?.cancel();
        target = originUrl(next, env);
    }
}

function buildOriginRequest(request: Request, target: URL): Request {
    const headers = new Headers(request.headers);
    headers.delete(`host`);

    return new Request(target.toString(), {
        method: request.method,
        headers,
        redirect: `manual`,
    });
}

function isRedirect(response: Response): boolean {
    return response.status >= 300 && response.status < 400;
}

/**
 * Resolve a redirect that stays inside the site to its target URL, or `null`
 * when the response is not a redirect or points somewhere else. Redirecting
 * `www` to the apex (or the other way round) must never reach the browser: the
 * other half of the loop may be a zone rule this Worker cannot see.
 */
function sameSiteRedirectTarget(response: Response): URL | null {
    if (!isRedirect(response)) {
        return null;
    }

    const location = response.headers.get(`location`);

    if (!location) {
        return null;
    }

    let target: URL;

    try {
        target = new URL(location, CANONICAL_ORIGIN);
    } catch {
        return null;
    }

    return isAllowedHost(target.hostname) ? target : null;
}

function isHtml(contentType: string | null): boolean {
    return (contentType ?? ``).toLowerCase().includes(`text/html`);
}

/**
 * `true` for Astro's content-hashed island bundles, e.g.
 * `/assets/pricing.B-PXVPav.js`. A `404` for one of these means the caller is
 * holding an HTML page from an older deployment.
 */
function isHashedModulePath(pathname: string): boolean {
    return /^\/assets\/[^/]+\.[A-Za-z0-9_-]{4,}\.m?js$/.test(pathname);
}

/**
 * A document that outlived its bundles requests a module the origin no longer
 * has. Browsers refuse the HTML `404` (`disallowed MIME type "text/html"`), so
 * the island never hydrates and the section stays stuck in its server-rendered
 * state. Answer the request with a valid module that reloads the page from a
 * fresh cache entry, repairing the visitor without asking them to hard-refresh.
 *
 * The reload is rate-limited through `sessionStorage`: if a fresh document
 * still requests missing chunks (a genuinely broken deployment, not a stale
 * cache), the visitor is not trapped in a reload loop.
 */
const STALE_ASSET_RECOVERY = `(function () {
    var key = ${ JSON.stringify(STALE_ASSET_RELOAD_KEY) };
    var cooldown = ${ STALE_ASSET_RELOAD_COOLDOWN_MS };
    var now = Date.now();
    try {
        var last = Number(sessionStorage.getItem(key)) || 0;
        if (now - last < cooldown) return;
        sessionStorage.setItem(key, String(now));
    } catch (error) {}
    var url = new URL(location.href);
    url.searchParams.set("v", now.toString(36));
    location.replace(url.toString());
})();`;

function isMissingHashedModule(url: URL, response: Response): boolean {
    return isHashedModulePath(url.pathname) &&
        (response.status === 404 || isHtml(response.headers.get(`content-type`)));
}

function staleAssetRecoveryResponse(request: Request): Response {
    return new Response(request.method === `HEAD` ? null : STALE_ASSET_RECOVERY, {
        status: 200,
        headers: new Headers({
            "Content-Type":  `text/javascript; charset=utf-8`,
            "Cache-Control": UNCACHEABLE_CACHE_CONTROL,
        }),
    });
}

/**
 * Forward a navigation (or any non-markdown request) to the origin, repairing
 * stale-chunk requests before the browser can reject them.
 */
async function forward(request: Request, env: Env, url: URL): Promise<Response> {
    const response = await fetchOrigin(request, env);

    if (isMissingHashedModule(url, response)) {
        await response.body?.cancel();
        return staleAssetRecoveryResponse(request);
    }

    return withVary(response, url);
}

/**
 * Cache policy is decided here rather than inherited from GitHub Pages: see
 * `HTML_CACHE_CONTROL`, `HASHED_ASSET_CACHE_CONTROL` and
 * `UNCACHEABLE_CACHE_CONTROL`.
 */
function applyCachePolicy(response: Response, url: URL, headers: Headers): void {
    const revalidated = response.status === 304;

    // A `304` refreshes the cached entity's headers, so it must repeat the
    // policy chosen when the entity was first fetched: forwarding GitHub's
    // `max-age=86400` here would undo the document policy below.
    if (!response.ok && !revalidated) {
        headers.delete(`expires`);
        headers.set(`Cache-Control`, UNCACHEABLE_CACHE_CONTROL);
        return;
    }

    if (url.pathname.startsWith(`/assets/`)) {
        headers.delete(`expires`);
        headers.set(`Cache-Control`, HASHED_ASSET_CACHE_CONTROL);
        return;
    }

    if (revalidated || isHtml(response.headers.get(`content-type`))) {
        headers.delete(`expires`);
        headers.set(`Cache-Control`, HTML_CACHE_CONTROL);
    }
}

/**
 * Advertising `Vary: Accept` keeps shared caches from mixing the HTML and
 * markdown variants. HTML responses also carry the RFC 8288 `Link` headers
 * that point agents at the machine-readable documents.
 */
function withVary(response: Response, url: URL): Response {
    const headers = new Headers(response.headers);
    appendVary(headers, `Accept`);

    if (response.ok && isHtml(response.headers.get(`content-type`))) {
        headers.set(`Link`, discoveryLinkHeader());
    }

    applyCachePolicy(response, url, headers);

    return new Response(response.body, {
        status:     response.status,
        statusText: response.statusText,
        headers,
    });
}

function isMarkdownResponse(response: Response): boolean {
    const contentType = (response.headers.get(`content-type`) ?? ``).toLowerCase();

    return response.status === 200 && !contentType.includes(`text/html`);
}

/**
 * Serve the RFC 9727 API catalog at its well-known URI.
 *
 * Returns `null` when the origin does not have the document (for example an
 * old deployment), so the caller can fall back to the normal origin response.
 */
async function serveApiCatalog(request: Request, env: Env): Promise<Response | null> {
    const headers = new Headers(request.headers);
    headers.delete(`if-none-match`);
    headers.delete(`if-modified-since`);

    const target = originUrl(new URL(API_CATALOG_DOCUMENT_PATH, CANONICAL_ORIGIN), env);
    const catalogResponse = await fetch(buildRequest(`GET`, target, headers));

    if (!catalogResponse.ok) {
        await catalogResponse.body?.cancel();
        return null;
    }

    const catalog = await catalogResponse.text();

    return new Response(request.method === `HEAD` ? null : catalog, {
        status: 200,
        headers: new Headers({
            "Content-Type":  API_CATALOG_CONTENT_TYPE,
            "Cache-Control": catalogResponse.headers.get(`cache-control`) ?? MARKDOWN_CACHE_CONTROL,
            "Link":          discoveryLinkHeader(),
        }),
    });
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== `GET` && request.method !== `HEAD`) {
            return fetchOrigin(request, env);
        }

        const url = new URL(request.url);

        if (!isAllowedHost(url.hostname)) {
            return fetchOrigin(request, env);
        }

        if (url.pathname === API_CATALOG_PATH) {
            const catalog = await serveApiCatalog(request, env);

            if (catalog) {
                return catalog;
            }
        }

        if (!prefersMarkdown(request.headers.get(`Accept`))) {
            return forward(request, env, url);
        }

        const markdownPath = toMarkdownPath(url.pathname);

        if (markdownPath === null) {
            return forward(request, env, url);
        }

        const headers = new Headers(request.headers);
        headers.set(`Accept`, MARKDOWN_MEDIA_TYPE);
        headers.delete(`if-none-match`);
        headers.delete(`if-modified-since`);

        const target = originUrl(new URL(`${ markdownPath }${ url.search }`, CANONICAL_ORIGIN), env);
        const markdownResponse = await fetch(buildRequest(`GET`, target, headers));

        if (!isMarkdownResponse(markdownResponse)) {
            await markdownResponse.body?.cancel();
            return forward(request, env, url);
        }

        const markdown = await markdownResponse.text();
        const responseHeaders = new Headers({
            "Content-Type":      `text/markdown; charset=utf-8`,
            "Cache-Control":     markdownResponse.headers.get(`cache-control`) ?? MARKDOWN_CACHE_CONTROL,
            "X-Markdown-Tokens": String(estimateTokens(markdown)),
            "X-Markdown-Source": markdownPath,
        });
        appendVary(responseHeaders, `Accept`);

        const contentLanguage = markdownResponse.headers.get(`content-language`);

        if (contentLanguage) {
            responseHeaders.set(`Content-Language`, contentLanguage);
        }

        return new Response(request.method === `HEAD` ? null : markdown, {
            status:  200,
            headers: responseHeaders,
        });
    },
};
