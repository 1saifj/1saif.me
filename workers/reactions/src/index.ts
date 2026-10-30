// Likes and comments on blog posts, the GitHub sign-in that both need, and the site's anonymous
// page views. Cheap checks and the rate limits run before any D1 call, so junk traffic never costs a
// database row.

import { publishedBlogs } from '../../../src/data/blogs'
import { createSlugFromTitle } from '../../../src/utils/slugUtils'

// Workers adds the zone's own cache to the Cache API.
declare global {
  interface CacheStorage {
    readonly default: Cache
  }
}

interface CommentEmail {
  to: string
  from: { email: string; name: string }
  subject: string
  text: string
}

interface SendEmail {
  send(message: CommentEmail): Promise<{ messageId: string }>
}

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

interface D1Result<Row> {
  results: Row[]
  meta: { changes: number; rows_read?: number }
}

interface D1Statement {
  bind(...values: (string | number | null)[]): D1Statement
  first<Row>(): Promise<Row | null>
  all<Row>(): Promise<D1Result<Row>>
}

interface D1Session {
  prepare(query: string): D1Statement
  batch<Row>(statements: D1Statement[]): Promise<D1Result<Row>[]>
}

interface D1Database extends D1Session {
  withSession(constraint: 'first-unconstrained'): D1Session
}

interface AnalyticsEngine {
  writeDataPoint(point: { indexes: string[]; blobs: string[]; doubles: number[] }): void
}

interface Context {
  waitUntil(promise: Promise<unknown>): void
}

export interface Env {
  DB: D1Database
  EMAIL: SendEmail
  EVENTS?: AnalyticsEngine
  PER_CLIENT_LIKES: RateLimit
  PER_CLIENT_COMMENTS: RateLimit
  ALL_CLIENTS_COMMENTS: RateLimit
  ALL_LIKES: RateLimit
  PER_CLIENT_COLLECT: RateLimit
  ALL_COLLECT: RateLimit
  PER_CLIENT_AUTH: RateLimit
  // https://1saif.me, or the Vite dev server under wrangler dev (.dev.vars). Writes must come from it,
  // and GitHub sends the visitor back to it.
  SITE_URL: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  // Signs the session cookie. Changing it signs everyone out.
  SESSION_SECRET: string
  // The site owner's GitHub account: only it reads /api/insights, and its own page views are not counted.
  OWNER_GITHUB_ID: string
}

// The GitHub profile fields the site keeps. The avatar comes from the ID, so no URL is stored.
interface Author {
  id: number
  login: string
  name: string | null
}

interface PostComment {
  id: number
  body: string
  createdAt: number
  editedAt: number | null
  author: Author
}

interface CommentRow {
  id: number
  body: string
  createdAt: number
  editedAt: number | null
  userId: number
  login: string
  name: string | null
}

// One batch reads the count row and the comment rows, so its rows carry either set of columns.
type PostRow = CommentRow & { likes: number }

interface GitHubUser {
  id?: unknown
  login?: unknown
  name?: unknown
}

// The signed cookie payloads. `use` keeps a sign-in cookie from passing as a session.
interface Flow {
  use: 'flow'
  state: string
  verifier: string
  back: string
  exp: number
}

interface Session extends Author {
  use: 'session'
  exp: number
}

// The JSON bodies as the browser sends them. Every field is coerced and checked before use.
interface LikeBody {
  language?: string
}

interface Beacon {
  path?: string
  ref?: string
  lang?: string
  touch?: boolean
  entry?: boolean
  source?: string
  medium?: string
  campaign?: string
  // The landing URL's query parameter names, comma-separated, without their values.
  keys?: string
  seconds?: number
  scroll?: number
  lcp?: number
  cls?: number
  inp?: number
  ttfb?: number
}

const SITE_ORIGIN = 'https://1saif.me'

const SLUGS = new Set(publishedBlogs.map(post => createSlugFromTitle(post.title)))

// The list above is bundled at deploy time. A post published after that is known by its live page, so it needs
// no Worker deploy. Pages answers a missing page with 404 and a renamed one with a redirect, so only 200 counts.
async function isPost(slug: string): Promise<boolean> {
  if (!slug) return false

  if (SLUGS.has(slug)) return true

  const page = await fetch(`${SITE_ORIGIN}/blog/${slug}`, { method: 'HEAD', redirect: 'manual' }).catch(() => undefined)

  if (page?.status !== 200) return false

  SLUGS.add(slug)

  return true
}

const ROUTE = /^\/api\/posts\/([a-z0-9-]{1,120})(?:\/(like|comments)(?:\/([1-9]\d{0,11}))?)?$/

// Comments live only on post pages, so a sign-in returns only to one of them, or to the owner's insights page.
const RETURN_PATH = /^\/(?:ar\/)?(?:blog\/([a-z0-9-]{1,120})|insights)$/

const LOGIN = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/

// URL-encoding makes one Arabic letter 6 bytes and one Chinese or Japanese character 9, so 2,000 characters need up to 18 KB.
const MAX_COMMENT_BYTES = 20_480

const MAX_SMALL_BYTES = 2_048

const MAX_NAME = 100

const MAX_MESSAGE = 2_000

// shortcut: the newest 200 only; page the list when a post gets near that many.
const MAX_COMMENTS = 200

// One account's comments on one post in 24 hours. The rate limits are per minute, so without this one account
// could fill a post with 20 KB comments, and every reader would download them.
const DAILY_COMMENTS = 10

const DAY_MS = 86_400_000

// Each edit mails Saif, so one comment takes at most this many edits.
const MAX_EDITS = 10

