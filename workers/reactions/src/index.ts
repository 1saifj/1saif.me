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
  meta: { changes: number }
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
  author: Author
}

interface CommentRow {
  id: number
  body: string
  createdAt: number
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
  w?: number
  lcp?: number
  cls?: number
  inp?: number
  ttfb?: number
}

const SITE_ORIGIN = 'https://1saif.me'

// The post list is bundled at deploy time, so a new post needs a Worker deploy (README, Deploys).
const SLUGS = new Set(publishedBlogs.map(post => createSlugFromTitle(post.title)))

const ROUTE = /^\/api\/posts\/([a-z0-9-]{1,120})(?:\/(like|comments)(?:\/([1-9]\d{0,11}))?)?$/

// Comments live only on post pages, so a sign-in returns only to one of them.
const RETURN_PATH = /^\/(?:ar\/)?blog\/([a-z0-9-]{1,120})$/

const LOGIN = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/

// URL-encoding makes one Arabic letter 6 bytes and one Chinese or Japanese character 9, so 2,000 characters need up to 18 KB.
const MAX_COMMENT_BYTES = 20_480

const MAX_SMALL_BYTES = 2_048

const MAX_NAME = 100

const MAX_MESSAGE = 2_000

// shortcut: the newest 200 only; page the list when a post gets near that many.
const MAX_COMMENTS = 200

// Control characters, except tab and line breaks, which a message may hold.
// eslint-disable-next-line no-control-regex -- matching control characters is the point.
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/

// eslint-disable-next-line no-control-regex -- a display name keeps no control character or line break.
const ANY_CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/g

const SESSION_COOKIE = '__Host-session'

// Readable by the page: it holds only the public profile, so the page knows who is signed in without a request.
const VIEWER_COOKIE = '__Host-viewer'

const FLOW_COOKIE = '__Host-github-flow'

const SESSION_SECONDS = 30 * 24 * 60 * 60

// GitHub's consent screen has ten minutes to send the visitor back.
const FLOW_SECONDS = 600

const GITHUB_HEADERS = { Accept: 'application/vnd.github+json', 'User-Agent': '1saif.me-comments', 'X-GitHub-Api-Version': '2026-03-10' }

const BOT = /bot|crawl|spider|headless/i

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

