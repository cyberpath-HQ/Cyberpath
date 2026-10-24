/**
 * Content negotiation worker for cyberpath-hq.com.
 *
 * The site itself is a static Astro build hosted on GitHub Pages, which cannot
 * look at the `Accept` header. This Worker sits in front of it and serves the
 * markdown variants generated at build time (`<path>/index.md`) when a client
 * asks for `Accept: text/markdown`.
 *
 * Everything else is forwarded to the origin untouched, so browsers keep
 * receiving HTML.
 */
import { estimateTokens } from "../src/lib/agent-markdown/document";
import {
    appendVary,
    MARKDOWN_MEDIA_TYPE,
    prefersMarkdown,
    toMarkdownPath,
} from "../src/lib/agent-markdown/negotiation";

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

function isAllowedHost(hostname: string): boolean {
    const normalized = hostname.toLowerCase();

    return ALLOWED_HOSTS.has(normalized) || LOCAL_HOSTS.has(normalized);
}

function originUrl(url: URL, env: Env): URL {
    if (!env.ORIGIN_URL) {
        return url;
    }

    return new URL(`${ url.pathname }${ url.search }`, env.ORIGIN_URL);
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
 * A subrequest to the same zone is not routed back into this Worker, so the
 * HTML branch never negotiates again.
 */
function fetchOrigin(request: Request, env: Env): Promise<Response> {
    if (!env.ORIGIN_URL) {
        return fetch(request);
    }

    return fetch(buildRequest(request.method, originUrl(new URL(request.url), env), new Headers(request.headers)));
}

/**
 * Advertising `Vary: Accept` keeps shared caches from mixing the HTML and
 * markdown variants.
 */
async function withVary(response: Response): Promise<Response> {
    const headers = new Headers(response.headers);
    appendVary(headers, `Accept`);

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

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== `GET` && request.method !== `HEAD`) {
            return fetchOrigin(request, env);
        }

        const url = new URL(request.url);

        if (!isAllowedHost(url.hostname)) {
            return fetchOrigin(request, env);
        }

        if (!prefersMarkdown(request.headers.get(`Accept`))) {
            return withVary(await fetchOrigin(request, env));
        }

        const markdownPath = toMarkdownPath(url.pathname);

        if (markdownPath === null) {
            return withVary(await fetchOrigin(request, env));
        }

        const headers = new Headers(request.headers);
        headers.set(`Accept`, MARKDOWN_MEDIA_TYPE);
        headers.delete(`if-none-match`);
        headers.delete(`if-modified-since`);

        const target = originUrl(new URL(`${ markdownPath }${ url.search }`, url.origin), env);
        const markdownResponse = await fetch(buildRequest(`GET`, target, headers));

        if (!isMarkdownResponse(markdownResponse)) {
            await markdownResponse.body?.cancel();
            return withVary(await fetchOrigin(request, env));
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