// Control characters, except tab and line breaks, which a message may hold.
// eslint-disable-next-line no-control-regex -- matching control characters is the point.
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/

// eslint-disable-next-line no-control-regex -- a display name keeps no control character or line break.
const ANY_CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/g

// Direction marks and overrides, zero-width space, word joiner and BOM: they could make a name read as another one.
// Zero-width (non-)joiners stay, because Persian names and emoji need them.
const INVISIBLE_FORMAT = /[\u061c\u200b\u200e\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/g

const SESSION_COOKIE = '__Host-session'

// Readable by the page: it holds only the public profile, so the page knows who is signed in without a request.
const VIEWER_COOKIE = '__Host-viewer'

const FLOW_COOKIE = '__Host-github-flow'

const SESSION_SECONDS = 30 * 24 * 60 * 60

// GitHub's consent screen has ten minutes to send the visitor back.
const FLOW_SECONDS = 600

const GITHUB_HEADERS = { Accept: 'application/vnd.github+json', 'User-Agent': '1saif.me-comments', 'X-GitHub-Api-Version': '2026-03-10' }

// Speed tests run a real browser on a slowed network, so their numbers would skew the speed counts. AI agents that
// browse for a person name themselves with these tokens, or sign their requests (Signature-Agent, checked in collect).
const BOT = /bot|crawl|spider|headless|lighthouse|pagespeed|gtmetrix|ptst|google-agent|grokagent|chatgpt-user|claude-user|perplexity-user|muse-/i

const reply = <Body,>(status: number, body: Body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

const fail = (status: number, error: string) => reply(status, { error })

const ignored = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })

const languageOf = (value: string | null | undefined) => value === 'ar' ? 'ar' : 'en'

// SAFETY: Cloudflare adds request.cf at the edge; it is absent in tests and wrangler dev, so every read is optional.
const countryOf = (request: Request) => (request as Request & { cf?: { country?: string } }).cf?.country ?? ''

// Analytics must never fail a request: the binding is missing in tests, and a full dataset only drops points.
function track(env: Env, index: string, blobs: string[], doubles: number[] = [1]) {
  try {
    env.EVENTS?.writeDataPoint({ indexes: [index], blobs, doubles })
  } catch {
    console.warn('analytics write failed')
  }
}

// The one cache key per post, so every visitor and every language shares one cached reply.
const cacheKey = (slug: string) => new Request(`${SITE_ORIGIN}/api/posts/${slug}`)

// Every visitor gets the same reply, so it holds nothing about the viewer and can be cached. Only the edge keeps
// it (s-maxage), and a write clears that copy; a browser copy would hide a new comment after a reload.
const POST_CACHE_CONTROL = 'public, max-age=0, s-maxage=30'

async function readPost(slug: string, env: Env, ctx: Context): Promise<Response> {
  const cache = caches.default
  const cached = await cache.match(cacheKey(slug))

  if (cached) {
    // The zone's Browser Cache TTL (4 hours by default) raises max-age on a cache hit, so the header is set again.
    const reply = new Response(cached.body, cached)

    reply.headers.set('Cache-Control', POST_CACHE_CONTROL)

    return reply
  }

  // Reads may come from the nearest D1 replica; a few seconds of lag is fine for counts and comments.
  const db = env.DB.withSession('first-unconstrained')

  // A blocked user's comments drop out here, so one flag hides all of them.
  const [stats, comments] = await db.batch<PostRow>([
    db.prepare('SELECT likes FROM post_stats WHERE slug = ?').bind(slug),
    db.prepare(`SELECT c.id, c.body, c.created_at AS createdAt, c.edited_at AS editedAt, u.github_id AS userId, u.login, u.name
      FROM comments c JOIN users u ON u.github_id = c.user_id
      WHERE c.slug = ? AND c.hidden = 0 AND u.blocked = 0 ORDER BY c.created_at DESC LIMIT ?`).bind(slug, MAX_COMMENTS),
  ])

  const list: PostComment[] = comments.results.reverse().map(row => ({
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    editedAt: row.editedAt,
    author: { id: row.userId, login: row.login, name: row.name },
  }))

  const response = Response.json({ likes: stats.results[0]?.likes ?? 0, comments: list }, { headers: { 'Cache-Control': POST_CACHE_CONTROL } })

  ctx.waitUntil(cache.put(cacheKey(slug), response.clone()))

  return response
}

// shortcut: the Cache API is per location, so other locations may serve the old reply for up to 30 s; lower s-maxage if readers notice.
const forget = (slug: string) => caches.default.delete(cacheKey(slug))

const likedBy = (env: Env, slug: string, userId: number) =>
  env.DB.prepare('SELECT COUNT(*) AS liked FROM likes WHERE slug = ? AND user_id = ?').bind(slug, userId)

// The viewer's own like, and the exact count, are read apart from the post, so the cached post reply stays the same for everyone.
async function likeState(request: Request, slug: string, env: Env): Promise<Response> {
  const session = await sessionOf(request, env)

  if (!session) return fail(401, 'auth')

  const [own, counted] = await env.DB.batch<{ likes: number; liked: number }>([likedBy(env, slug, session.id), env.DB.prepare('SELECT likes FROM post_stats WHERE slug = ?').bind(slug)])

  return reply(200, { likes: counted.results[0]?.likes ?? 0, liked: (own.results[0]?.liked ?? 0) > 0 })
}