async function readPost(slug: string, env: Env, ctx: Context): Promise<Response> {
  const cache = caches.default
  const cached = await cache.match(cacheKey(slug))

  if (cached) return cached

  // Reads may come from the nearest D1 replica; a few seconds of lag is fine for counts and comments.
  const db = env.DB.withSession('first-unconstrained')

  // A blocked user's comments drop out here, so one flag hides all of them.
  const [stats, comments] = await db.batch<PostRow>([
    db.prepare('SELECT likes FROM post_stats WHERE slug = ?').bind(slug),
    db.prepare(`SELECT c.id, c.body, c.created_at AS createdAt, u.github_id AS userId, u.login, u.name
      FROM comments c JOIN users u ON u.github_id = c.user_id
      WHERE c.slug = ? AND c.hidden = 0 AND u.blocked = 0 ORDER BY c.created_at DESC LIMIT ?`).bind(slug, MAX_COMMENTS),
  ])

  const list: PostComment[] = comments.results.reverse().map(row => ({
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    author: { id: row.userId, login: row.login, name: row.name },
  }))

  // Every visitor gets the same reply, so it holds nothing about the viewer and can be cached. Only the edge keeps
  // it (s-maxage), and a write clears that copy; a browser copy would hide a new like or comment after a reload.
  const response = Response.json(
    { likes: stats.results[0]?.likes ?? 0, comments: list },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30' } },
  )

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

async function comment(request: Request, slug: string, env: Env, ctx: Context): Promise<Response> {
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

  // Browsers send textarea line breaks as CRLF; one form keeps the stored length honest.
  const message = (form.get('message') ?? '').trim().replace(/\r\n?/g, '\n')

  if (message.length === 0 || message.length > MAX_MESSAGE || CONTROL_CHARACTERS.test(message)) return reject(400, 'invalid', 'invalid')

  if (!(await env.ALL_CLIENTS_COMMENTS.limit({ key: 'all' })).success) return reject(429, 'rate', 'rate')

  const createdAt = Date.now()

  // The insert reads the user row, so a blocked user gets no row back and nothing is saved.
  const row = await env.DB.prepare('INSERT INTO comments (slug, user_id, body, created_at) SELECT ?, github_id, ?, ? FROM users WHERE github_id = ? AND blocked = 0 RETURNING id')
    .bind(slug, message, createdAt, session.id)
    .first<{ id: number }>()

  if (!row) return reject(403, 'blocked', 'blocked')

  await forget(slug)
  track(env, slug, ['comment', countryOf(request), language])

  const author: Author = { id: session.id, login: session.login, name: session.name }

  // The comment is saved and shown at once; a failed email must not fail the request.
  ctx.waitUntil(env.EMAIL.send({
    // The runtime requires a recipient; the binding allows only this one.
    to: 'saifalialjanahi@gmail.com',
    from: { email: 'hello@1saif.me', name: '1saif.me comments' },
    subject: `New comment on ${slug}`,
    text: `${author.name ?? author.login} (https://github.com/${author.login}) wrote on ${SITE_ORIGIN}/blog/${slug}:\n\n${message}\n\n--\nTo hide this comment:\nnpx wrangler d1 execute 1saif-reactions --remote --command "UPDATE comments SET hidden = 1 WHERE id = ${row.id}"\n\nTo hide every comment of @${author.login} and refuse new ones:\nnpx wrangler d1 execute 1saif-reactions --remote --command "UPDATE users SET blocked = 1 WHERE github_id = ${author.id}"`,
  }).catch(error => {
    // Log the code only: the subject and text hold visitor data.
    console.error('send failed', error instanceof Error && 'code' in error ? error.code : 'no code')
  }))

  return reply(201, { id: row.id, body: message, createdAt, author } satisfies PostComment)
}

// The author deletes the comment for good; nobody else can, so the row's user_id must match the session.
async function removeComment(request: Request, slug: string, id: number, env: Env): Promise<Response> {
  const session = await sessionOf(request, env)

  if (!session) return fail(401, 'auth')

  if (!(await env.PER_CLIENT_COMMENTS.limit({ key: `user:${session.id}` })).success) return fail(429, 'rate')

  const { meta } = await env.DB.prepare('DELETE FROM comments WHERE id = ? AND slug = ? AND user_id = ?').bind(id, slug, session.id).all()

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

function returnPath(value: string | null): string {
  const match = RETURN_PATH.exec(value ?? '')

  return match && SLUGS.has(match[1]) ? match[0] : '/blog'
}

function displayName(value: unknown): string | null {
  const name = typeof value === 'string' ? value.replace(ANY_CONTROL_CHARACTER, ' ').trim().slice(0, MAX_NAME) : ''

  return name || null
}

// Sends the visitor to GitHub. The state and the PKCE verifier wait in a signed cookie for the callback.
async function startSignIn(env: Env, url: URL, ip: string): Promise<Response> {
  if (!(await env.PER_CLIENT_AUTH.limit({ key: ip })).success) return fail(429, 'rate')

  const state = base64url(crypto.getRandomValues(new Uint8Array(16)))
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))
  const flow = await sign({ use: 'flow', state, verifier, back: returnPath(url.searchParams.get('return')), exp: Date.now() + FLOW_SECONDS * 1000 }, env)

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

  await env.DB.prepare('INSERT INTO users (github_id, login, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (github_id) DO UPDATE SET login = excluded.login, name = excluded.name, updated_at = excluded.updated_at')
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

const deviceOf = (width: number) => width <= 0 ? '' : width < 768 ? 'mobile' : width < 1200 ? 'tablet' : 'desktop'

// The referrer's host only, and nothing for an inside link: no path, no query, nothing that names a person.
function referrerHost(value: string | undefined): string {
  try {
    const host = new URL(String(value ?? '')).hostname

    return host === new URL(SITE_ORIGIN).hostname ? '' : host
  } catch {
    return ''
  }
}

// One beacon per page view. Every refusal after the size check answers 204, so a script learns nothing.
async function collect(request: Request, env: Env, ip: string): Promise<Response> {
  if (BOT.test(request.headers.get('User-Agent') ?? '')) return ignored()

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

  if (!(await env.ALL_COLLECT.limit({ key: 'all' })).success) return ignored()

  // EN and AR pages share one index, so a post's views line up with its likes. The pathname is
  // percent-encoded ASCII, so 96 characters fit the 96-byte index limit.
  const page = (path.replace(/^\/ar(?=\/|$)/, '').replace(/\/+$/, '') || '/').slice(0, 96)

  track(
    env,
    page,
    ['pageview', path, referrerHost(parsed.ref), languageOf(parsed.lang), countryOf(request), deviceOf(Number(parsed.w) || 0)],
    [1, vital(parsed.lcp), vital(parsed.cls), vital(parsed.inp), vital(parsed.ttfb)],
  )

  return ignored()
}

export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'

    if (pathname.startsWith('/api/auth/')) return auth(request, env, url, ip)

    const isCollect = pathname === '/api/collect'
    const [, slug = '', action = '', commentId = ''] = ROUTE.exec(pathname) ?? []

    if (!isCollect && (!SLUGS.has(slug) || (commentId && action !== 'comments'))) return fail(404, 'post')

    const methods = isCollect ? ['POST'] : action === 'comments' ? [commentId ? 'DELETE' : 'POST'] : action === 'like' ? ['GET', 'PUT', 'DELETE'] : ['GET']

    if (!methods.includes(request.method)) return fail(405, 'method')

    if (request.method === 'GET') return action === 'like' ? likeState(request, slug, env) : readPost(slug, env, ctx)

    if (request.headers.get('Origin') !== env.SITE_URL) return fail(403, 'origin')

    // Deleting a comment carries no body.
    if (commentId) return removeComment(request, slug, Number(commentId), env)

    // A missing length means a chunked body of any size, so it is refused before it is read.
    const length = Number(request.headers.get('Content-Length'))

    if (!length || length > (action === 'comments' ? MAX_COMMENT_BYTES : MAX_SMALL_BYTES)) return fail(413, 'size')

    if (isCollect) return collect(request, env, ip)

    return action === 'like' ? like(request, slug, env) : comment(request, slug, env, ctx)
  },
}
