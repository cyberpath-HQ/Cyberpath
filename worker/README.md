# Markdown negotiation worker

The site is a static Astro build served by GitHub Pages. GitHub Pages cannot inspect the
`Accept` header, so content negotiation happens in a Cloudflare Worker that sits on the
zone in front of the origin.

```
agent   ──Accept: text/markdown──▶ Cloudflare Worker ──GET /<path>/index.md──▶ GitHub Pages
browser ──Accept: text/html───────▶ Cloudflare Worker ──GET /<path>/─────────▶ GitHub Pages
```

## What the worker does

It runs on **two hostnames only** — `cyberpath-hq.com` (apex / no prefix) and
`www.cyberpath-hq.com`. Both routes are declared in `wrangler.jsonc`, `workers_dev` and
preview URLs are disabled, and `worker/index.ts` also checks `url.hostname` against an
allowlist: any other hostname is forwarded untouched. `localhost` / `127.0.0.1` are allowed
so local development works.

| Request                                        | Result                                                |
| ---------------------------------------------- | ----------------------------------------------------- |
| `GET /blog/my-post/` + `Accept: text/html`      | Origin HTML, untouched                                |
| `GET /blog/my-post/` + `Accept: text/markdown`  | `/blog/my-post/index.md` as `text/markdown`            |
| `GET /blog/my-post/` + `Accept: */*`            | Origin HTML (`*/*` alone never selects markdown)       |
| `GET /rss.xml`, `/favicon.svg`, `/assets/*`     | Origin response, untouched (already machine readable)  |
| markdown variant missing (404)                  | Falls back to the HTML page                            |

Response headers on markdown responses:

```http
content-type: text/markdown; charset=utf-8
vary: accept
x-markdown-tokens: 1234
x-markdown-source: /blog/my-post/index.md
cache-control: public, max-age=3600
```

`x-markdown-tokens` is an estimate (`characters / 4`). `vary: accept` is also added to HTML
responses so shared caches keep the two representations apart.

## Deploying

The worker needs two GitHub Actions secrets:

| Secret                  | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | API token with `Workers Scripts: Edit` and `Workers Routes: Edit`   |
| `CLOUDFLARE_ACCOUNT_ID` | Account id from the Cloudflare dashboard                            |

Then either push to `master` (the `deploy-worker.yml` workflow runs when `worker/` or the
shared negotiation helpers change) or deploy manually:

```bash
CLOUDFLARE_API_TOKEN=... pnpm run worker:deploy
```

`worker/wrangler.jsonc` claims the routes `cyberpath-hq.com/*` and
`www.cyberpath-hq.com/*`. Before the first deploy, check **Workers & Pages → Routes** for
the zone: Cloudflare only runs one Worker per route, so if another Worker already owns
`cyberpath-hq.com/*`, add the markdown logic there instead of deploying a second script.

After the first deploy, purge the Cloudflare cache so cached HTML is not served for
markdown requests.

### Alternative: the zone setting

Cloudflare Pro/Business plans have **Markdown for Agents** (AI Crawl Control), which
converts HTML to markdown at the edge with no code. It converts `text/html` responses, so
it can coexist with this worker, but pick one as the source of truth: the zone setting
converts *every* page (including ones without a curated variant), while this worker only
serves the build-time variants and falls back to HTML otherwise.

## Local development

Wrangler does not read shell environment variables, so put the origin override in
`worker/.dev.vars` (gitignored):

```bash
printf 'ORIGIN_URL=http://127.0.0.1:4321\n' > worker/.dev.vars
pnpm run build      # or: npx astro build
pnpm run preview    # serves dist on http://127.0.0.1:4321
pnpm run worker:dev # serves the worker on http://127.0.0.1:8787
```

`ORIGIN_URL` is only a local convenience; in production the worker forwards to the zone
origin (GitHub Pages) because the variable is unset.

```bash
curl -sI -H "Accept: text/markdown" http://127.0.0.1:8787/blog/ | head -12
curl -sI http://127.0.0.1:8787/blog/ | head -12
```

## Adding a markdown variant for a new page

Create `<path>/index.md.ts` next to the page, for example
`src/pages/changelog/index.md.ts`, and return `createMarkdownResponse(...)` from
`@/lib/agent-markdown/response`. Then run `pnpm run check:markdown`: it fails when a
generated HTML page has no sibling `index.md`.

Shared helpers:

| File                                    | Purpose                                                |
| --------------------------------------- | ------------------------------------------------------ |
| `src/lib/agent-markdown/negotiation.ts` | `Accept` parsing, path mapping (used by the worker)    |
| `src/lib/agent-markdown/document.ts`    | frontmatter + body rendering, token estimate           |
| `src/lib/agent-markdown/blog.ts`        | MDX post to markdown (remark pipeline, link rewriting) |
| `src/lib/agent-markdown/blog-index.ts`  | blog listing                                           |
| `src/lib/agent-markdown/landing.ts`     | localized landing and services pages                   |
| `src/lib/agent-markdown/redirect.ts`    | markdown redirect documents                            |