async function like(request: Request, slug: string, env: Env): Promise<Response> {
  const session = await sessionOf(request, env)

  if (!session) return fail(401, 'auth')

  if (!(await env.PER_CLIENT_LIKES.limit({ key: `user:${session.id}` })).success) return fail(429, 'rate')

  const body = await request.text()

  if (body.length > MAX_SMALL_BYTES) return fail(413, 'size')

  let parsed: LikeBody

  try {
    parsed = JSON.parse(body) ?? {}
  } catch {
    return fail(400, 'invalid')
  }

  // Likes have their own global bucket, so a burst of likes cannot use up the comments' budget.
  if (!(await env.ALL_LIKES.limit({ key: 'all' })).success) return fail(429, 'rate')

  const liking = request.method === 'PUT'

  // The primary key allows one like per account and post. A blocked account adds none: the row comes from users only
  // while it is not blocked. Triggers on likes keep post_stats exact (migrations/0004). A like keeps the cached post
  // reply: the liker gets the exact count here, so a burst of likes never turns into a burst of comment reads.
  const [changed, counted, own] = await env.DB.batch<{ likes: number; liked: number }>([
    liking
      ? env.DB.prepare('INSERT OR IGNORE INTO likes (slug, user_id, created_at) SELECT ?, github_id, ? FROM users WHERE github_id = ? AND blocked = 0')
        .bind(slug, Date.now(), session.id)
      : env.DB.prepare('DELETE FROM likes WHERE slug = ? AND user_id = ?').bind(slug, session.id),
    env.DB.prepare('SELECT likes FROM post_stats WHERE slug = ?').bind(slug),
    likedBy(env, slug, session.id),
  ])

  if (changed.meta.changes > 0) track(env, slug, [liking ? 'like' : 'unlike', countryOf(request), languageOf(parsed.language)])

  return reply(200, { likes: counted.results[0]?.likes ?? 0, liked: (own.results[0]?.liked ?? 0) > 0 })
}

// A new comment, or with an id the author's edit of their own comment. Both pass the same checks and limits.
async function comment(request: Request, slug: string, env: Env, ctx: Context, id?: number): Promise<Response> {
  if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) return fail(415, 'type')

  const session = await sessionOf(request, env)

  if (!session) return fail(401, 'auth')

  const body = await request.text()

  if (body.length > MAX_COMMENT_BYTES) return fail(413, 'size')

  const form = new URLSearchParams(body)
  const language = languageOf(form.get('language'))

  const reject = (status: number, error: string, reason: string) => {
    track(env, slug, ['comment_rejected', countryOf(request), language, reason])

    return fail(status, error)
  }

  // Not tracked: a flood from one account must not spend the analytics budget.
  if (!(await env.PER_CLIENT_COMMENTS.limit({ key: `user:${session.id}` })).success) return fail(429, 'rate')

  // Not tracked either, and checked before anything that is: every analytics point then passed this global cap,
  // so many accounts together cannot spend more than the README's bound.
  if (!(await env.ALL_CLIENTS_COMMENTS.limit({ key: 'all' })).success) return fail(429, 'rate')

  // Browsers send textarea line breaks as CRLF; one form keeps the stored length honest.
  const message = (form.get('message') ?? '').trim().replace(/\r\n?/g, '\n')

  if (message.length === 0 || message.length > MAX_MESSAGE || CONTROL_CHARACTERS.test(message)) return reject(400, 'invalid', 'invalid')

  const now = Date.now()

  // Both statements read the user row, so a blocked user gets no row back and nothing is saved. An edit matches only
  // the author's own visible comment, and keeps its place and date. 'hidden IN (0, 1)' lets comments_by_post
  // (slug, hidden, created_at) find the day's rows, so D1 reads only those. An edit adds no row, so it skips that cap.
  const row = await (id
    ? env.DB.prepare(`UPDATE comments SET body = ?, edited_at = ?, edits = edits + 1 WHERE id = ? AND slug = ? AND user_id = ? AND hidden = 0 AND edits < ?
        AND EXISTS (SELECT 1 FROM users WHERE github_id = ? AND blocked = 0) RETURNING id, created_at AS createdAt`)
      .bind(message, now, id, slug, session.id, MAX_EDITS, session.id)
    : env.DB.prepare(`INSERT INTO comments (slug, user_id, body, created_at) SELECT ?, github_id, ?, ? FROM users WHERE github_id = ? AND blocked = 0
        AND (SELECT COUNT(*) FROM comments WHERE slug = ? AND hidden IN (0, 1) AND created_at > ? AND user_id = ?) < ? RETURNING id, created_at AS createdAt`)
      .bind(slug, message, now, session.id, slug, now - DAY_MS, session.id, DAILY_COMMENTS)
  ).first<{ id: number; createdAt: number }>()

  if (!row) {
    // Why nothing was saved: a blocked account, the daily cap, the edit cap, or no visible comment of this author.
    const user = await env.DB.prepare('SELECT blocked, (SELECT edits FROM comments WHERE id = ? AND slug = ? AND user_id = github_id AND hidden = 0) AS edits FROM users WHERE github_id = ?')
      .bind(id ?? null, slug, session.id)
      .first<{ blocked: number; edits: number | null }>()

    if (user?.blocked !== 0) return reject(403, 'blocked', 'blocked')

    if (!id) return reject(429, 'daily', 'daily')

    return user.edits === null ? fail(404, 'comment') : reject(429, 'edits', 'edits')
  }

  await forget(slug)
  track(env, slug, [id ? 'comment_edited' : 'comment', countryOf(request), language])

  const author: Author = { id: session.id, login: session.login, name: session.name }

  // The comment is saved and shown at once; a failed email must not fail the request.
  ctx.waitUntil(env.EMAIL.send({
    // The runtime requires a recipient; the binding allows only this one.
    to: 'saifalialjanahi@gmail.com',
    from: { email: 'hello@1saif.me', name: '1saif.me comments' },
    // An edit is mailed too, so a comment cannot change after Saif has read it.
    subject: `${id ? 'Edited' : 'New'} comment on ${slug}`,
    // The commands come first, so text in the comment cannot pass for one of them.
    text: `To hide this comment:\nnpx wrangler d1 execute 1saif-reactions --remote --command "UPDATE comments SET hidden = 1 WHERE id = ${row.id}"\n\nTo hide every comment of @${author.login}, remove their likes, and refuse new ones:\nnpx wrangler d1 execute 1saif-reactions --remote --command "UPDATE users SET blocked = 1 WHERE github_id = ${author.id}; DELETE FROM likes WHERE user_id = ${author.id}"\n\n--\n${author.name ?? author.login} (https://github.com/${author.login}) ${id ? 'edited their comment' : 'wrote'} on ${SITE_ORIGIN}/blog/${slug}:\n\n${message}`,
  }).catch(error => {
    // Log the code only: the subject and text hold visitor data.
    console.error('send failed', error instanceof Error && 'code' in error ? error.code : 'no code')
  }))

  return reply(id ? 200 : 201, { id: row.id, body: message, createdAt: row.createdAt, editedAt: id ? now : null, author } satisfies PostComment)
}

