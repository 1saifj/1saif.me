# 1saif.me

The personal site of Saif Aljanahi: work, writing and résumé, in English and Arabic. Live at [1saif.me](https://1saif.me).

## Stack

- Vite, React 18, TypeScript, React Router, Tailwind CSS
- Every route is prerendered to static HTML at build time (`scripts/prerender.mjs`), then hydrated in the browser
- Arabic pages live under `/ar`, right to left, with their own fonts
- Hosted on Cloudflare Pages. Headers and redirects are in `public/_headers` and `public/_redirects`

## Content

- Articles are Markdown files in `content/articles/`, listed in `src/data/blogs.ts`; a new post also needs its thumbnails, made with `npm run thumbs -- <image>` (needs the `cwebp` CLI: `brew install webp`)
- Case studies are Markdown files in `content/projects/`, with Arabic versions in `content/projects/ar/`
- The sitemap and the RSS, Atom and JSON feeds are generated on every build

## Commands

```bash
npm install
npm run dev          # dev server
npm run build        # sitemap, feeds, Vite build, prerender into dist/
npm run preview      # serve dist/ on port 4173
npm test             # unit tests (Vitest)
npm run typecheck
npm run lint
```

Node 18 or newer.

## Deploys

| What | Runs when | How |
| --- | --- | --- |
| The site | Every push to `main` | Cloudflare Pages project `1saif-me` builds with `npm run build` and serves `dist`. It needs no environment variables |
| The contact Worker | A push to `main` that changes `workers/contact/**` or `.github/workflows/deploy-worker.yml`, or a manual run | `.github/workflows/deploy-worker.yml` |
| The edge cache | Every push to `main`, or a manual run | `.github/workflows/purge-html-cache.yml` |

**The contact Worker.** The workflow runs `npm ci`, then `npx vitest run workers`. It deploys with `npx --yes wrangler@4.111.0 deploy -c workers/contact/wrangler.jsonc`, then fails unless `GET https://1saif.me/api/contact` answers 405. Wrangler keeps the `TURNSTILE_SECRET` that is already on the Worker, so the workflow never passes it.

**The edge cache.** Pages caches HTML at the edge, and a cached page can name the hashed assets of an older deploy. The workflow polls the Pages deployments API until the deployment of its own commit (`$GITHUB_SHA`) reaches stage `deploy` with status `success`, then purges the cache for host `1saif.me`. It fails if that deployment fails or if the wait passes 15 minutes. A manual run skips the wait and purges at once.

**Secrets.** Add both in Settings → Secrets and variables → Actions.

| Secret | Used by | Token permissions |
| --- | --- | --- |
| `CLOUDFLARE_WORKERS_TOKEN` | `deploy-worker.yml` | Account `1saif.me`: Workers Scripts → Edit, Account Settings → Read. Zone `1saif.me`: Workers Routes → Edit. Add Account → Email Routing Addresses → Read if the deploy refuses the `send_email` binding |
| `CLOUDFLARE_CACHE_TOKEN` | `purge-html-cache.yml` | Account `1saif.me`: Cloudflare Pages → Read. Zone `1saif.me`: Cache Purge → Purge |

`deploy-worker.yml` runs on Node 22, because wrangler 4.111.0 needs Node 22 or newer (`.node-version` says 20.10.0 and `.nvmrc` says 18, so neither is used for the deploy).

To deploy or roll back the Worker by hand:

```bash
npx wrangler@4 deploy -c workers/contact/wrangler.jsonc
npx wrangler@4 rollback -c workers/contact/wrangler.jsonc
npx wrangler@4 tail -c workers/contact/wrangler.jsonc
```

## Contact

Saif Aljanahi · [hello@1saif.me](mailto:hello@1saif.me) · [LinkedIn](https://linkedin.com/in/1saifj) · [GitHub](https://github.com/1saifj)
