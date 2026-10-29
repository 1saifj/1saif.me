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
npm run insights     # page views, likes and comments (README, Insights)
```

Node 18 or newer.

## Deploys

| What | Runs when | How |
| --- | --- | --- |
| The site | Every push to `main` | Cloudflare Pages project `1saif-me` builds with `npm run build` and serves `dist` |
| The contact Worker | A push to `main` that changes `workers/contact/*` | Cloudflare Workers Builds on the `1saif-contact` Worker: build command `npx vitest run workers`, deploy command `npx wrangler deploy -c workers/contact/wrangler.jsonc` |
| The reactions Worker | A push to `main` that changes `workers/reactions/*`, `src/data/blogs.ts` or `src/utils/slugUtils.ts` | Cloudflare Workers Builds on the `1saif-reactions` Worker: build command `npx vitest run workers`, deploy command `npx wrangler deploy -c workers/reactions/wrangler.jsonc` |

All three use Cloudflare's GitHub app and Cloudflare-managed build tokens, so the repo holds no deploy secrets. Wrangler keeps the secrets that are already on each Worker. Build logs: Workers & Pages → the Worker → Deployments.

The reactions Worker bundles the list of published posts, so it must deploy again when a post is added; until then, likes and comments on the new post answer 404. The watch paths above do that.

The first deploy of the reactions Worker needs its database tables and two secrets: the client secret of the [1saif.me comments](https://github.com/apps/1saif-me-comments) GitHub App (its client ID is in `wrangler.jsonc`), and a random key that signs the sign-in cookies:

```bash
npx wrangler d1 migrations apply 1saif-reactions --remote -c workers/reactions/wrangler.jsonc
npx wrangler secret put GITHUB_CLIENT_SECRET -c workers/reactions/wrangler.jsonc
openssl rand -base64 32 | npx wrangler secret put SESSION_SECRET -c workers/reactions/wrangler.jsonc
```

Apply each new file in `workers/reactions/migrations/` with the same `migrations apply` command before the deploy that needs it. A new `SESSION_SECRET` signs everyone out.

To deploy or roll back the Worker by hand:

```bash
npx wrangler@4 deploy -c workers/contact/wrangler.jsonc
npx wrangler@4 rollback -c workers/contact/wrangler.jsonc
npx wrangler@4 tail -c workers/contact/wrangler.jsonc
```

## Likes and comments

Post pages show a like button and comments, served by the reactions Worker (`workers/reactions`) from D1. Both need a sign-in with GitHub, and each GitHub account likes a post at most once. The sign-in reads the public profile only: the Worker keeps the account ID, username and name, and never keeps the GitHub token. Readers can delete their own comments.

A new comment shows at once and mails Saif, with the commands to hide it and to block its author. A blocked account cannot like or comment, and its comments drop off every post. To hide a comment, block an account, or list the latest comments:

```bash
npx wrangler d1 execute 1saif-reactions --remote --command "UPDATE comments SET hidden = 1 WHERE id = N"
npx wrangler d1 execute 1saif-reactions --remote --command "UPDATE users SET blocked = 1 WHERE login = 'name'"
npx wrangler d1 execute 1saif-reactions --remote --command "SELECT c.id, c.slug, u.login, c.body FROM comments c JOIN users u ON u.github_id = c.user_id ORDER BY c.id DESC LIMIT 20"
```

The page shows the change within 30 seconds (the edge cache time). For an erasure request, delete the account's rows: `DELETE FROM comments WHERE user_id = N`, then the same for `likes`, then `DELETE FROM users WHERE github_id = N`.

To run it locally, start the Worker (port 8797, set in its `wrangler.jsonc`); the Vite dev server sends `/api/posts`, `/api/auth` and `/api/collect` to it:

```bash
cp workers/reactions/.dev.vars.example workers/reactions/.dev.vars   # then fill in the GitHub App client ID and secret
npx wrangler d1 migrations apply 1saif-reactions --local -c workers/reactions/wrangler.jsonc
npx wrangler dev -c workers/reactions/wrangler.jsonc
VITE_INSIGHTS=1 npm run dev   # without VITE_INSIGHTS, dev sends no page views
```

The GitHub App sends the sign-in back only to its registered callback addresses: `https://1saif.me`, and `http://localhost:5173` and `http://localhost:5180` for dev. `SITE_URL` in `.dev.vars` must name the dev server you use.

## Insights

The same Worker records anonymous page views (path, referrer domain, language, country, device class, LCP, CLS, INP, TTFB) and like, unlike and comment events in Workers Analytics Engine. There is no cookie, no ID and no IP address. Browsers that send Do Not Track or Global Privacy Control, and automated browsers, send nothing. To read the numbers, make an API token with Account → Account Analytics → Read, then:

```bash
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run insights -- 30
```

It prints daily views, top pages with p75 LCP, INP, CLS and TTFB, per-post views (EN and AR), likes, comments and like rate, and the language, device, country and referrer splits. It ends with a 30-day forecast: a straight line through the full days, and the share of the Free limits that the busiest day (seen or forecast) would use. Data is kept for three months.

## Costs

The account is on the Workers Free plan with no payment method, so nothing can be billed. The Free limits are hard daily stops for the whole account (both Workers share them) and reset at 00:00 UTC:

| Service | Free limit | What this site uses |
| --- | --- | --- |
| Workers | 100,000 requests a day, 10 ms CPU each | About 2 requests per post view (the page-view beacon, and the likes and comments read near the end), 1 more for a signed-in reader (their own like), 1 per other page view, 1 per like or comment, 2 per sign-in. Cache hits and refused requests count too |
| D1 | 5 million rows read and 100,000 rows written a day | `ALL_LIKES` allows 15 likes a minute and `ALL_CLIENTS_COMMENTS` 10 comments a minute, per location: at most about 36,000 writes, or about 65,000 rows, a day. Triggers keep the like count, so a like or unlike costs a few rows, whatever the post's count. A read misses the 30 s edge cache at most twice a minute per post and location (and once after each new or deleted comment; a like keeps the cache, and the liker gets the exact count), and reads at most 401 rows: 200 comments, their authors and the count |
| Analytics Engine | 100,000 data points written and 10,000 read queries a day | `ALL_COLLECT` allows 40 page views a minute per location (57,600 a day), plus at most about 36,000 reaction events: about 93,600 in all from one location. The caps count per location, so traffic from many locations at once can go higher; the writes then stop for the day, and nothing is billed. One `npm run insights` run is 11 queries |

Every query uses a primary key or the `comments_by_post` index, so no request scans a table. Rate limits are counted per Cloudflare location, so traffic spread over many locations can pass the caps.

Every like and comment needs a GitHub account, and each account is rate limited on its own, so faking them takes many accounts. Under a sustained attack, the Workers request limit is the first to go, because refused requests count too. When a limit is hit, only the `/api/` paths stop until the reset: a D1 limit stops likes and comments on every post, and the Workers request limit also stops page-view counts and the contact form. The site is static on Pages and keeps working. To switch the reactions Worker off at once, run `npx wrangler delete -c workers/reactions/wrangler.jsonc`, or remove its `routes` and deploy; post pages then show that the comments did not load.

To stop a flood before it reaches any Worker (blocked requests do not count), change the zone's WAF rate limiting rule (Security → WAF → Rate limiting rules) from `URI Path equals /api/contact` to `URI Path starts with /api/`, 10 requests per 10 seconds per IP.

## Contact

Saif Aljanahi · [hello@1saif.me](mailto:hello@1saif.me) · [LinkedIn](https://linkedin.com/in/1saifj) · [GitHub](https://github.com/1saifj)