// The author deletes the comment's text for good; nobody else can, so the row's user_id must match the session.
// The empty row stays hidden, so it still counts toward DAILY_COMMENTS and posting and deleting cannot go on all day.
async function removeComment(request: Request, slug: string, id: number, env: Env): Promise<Response> {
  const session = await sessionOf(request, env)

  if (!session) return fail(401, 'auth')

  if (!(await env.PER_CLIENT_COMMENTS.limit({ key: `user:${session.id}` })).success) return fail(429, 'rate')

  const { meta } = await env.DB.prepare("UPDATE comments SET body = '', hidden = 1 WHERE id = ? AND slug = ? AND user_id = ? AND body != ''").bind(id, slug, session.id).all()

  if (meta.changes === 0) return fail(404, 'comment')

  await forget(slug)

  return reply(200, { id })
}

const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromBase64url = (text: string) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), character => character.charCodeAt(0))

const encodeJson = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)))

const hmacKey = (env: Env) => crypto.subtle.importKey('raw', new TextEncoder().encode(env.SESSION_SECRET.trim()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])

async function sign(value: Flow | Session, env: Env): Promise<string> {
  const payload = encodeJson(value)
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(env), new TextEncoder().encode(payload))

  return `${payload}.${base64url(new Uint8Array(signature))}`
}

// The payload, only when the signature matches and it has not expired. verify compares in constant time.
async function unsign(token: string | undefined, env: Env): Promise<Flow | Session | undefined> {
  const [payload, signature, extra] = (token ?? '').split('.')

  if (!payload || !signature || extra !== undefined) return undefined

  try {
    if (!(await crypto.subtle.verify('HMAC', await hmacKey(env), fromBase64url(signature), new TextEncoder().encode(payload)))) return undefined

    // SAFETY: the Worker signed this JSON itself (see sign), so it has one of the two payload shapes; exp is checked below.
    const value = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as Flow | Session

    return typeof value.exp === 'number' && value.exp > Date.now() ? value : undefined
  } catch {
    return undefined
  }
}

function cookie(request: Request, name: string): string | undefined {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=')

    if (key === name) return value.join('=')
  }

  return undefined
}

// __Host- cookies must be Secure, host-only and on path /. Lax keeps them off cross-site POSTs.
const setCookie = (name: string, value: string, seconds: number, httpOnly = true) =>
  `${name}=${value}; Path=/; Max-Age=${seconds}; Secure; SameSite=Lax${httpOnly ? '; HttpOnly' : ''}`

async function sessionOf(request: Request, env: Env): Promise<Session | undefined> {
  const value = await unsign(cookie(request, SESSION_COOKIE), env)

  return value?.use === 'session' ? value : undefined
}

const callbackUrl = (env: Env) => `${env.SITE_URL}/api/auth/github/callback`

async function returnPath(value: string | null): Promise<string> {
  const match = RETURN_PATH.exec(value ?? '')

  return match && (!match[1] || await isPost(match[1])) ? match[0] : '/blog'
}

function displayName(value: unknown): string | null {
  const name = typeof value === 'string' ? value.replace(ANY_CONTROL_CHARACTER, ' ').replace(INVISIBLE_FORMAT, '').trim().slice(0, MAX_NAME) : ''

  return name || null
}

// Sends the visitor to GitHub. The state and the PKCE verifier wait in a signed cookie for the callback.
async function startSignIn(env: Env, url: URL, ip: string): Promise<Response> {
  if (!(await env.PER_CLIENT_AUTH.limit({ key: ip })).success) return fail(429, 'rate')

  const state = base64url(crypto.getRandomValues(new Uint8Array(16)))
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))
  const flow = await sign({ use: 'flow', state, verifier, back: await returnPath(url.searchParams.get('return')), exp: Date.now() + FLOW_SECONDS * 1000 }, env)

  const authorize = new URL('https://github.com/login/oauth/authorize')

  authorize.search = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: callbackUrl(env),
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString()

  return new Response(null, { status: 302, headers: { Location: authorize.toString(), 'Set-Cookie': setCookie(FLOW_COOKIE, flow, FLOW_SECONDS), 'Cache-Control': 'no-store' } })
}

