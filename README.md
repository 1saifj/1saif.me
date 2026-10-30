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
npm run insights     # page speed and view splits from Analytics Engine (README, Insights)
```

Node 18 or newer.

## Deploys

| What | Runs when | How |
| --- | --- | --- |
| The site | Every push to `main` | Cloudflare Pages project `1saif-me` builds with `npm run build` and serves `dist` |
| The contact Worker | A push to `main` that changes `workers/contact/*` | Cloudflare Workers Builds on the `1saif-contact` Worker: build command `npx vitest run workers`, deploy command `npx wrangler deploy -c workers/contact/wrangler.jsonc` |
| The reactions Worker | A push to `main` that changes `workers/reactions/*` or `src/utils/slugUtils.ts` | Cloudflare Workers Builds on the `1saif-reactions` Worker: build command `npx vitest run workers`, deploy command `npx wrangler deploy -c workers/reactions/wrangler.jsonc` |

The site and both Workers use Cloudflare's GitHub app and Cloudflare-managed build tokens, so the repo holds no deploy secrets. Wrangler keeps the secrets that are already on each Worker. Build logs: Workers & Pages → the Worker → Deployments.

A new post needs no Worker deploy: the Worker bundles the posts published when it was deployed, and it knows a later post by its live page (`isPost` in `workers/reactions/src/index.ts`).

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

Post pages show a like button and comments, served by the reactions Worker (`workers/reactions`) from D1. Both need a sign-in with GitHub, and each GitHub account likes a post at most once. The sign-in reads the public profile only: the Worker keeps the account ID, username and name, and never keeps the GitHub token. Readers can edit their own comments, up to 10 times each, and the comment then shows "edited". Only the latest text is kept. Readers can delete their own comments: the text goes at once, and an empty hidden row stays, so the daily cap of 10 comments still counts it.

A new or edited comment shows at once and mails Saif, with the commands to hide it and to block its author, so no comment can change after Saif has read it. One account can post at most 10 comments on one post in 24 hours (hidden ones count), so no account can fill a post. A blocked account cannot like or comment, and its comments drop off every post; the block command also removes its likes. To hide a comment, block an account, or list the latest comments:

```bash
npx wrangler d1 execute 1saif-reactions --remote --command "UPDATE comments SET hidden = 1 WHERE id = N"
npx wrangler d1 execute 1saif-reactions --remote --command "UPDATE users SET blocked = 1 WHERE login = 'name'; DELETE FROM likes WHERE user_id = (SELECT github_id FROM users WHERE login = 'name')"
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

Open [1saif.me/insights](https://1saif.me/insights) signed in with the GitHub account in `OWNER_GITHUB_ID` (`workers/reactions/wrangler.jsonc`); everyone else gets a 404 from `/api/insights`. For 7, 30 or 90 days it compares each total with the period before: visitors, views, time per visitor, engaged visits (more than one page, or 10 s on one), likes and comments. It also shows where visits start (channel, source and campaign), devices, browsers, systems and countries, each with the share of its visits that was engaged, a weekday-and-hour map, each page's visitors, entries, time and reading depth, and page speed per device at Google's p75 test. Export CSV saves the page table. Changes in views show only when the whole period before was recorded, because a partly recorded period would inflate them. Days are Baghdad time.

- The reactions Worker counts each page view in D1 (`views`, one row per visitor, page and day) and in Workers Analytics Engine.
- A visitor ID is a SHA-256 hash of a random salt for the day, the IP address and the User-Agent. The Worker deletes the salts of earlier days (`salts`), so an old ID cannot be matched to an IP address again. There is no cookie and the IP address is not stored. A visitor counts once a day for each page, so a reader on two days counts twice.
- Each row keeps the first view's details: hour, language, country, device, browser and system (families, no versions), and where the visit came from. Later views add to `views`, the visible `seconds` (at most 30 minutes a beacon) and the deepest `scroll` in percent, and keep the first measured LCP, INP, CLS and TTFB.
- Where a visit came from is read once, on the page it started on (`entry = 1`). The channel is the first that matches: paid (a paid `utm_medium`, or a click ID such as `gclid` or `msclkid`, of which only the name is sent; share and email IDs such as `igsh` and `mc_cid` mark social and email visits that come with no referrer), email, AI assistants (`utm_source=chatgpt.com` or `utm_source=gemini`, or a Perplexity, Gemini, Claude or Copilot referrer), social, search, referral, then direct. AI comes before search because Gemini is on google.com.
- Automated browsers, speed-test tools and AI agents that name themselves (such as `Google-Agent`) or sign their requests (`Signature-Agent`, such as ChatGPT agent) are not counted, and neither are the owner's own views. A headless browser that hides behind a normal browser string is still counted. Browsers that send Do Not Track or Global Privacy Control are counted the same anonymous way.

For page speed (p75 LCP, INP, CLS and TTFB), referrer, device and country splits by views, and a 30-day forecast, read Analytics Engine with an API token that has Account → Account Analytics → Read. Analytics Engine keeps data for three months:

```bash
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run insights -- 30
```

## Costs

The account is on the Workers Free plan with no payment method, so nothing can be billed. The Free limits are hard daily stops for the whole account (both Workers share them) and reset at 00:00 UTC:

| Service | Free limit | What this site uses |
| --- | --- | --- |
| Workers | 100,000 requests a day, 10 ms CPU each | About 2 requests per post view (the page-view beacon, and the likes and comments read near the end), 1 more for a signed-in reader (their own like), 1 per other page view, 1 per like, comment or edit, 2 per sign-in. Cache hits and refused requests count too |
| D1 | 5 million rows read and 100,000 rows written a day | `ALL_LIKES` allows 15 likes a minute and `ALL_CLIENTS_COMMENTS` 10 comments or edits a minute, per location: at most about 36,000 writes, or about 65,000 rows, a day. A page view writes one `views` row, and `ALL_COLLECT` allows 20 a minute per location (28,800 a day), so one location stays under the limit. A report reads every `views` row in its range and the period before about ten times, and the page shows the rows it read and their share of the daily limit. The page keeps each range it loaded, so switching back costs nothing. Triggers keep the like count, so a like or unlike costs a few rows, whatever the post's count. A read misses the 30 s edge cache at most twice a minute per post and location (and once after each new, edited or deleted comment; a like keeps the cache, and the liker gets the exact count), and reads about 401 rows for a post with 200 comments: the comments, their authors and the count (more when a blocked account's comments sit among them). So a post with 200 comments that one location reads every 30 s costs about 1.2 million rows a day, and about four such posts reach the limit |
| Analytics Engine | 100,000 data points written and 10,000 read queries a day | `ALL_COLLECT` allows 20 page views a minute per location (28,800 a day), plus at most about 36,000 reaction events: about 64,800 in all from one location. The caps count per location, so traffic from many locations at once can go higher; the writes then stop for the day, and nothing is billed. One `npm run insights` run is 11 queries |

Every query uses a primary key or an index (`comments_by_post`, and `comments_by_author` for the daily cap), so no request scans a table. Rate limits are counted per Cloudflare location, so traffic spread over many locations can pass the caps.

Every like and comment needs a GitHub account, and each account is rate limited on its own, so faking them takes many accounts. Under a sustained attack, the Workers request limit is the first to go, because refused requests count too. When a limit is hit, only the `/api/` paths stop until the reset: a D1 limit stops likes and comments on every post, and the Workers request limit also stops page-view counts and the contact form. The site is static on Pages and keeps working. To switch the reactions Worker off at once, run `npx wrangler delete -c workers/reactions/wrangler.jsonc`, or remove its `routes` and deploy; post pages then show that the comments did not load.

The zone's one Free WAF rate limiting rule (Security → Security rules → Rate limiting rules) stops a burst before it reaches any Worker, and blocked requests do not count: `URI Path starts with /api/`, 10 requests per 10 seconds per IP, then a 10-second block. A post view sends at most 3 `/api/` requests, so a reader stays far below it. It does not stop a steady stream: one IP just under it sends about 86,000 requests a day, most of the shared Workers limit.

Known limits, accepted for a personal blog:
- Page views over `ALL_COLLECT` (20 a minute per location) are not counted, so a sudden rush of readers shows lower than it was.
- A page view sends its one beacon when the tab is first hidden, so time read after the reader comes back is not counted.
- For a page left by an in-site link, the scroll depth uses the page height seen while scrolling, which can be a loading placeholder, so a short page can show as read to the end.
- Each accepted comment or edit mails Saif, and nothing caps the mails a day: `ALL_CLIENTS_COMMENTS` allows 10 a minute per location.
- The global comment cap counts before the blocked check, because checking first would cost a D1 read per request. So blocked accounts still posting can make others wait for the next minute.
- A post reply read just before a comment is saved can reach the edge cache just after the purge, so that location shows the old reply for up to 30 s more.

## Contact

Saif Aljanahi · [hello@1saif.me](mailto:hello@1saif.me) · [LinkedIn](https://linkedin.com/in/1saifj) · [GitHub](https://github.com/1saifj)
