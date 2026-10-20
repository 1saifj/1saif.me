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
| The site | Every push to `main` | Cloudflare Pages project `1saif-me` builds with `npm run build` and serves `dist` |
| The contact Worker | A push to `main` that changes `workers/contact/*` | Cloudflare Workers Builds on the `1saif-contact` Worker: build command `npx vitest run workers`, deploy command `npx wrangler deploy -c workers/contact/wrangler.jsonc` |

Both use Cloudflare's GitHub app and Cloudflare-managed build tokens, so the repo holds no deploy secrets. Wrangler keeps the `TURNSTILE_SECRET` that is already on the Worker. Build logs: Workers & Pages → `1saif-contact` → Deployments.

To deploy or roll back the Worker by hand:

```bash
npx wrangler@4 deploy -c workers/contact/wrangler.jsonc
npx wrangler@4 rollback -c workers/contact/wrangler.jsonc
npx wrangler@4 tail -c workers/contact/wrangler.jsonc
```

## Contact

Saif Aljanahi · [hello@1saif.me](mailto:hello@1saif.me) · [LinkedIn](https://linkedin.com/in/1saifj) · [GitHub](https://github.com/1saifj)