// Trades the code for a token and reads the profile once. The site never keeps the token, and the app has no
// permissions, so it can read only public data. Revoking it would also end the app authorization (GitHub removes
// it with the last token), and every sign-in would then ask for consent again.
async function gitHubUser(code: string, verifier: string, env: Env): Promise<Author | undefined> {
  try {
    const exchange = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'User-Agent': GITHUB_HEADERS['User-Agent'] },
      body: new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET.trim(), code, redirect_uri: callbackUrl(env), code_verifier: verifier }),
      signal: AbortSignal.timeout(10_000),
    })

    // SAFETY: GitHub's documented token reply; a refused code still answers 200 with an error field, so the token is checked below.
    const { access_token: token } = await exchange.json().catch(() => ({})) as { access_token?: unknown }

    if (typeof token !== 'string' || !token) {
      console.warn('github code exchange failed', exchange.status)

      return undefined
    }

    const profile = await fetch('https://api.github.com/user', { headers: { ...GITHUB_HEADERS, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000) })

    if (!profile.ok) {
      console.warn('github profile read failed', profile.status)

      return undefined
    }

    // SAFETY: GitHub's documented user reply; every field read is checked below.
    const user = await profile.json() as GitHubUser
    const id = Number(user.id)
    const login = String(user.login ?? '')

    return Number.isSafeInteger(id) && id > 0 && LOGIN.test(login) ? { id, login, name: displayName(user.name) } : undefined
  } catch {
    // A timeout or a network failure must end the sign-in, not become an unhandled 500.
    console.warn('github sign-in failed')

    return undefined
  }
}

async function finishSignIn(request: Request, env: Env, url: URL, ip: string): Promise<Response> {
  const value = await unsign(cookie(request, FLOW_COOKIE), env)
  const flow = value?.use === 'flow' ? value : undefined
  const back = flow?.back ?? '/blog'

  const done = (cookies: string[]) => {
    const headers = new Headers({ Location: `${back}${cookies.length ? '' : '?signin=failed'}#comments-title`, 'Cache-Control': 'no-store' })

    headers.append('Set-Cookie', setCookie(FLOW_COOKIE, '', 0))
    cookies.forEach(item => headers.append('Set-Cookie', item))

    return new Response(null, { status: 303, headers })
  }

  const code = url.searchParams.get('code') ?? ''

  // The state ties this reply to the sign-in this browser started, so a link from elsewhere cannot
  // sign the visitor in as someone else. A refusal on GitHub arrives with an error and no code.
  if (!flow || !code || code.length > 100 || url.searchParams.get('state') !== flow.state) return done([])

  // A flow cookie stays valid for its ten minutes, so a replay is limited before it reaches GitHub.
  if (!(await env.PER_CLIENT_AUTH.limit({ key: ip })).success) return done([])

  const user = await gitHubUser(code, flow.verifier, env)

  if (!user) return done([])

  const now = Date.now()

  await env.DB.prepare('INSERT INTO users (github_id, login, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (github_id) DO UPDATE SET login = excluded.login, name = excluded.name, updated_at = excluded.updated_at WHERE login IS NOT excluded.login OR name IS NOT excluded.name')
    .bind(user.id, user.login, user.name, now, now)
    .all()

  const session = await sign({ use: 'session', ...user, exp: now + SESSION_SECONDS * 1000 }, env)

  return done([setCookie(SESSION_COOKIE, session, SESSION_SECONDS), setCookie(VIEWER_COOKIE, encodeJson(user), SESSION_SECONDS, false)])
}

function auth(request: Request, env: Env, url: URL, ip: string): Promise<Response> | Response {
  const route = `${request.method} ${url.pathname}`

  if (route === 'GET /api/auth/github') return startSignIn(env, url, ip)

  if (route === 'GET /api/auth/github/callback') return finishSignIn(request, env, url, ip)

  if (route !== 'POST /api/auth/logout') return fail(404, 'route')

  if (request.headers.get('Origin') !== env.SITE_URL) return fail(403, 'origin')

  const headers = new Headers({ 'Cache-Control': 'no-store' })

  headers.append('Set-Cookie', setCookie(SESSION_COOKIE, '', 0))
  headers.append('Set-Cookie', setCookie(VIEWER_COOKIE, '', 0, false))

  return new Response(null, { status: 204, headers })
}

const vital = (value: number | undefined) => {
  const number = Number(value ?? -1)

  return Number.isFinite(number) && number >= 0 ? number : -1
}

// Core Web Vitals limits (web.dev): good at or under the first, poor over the second. LCP, INP and TTFB in ms.
const SPEED: [string, number, number][] = [['lcp', 2500, 4000], ['inp', 200, 500], ['cls', 0.1, 0.25], ['ttfb', 800, 1800]]

// A measured value, or NULL: in-site page changes have no LCP or TTFB, and a page without input has no INP.
const measured = (value: number | undefined, digits = 0) => {
  const number = vital(value)

  return number < 0 ? null : Number(number.toFixed(digits))
}

// iPadOS Safari sends the Mac browser string, so a Mac with a touch screen is an iPad.
const isPad = (agent: string, touch: boolean) => touch && agent.includes('Macintosh')

function deviceOf(agent: string, touch: boolean) {
  if (/iPad|Tablet|Kindle|Silk/.test(agent) || (agent.includes('Android') && !agent.includes('Mobile')) || isPad(agent, touch)) return 'tablet'

  return /Mobi|iPhone|iPod|Android/.test(agent) ? 'mobile' : agent ? 'desktop' : ''
}

