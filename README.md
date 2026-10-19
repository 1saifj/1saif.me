# 1saif.me

The personal site of Saif Aljanahi: work, writing and résumé, in English and Arabic. Live at [1saif.me](https://1saif.me).

## Stack

- Vite, React 18, TypeScript, React Router, Tailwind CSS
- Every route is prerendered to static HTML at build time (`scripts/prerender.mjs`), then hydrated in the browser
- Arabic pages live under `/ar`, right to left, with their own fonts
- Hosted on Cloudflare Pages. Headers and redirects are in `public/_headers` and `public/_redirects`

## Content

- Articles are Markdown files in `content/articles/`, listed in `src/data/blogs.ts`
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

## Deploying

Cloudflare Pages builds on push: build command `npm run build`, output directory `dist`. The site needs no environment variables.

## Contact

Saif Aljanahi · [hello@1saif.me](mailto:hello@1saif.me) · [LinkedIn](https://linkedin.com/in/1saifj) · [GitHub](https://github.com/1saifj)