// In order: Edge, Opera, Brave, Samsung Internet and in-app browsers also name Chrome or Safari. Brave is only in
// the Sec-CH-UA brands, which Chromium browsers send.
const BROWSERS: [string, RegExp][] = [
  ['Edge', /Edg(?:e|A|iOS)?\/|Microsoft Edge/],
  ['Opera', /OPR\/|OPiOS|Opera/],
  ['Brave', /Brave/],
  ['Samsung Internet', /SamsungBrowser/],
  ['Firefox', /Firefox|FxiOS/],
  ['In-app', /FBAN|FBAV|Instagram|LinkedInApp|Snapchat|musical_ly|BytedanceWebview/],
  ['Chrome', /Chrome|CriOS|Chromium/],
  ['Safari', /Safari/],
]

// In order: iPhone browsers also say "like Mac OS X", and Android also says Linux.
const SYSTEMS: [string, RegExp][] = [['iOS', /iPhone|iPad|iPod/], ['Android', /Android/], ['ChromeOS', /CrOS/], ['Windows', /Windows/], ['macOS', /Macintosh/], ['Linux', /Linux|X11/]]

const familyOf = (families: [string, RegExp][], text: string) => families.find(([, pattern]) => pattern.test(text))?.[0] ?? ''

// A click ID's ad network and medium. Only the parameter's name arrives, never its value.
const CLICKS = new Map([
  ['gclid', ['google', 'cpc']],
  ['gbraid', ['google', 'cpc']],
  ['wbraid', ['google', 'cpc']],
  ['dclid', ['google', 'display']],
  ['msclkid', ['bing', 'cpc']],
  ['ttclid', ['tiktok', 'cpc']],
  ['li_fat_id', ['linkedin', 'cpc']],
  ['rdt_cid', ['reddit', 'cpc']],
  ['epik', ['pinterest', 'cpc']],
  ['sccid', ['snapchat', 'cpc']],
  ['yclid', ['yandex', 'cpc']],
  // Facebook and X add these to links people share too, so they are not ads.
  ['fbclid', ['facebook', 'social']],
  ['twclid', ['x', 'social']],
  // Share and email IDs: in-app browsers and mail apps often send no referrer, so these keep the visit off direct.
  ['igsh', ['instagram', 'social']],
  ['igshid', ['instagram', 'social']],
  ['mibextid', ['facebook', 'social']],
  ['mc_cid', ['mailchimp', 'email']],
])

const PAID = /^(?:cpc|ppc|cpm|cpv|cpa|paid\S*|display|banner|retargeting)$/

// Checked in order on the medium, source and referrer host together. AI before search: Gemini is on google.com.
// ChatGPT tags its links with utm_source=chatgpt.com and Gemini with utm_source=gemini; Perplexity and Claude are known
// by their host only.
const CHANNELS: [string, RegExp][] = [
  ['email', /\b(?:e-?mail|newsletter)\b|\bmail\.google\.|\boutlook\./],
  ['ai', /\b(?:chatgpt|openai|perplexity|claude|gemini|copilot|deepseek|grok|mistral)\b/],
  ['social', /\b(?:social|facebook|fb|instagram|t\.co|x\.com|twitter|linkedin|lnkd|reddit|ycombinator|youtube|tiktok|threads|bsky|bluesky|mastodon|t\.me|telegram|whatsapp|wa\.me|discord|pinterest)\b/],
  ['search', /\b(?:organic|google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|brave|startpage|qwant|naver|kagi)\b/],
]

// A campaign tag in lowercase: letters, digits, spaces and . _ + - only, at most 64 characters. A value with an @
// may be an email address, so it is dropped.
function tagOf(value: string | undefined) {
  const text = String(value ?? '').toLowerCase()

  return text.includes('@') ? '' : text.replace(/[^\p{L}\p{N}._+ -]/gu, '').trim().slice(0, 64)
}

// Where a visit came from, as [channel, source, medium, campaign]: the campaign tags first, then a click ID's ad
// network, then the referrer's host.
function originOf(parsed: Beacon, host: string) {
  // Snapchat sends ScCid, so names are matched in lowercase.
  const click = String(parsed.keys ?? '').toLowerCase().split(',').find(key => CLICKS.has(key)) ?? ''
  const [network = '', clickMedium = ''] = CLICKS.get(click) ?? []
  const source = tagOf(parsed.source) || network || host.replace(/^www\./, '')
  const medium = tagOf(parsed.medium) || clickMedium
  const text = `${medium} ${source} ${host}`
  const channel = PAID.test(medium) ? 'paid' : familyOf(CHANNELS, text) || (source ? 'referral' : 'direct')

  return [channel, source, medium, tagOf(parsed.campaign)]
}

// The referrer's host only, and nothing for an inside link: no path, no query, nothing that names a person.
function referrerHost(value: string | undefined): string {
  try {
    const host = new URL(String(value ?? '')).hostname

    return host === new URL(SITE_ORIGIN).hostname ? '' : host
  } catch {
    return ''
  }
}

// Days run on Baghdad time (UTC+3 all year), the day the site shows on posts.
const dayOf = (time: number) => new Date(time + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)

let salt: { day: string; value: string } | undefined

// The first isolate of the day stores a random salt and every other one reads it; earlier salts are deleted.
async function saltOf(day: string, env: Env): Promise<string> {
  if (salt?.day === day) return salt.value

  const [, , stored] = await env.DB.batch<{ salt: string }>([
    env.DB.prepare('DELETE FROM salts WHERE day < ?').bind(day),
    env.DB.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)').bind(day, base64url(crypto.getRandomValues(new Uint8Array(32)))),
    env.DB.prepare('SELECT salt FROM salts WHERE day = ?').bind(day),
  ])

  salt = { day, value: stored.results[0].salt }

  return salt.value
}

// One row per visitor, page and day, so a page's rows are its unique visitors. No IP address and no cookie is kept.
// A later view of the row adds its time, keeps the deepest scroll, and fills a speed the first view did not measure.
async function countView(request: Request, ip: string, page: string, details: (string | number | null)[], env: Env) {
  try {
    const now = Date.now()
    const day = dayOf(now)
    const text = `${await saltOf(day, env)} ${ip} ${request.headers.get('User-Agent') ?? ''}`
    const visitor = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))).slice(0, 16))
    const hour = new Date(now + 3 * 60 * 60 * 1000).getUTCHours()

    await env.DB.prepare(`INSERT INTO views (day, page, visitor, hour, entry, channel, source, medium, campaign, language, country, device, browser, os, seconds, scroll, lcp, inp, cls, ttfb)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (day, page, visitor) DO UPDATE SET views = views + 1, entry = MAX(entry, excluded.entry), seconds = seconds + excluded.seconds,
        scroll = COALESCE(MAX(scroll, excluded.scroll), scroll, excluded.scroll), lcp = COALESCE(lcp, excluded.lcp), inp = COALESCE(inp, excluded.inp),
        cls = COALESCE(cls, excluded.cls), ttfb = COALESCE(ttfb, excluded.ttfb)`)
      .bind(day, page, visitor, hour, ...details)
      .all()
  } catch {
    console.warn('view count failed')
  }
}

const isOwner = async (request: Request, env: Env) => String((await sessionOf(request, env))?.id) === env.OWNER_GITHUB_ID

// One beacon per page view. Every refusal after the size check answers 204, so a script learns nothing.
async function collect(request: Request, env: Env, ctx: Context, ip: string): Promise<Response> {
  // shortcut: a stealth headless browser with a normal UA on a cloud IP is still counted; drop known cloud ASNs
  // (request.cf.asn) if desktop visits with no time and no scroll start to grow. A VPN reader would be dropped too.
  if (BOT.test(request.headers.get('User-Agent') ?? '') || request.headers.has('Signature-Agent')) return ignored()

  if (!(await env.PER_CLIENT_COLLECT.limit({ key: ip })).success) return ignored()

  const body = await request.text()

  if (body.length > MAX_SMALL_BYTES) return fail(413, 'size')

  let parsed: Beacon

  try {
    parsed = JSON.parse(body) ?? {}
  } catch {
    return ignored()
  }

  const path = String(parsed.path ?? '')
  // A same-site pathname only. '//' and '/\' start a host, and an empty host makes new URL throw, so they never reach it;
  // a query, a hash or '..' changes the parsed URL and is dropped.
  const url = /^\/(?![/\\])/.test(path) ? new URL(path, SITE_ORIGIN) : undefined

  if (!url || path.length > 200 || url.origin !== SITE_ORIGIN || url.pathname !== path) return ignored()

  if (await isOwner(request, env)) return ignored()

  if (!(await env.ALL_COLLECT.limit({ key: 'all' })).success) return ignored()

  // EN and AR pages share one index, so a post's views line up with its likes. The pathname is
  // percent-encoded ASCII, so 96 characters fit the 96-byte index limit.
  const page = (path.replace(/^\/ar(?=\/|$)/, '').replace(/\/+$/, '') || '/').slice(0, 96)

  const host = referrerHost(parsed.ref)
  const agent = request.headers.get('User-Agent') ?? ''
  const touch = parsed.touch === true
  const language = languageOf(parsed.lang)
  const device = deviceOf(agent, touch)
  // A tab left open for hours counts as half an hour.
  const seconds = Math.min(1800, Math.max(0, Math.round(Number(parsed.seconds) || 0)))
  const scroll = measured(parsed.scroll)
  const browser = familyOf(BROWSERS, `${request.headers.get('Sec-CH-UA') ?? ''} ${agent}`)
  const os = isPad(agent, touch) ? 'iOS' : familyOf(SYSTEMS, agent)
  const speed = [measured(parsed.lcp), measured(parsed.inp), measured(parsed.cls, 4), measured(parsed.ttfb)]

  track(env, page, ['pageview', path, host, language, countryOf(request), device], [1, vital(parsed.lcp), vital(parsed.cls), vital(parsed.inp), vital(parsed.ttfb)])
  ctx.waitUntil(countView(request, ip, page, [parsed.entry === true ? 1 : 0, ...originOf(parsed, host), language, countryOf(request), device, browser, os, seconds, scroll === null ? null : Math.min(100, scroll), ...speed], env))

  return ignored()
}

// Visitors count once per day: a visitor ID changes every day, so a reader on two days counts twice. The daily and
// per-page rows also cover the period before the range, so the page can compare the two.
async function insights(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== 'GET') return fail(405, 'method')

  // Anyone else, signed in or not, learns only that nothing is here.
  if (!(await isOwner(request, env))) return fail(404, 'route')

  const days = Number(url.searchParams.get('days') ?? 30)

  if (!Number.isInteger(days) || days < 1 || days > 365) return fail(400, 'days')

  const day = 24 * 60 * 60 * 1000
  const from = dayOf(Date.now() - (days - 1) * day)
  const before = dayOf(Date.now() - (2 * days - 1) * day)
  const since = Date.parse(`${from}T00:00:00+03:00`)
  const query = (sql: string, value: string | number) => env.DB.prepare(sql).bind(value)
  // created_at is in milliseconds; adding 3 hours gives the Baghdad day, as dayOf does.
  const perDay = (table: string, filter = '') => query(`SELECT strftime('%Y-%m-%d', created_at / 1000 + 10800, 'unixepoch') AS day, COUNT(*) AS count FROM ${table} WHERE created_at >= ?${filter} GROUP BY day`, since - days * day)
  // Good and poor counts per metric, at Google's Core Web Vitals limits. A device passes a metric when at least 75%
  // of its views are good, which is the p75 test without a percentile in SQL.
  const speed = SPEED.map(([name, good, poor]) => `COUNT(${name}) AS ${name}, SUM(${name} <= ${good}) AS ${name}Good, SUM(${name} > ${poor}) AS ${name}Poor`).join(', ')

  // A visit is one visitor on one day. It is engaged when it read two pages or stayed ten seconds. ?1 is the first day.
  const visits = 'SELECT day, visitor, COUNT(*) > 1 OR SUM(seconds) >= 10 AS engaged FROM views WHERE day >= ?1 GROUP BY day, visitor'

  // Every views query reads the rows of its range once, and the two that join visits twice, so the whole report reads
  // the range's rows about ten times.
  const batch = env.DB.batch([
    query('SELECT day, SUM(views) AS views, COUNT(*) AS visitors, SUM(seconds) AS seconds, SUM(pages > 1 OR seconds >= 10) AS engaged FROM (SELECT day, SUM(views) AS views, COUNT(*) AS pages, SUM(seconds) AS seconds FROM views WHERE day >= ? GROUP BY day, visitor) GROUP BY day ORDER BY day', before),
    query("SELECT page, day, SUM(views) AS views, COUNT(*) AS visitors, SUM(entry) AS entries, SUM(seconds) AS seconds, SUM(scroll) AS scroll, COUNT(scroll) AS scrolled, SUM(language = 'ar') AS arabic FROM views WHERE day >= ? GROUP BY page, day", before),
    // A visit counts where it started, so a page read after it does not count as direct. Its engagement covers every
    // page of the visit, which shows which sources bring readers and which bring a glance.
    query(`SELECT channel, source, medium, campaign, COUNT(*) AS visitors, SUM(engaged) AS engaged FROM (SELECT DISTINCT day, visitor, channel, source, medium, campaign FROM views WHERE day >= ?1 AND entry = 1) JOIN (${visits}) USING (day, visitor) GROUP BY channel, source, medium, campaign`, from),
    // Device, browser, system and country stay the same through a visit, so one query groups them all.
    query(`SELECT device, browser, os, country, COUNT(*) AS visitors, SUM(engaged) AS engaged FROM (SELECT DISTINCT day, visitor, device, browser, os, country FROM views WHERE day >= ?1) JOIN (${visits}) USING (day, visitor) GROUP BY device, browser, os, country`, from),
    query("SELECT CAST(strftime('%w', day) AS INTEGER) AS weekday, hour, COUNT(DISTINCT day || visitor) AS visitors FROM views WHERE day >= ? GROUP BY weekday, hour", from),
    query(`SELECT device, ${speed} FROM views WHERE day >= ? AND device != '' GROUP BY device`, from),
    query('SELECT slug, COUNT(*) AS count FROM likes WHERE created_at >= ? GROUP BY slug', since),
    query('SELECT slug, COUNT(*) AS count FROM comments WHERE created_at >= ? AND hidden = 0 GROUP BY slug', since),
    perDay('likes'),
    perDay('comments', ' AND hidden = 0'),
  ])

  // The first recorded day, from the primary key: one row. A period before it has nothing to compare with.
  const [results, first] = await Promise.all([batch, env.DB.prepare('SELECT MIN(day) AS day FROM views').first<{ day: string | null }>()])
  const [daily, pages, acquisition, audience, hours, speeds, likes, comments, likesDaily, commentsDaily] = results

  return reply(200, {
    from,
    before,
    first: first?.day ?? null,
    // D1 bills rows read; the page shows what this report cost.
    read: results.reduce((total, result) => total + (result.meta.rows_read ?? 0), 0),
    daily: daily.results,
    pages: pages.results,
    acquisition: acquisition.results,
    audience: audience.results,
    hours: hours.results,
    speed: speeds.results,
    likes: likes.results,
    comments: comments.results,
    likesDaily: likesDaily.results,
    commentsDaily: commentsDaily.results,
  })
}

export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'

    if (pathname.startsWith('/api/auth/')) return auth(request, env, url, ip)

    if (pathname === '/api/insights') return insights(request, env, url)

    const isCollect = pathname === '/api/collect'
    const [, slug = '', action = '', commentId = ''] = ROUTE.exec(pathname) ?? []

    if (!isCollect && ((commentId && action !== 'comments') || !(await isPost(slug)))) return fail(404, 'post')

    const methods = isCollect ? ['POST'] : action === 'comments' ? commentId ? ['PATCH', 'DELETE'] : ['POST'] : action === 'like' ? ['GET', 'PUT', 'DELETE'] : ['GET']

    if (!methods.includes(request.method)) return fail(405, 'method')

    if (request.method === 'GET') return action === 'like' ? likeState(request, slug, env) : readPost(slug, env, ctx)

    if (request.headers.get('Origin') !== env.SITE_URL) return fail(403, 'origin')

    // Deleting a comment carries no body.
    if (commentId && request.method === 'DELETE') return removeComment(request, slug, Number(commentId), env)

    // A missing length means a chunked body of any size, so it is refused before it is read.
    const length = Number(request.headers.get('Content-Length'))

    if (!length || length > (action === 'comments' ? MAX_COMMENT_BYTES : MAX_SMALL_BYTES)) return fail(413, 'size')

    if (isCollect) return collect(request, env, ctx, ip)

    return action === 'like' ? like(request, slug, env) : comment(request, slug, env, ctx, commentId ? Number(commentId) : undefined)
  },
}
