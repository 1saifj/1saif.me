// Likes and comments on blog posts, and the site's anonymous page views. Cheap checks and the
// rate limits run before any D1 call, so junk traffic never costs a database row.

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

interface TurnstileResult {
  success: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

interface D1Result<Row> {
  results: Row[]
  meta: { changes: number }
}

interface D1Statement {
  bind(...values: (string | number)[]): D1Statement
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
  ALL_WRITES: RateLimit
  PER_CLIENT_COLLECT: RateLimit
  ALL_COLLECT: RateLimit
  TURNSTILE_SECRET: string
  ALLOWED_HOSTNAME: string
}

export interface PostComment {
  id: number
  name: string
  body: string
  createdAt: number
}

// One batch reads the count row and the comment rows, so its rows carry either set of columns.
type PostRow = PostComment & { likes: number }

// The JSON bodies as the browser sends them. Every field is coerced and checked before use.
interface LikeBody {
  visitor?: string
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

const ROUTE = /^\/api\/posts\/([a-z0-9-]{1,120})(?:\/(like|comments))?$/

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

// URL-encoding makes one Arabic letter 6 bytes, so 2,000 characters need about 12 KB.
const MAX_COMMENT_BYTES = 16_384

const MAX_SMALL_BYTES = 2_048

const MAX_NAME = 60

const MAX_MESSAGE = 2_000

// shortcut: the oldest 200 only; page the list when a post gets near that many.
const MAX_COMMENTS = 200

// Control characters, except tab and line breaks, which a message may hold.
// eslint-disable-next-line no-control-regex -- matching control characters is the point.
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/

const LINE_BREAK = /[\r\n]/

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

async function passesTurnstile(token: string, ip: string, env: Env): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      // A pasted secret can carry a trailing space or line break.
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET.trim(), response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5_000),
    })

    // SAFETY: the shape is Cloudflare's documented siteverify response, also on its 400 replies; every field read is checked below.
    const result = await response.json().catch(() => ({ success: false })) as TurnstileResult

    // A token minted for another site or another form must not pass here. Cloudflare's test secret
    // answers with hostname "example.com" and no action, so wrangler dev on localhost checks success only.
    const testing = env.ALLOWED_HOSTNAME === 'localhost'
    const passed = result.success === true && (testing || (result.hostname === env.ALLOWED_HOSTNAME && result.action === 'comment'))

    if (!passed) console.warn('turnstile failed', response.status, result['error-codes'], result.hostname, result.action)

    return passed
  } catch {
    // A timeout or a network failure must fail closed, not become an unhandled 500.
    console.warn('turnstile request failed')

    return false
  }
}

async function readPost(slug: string, env: Env, ctx: Context): Promise<Response> {
  const cache = caches.default
  const cached = await cache.match(cacheKey(slug))

  if (cached) return cached

  // Reads may come from the nearest D1 replica; a few seconds of lag is fine for counts and comments.
  const db = env.DB.withSession('first-unconstrained')

  const [stats, comments] = await db.batch<PostRow>([
    db.prepare('SELECT likes FROM post_stats WHERE slug = ?').bind(slug),
    db.prepare('SELECT id, name, body, created_at AS createdAt FROM comments WHERE slug = ? AND hidden = 0 ORDER BY created_at LIMIT ?').bind(slug, MAX_COMMENTS),
  ])

  const response = Response.json(
    { likes: stats.results[0]?.likes ?? 0, comments: comments.results },
    { headers: { 'Cache-Control': 'public, max-age=30' } },
  )

  ctx.waitUntil(cache.put(cacheKey(slug), response.clone()))

  return response
}

// shortcut: the Cache API is per location, so other locations may serve the old reply for up to 30 s.
const forget = (slug: string) => caches.default.delete(cacheKey(slug))

async function like(request: Request, slug: string, env: Env, ip: string): Promise<Response> {
  if (!(await env.PER_CLIENT_LIKES.limit({ key: ip })).success) return fail(429, 'rate')

  const body = await request.text()

  if (body.length > MAX_SMALL_BYTES) return fail(413, 'size')

  let parsed: LikeBody

  try {
    parsed = JSON.parse(body) ?? {}
  } catch {
    return fail(400, 'invalid')
  }

  const visitor = String(parsed.visitor ?? '')

  if (!UUID.test(visitor)) return fail(400, 'invalid')

  if (!(await env.ALL_WRITES.limit({ key: 'all' })).success) return fail(429, 'rate')

  const liking = request.method === 'PUT'

  // The count is recounted, never incremented, so a repeat or a lost reply can never make it drift.
  const [changed, counted] = await env.DB.batch<{ likes: number }>([
    liking
      ? env.DB.prepare('INSERT OR IGNORE INTO likes (slug, visitor, created_at) VALUES (?, ?, ?)').bind(slug, visitor, Date.now())
      : env.DB.prepare('DELETE FROM likes WHERE slug = ? AND visitor = ?').bind(slug, visitor),
    env.DB.prepare('INSERT INTO post_stats (slug, likes) VALUES (?1, (SELECT COUNT(*) FROM likes WHERE slug = ?1)) ON CONFLICT (slug) DO UPDATE SET likes = excluded.likes RETURNING likes').bind(slug),
  ])

  await forget(slug)

  if (changed.meta.changes > 0) track(env, slug, [liking ? 'like' : 'unlike', countryOf(request), languageOf(parsed.language)])

  return reply(200, { likes: counted.results[0]?.likes ?? 0 })
}

async function comment(request: Request, slug: string, env: Env, ctx: Context, ip: string): Promise<Response> {
  if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) return fail(415, 'type')

  const body = await request.text()

  if (body.length > MAX_COMMENT_BYTES) return fail(413, 'size')

  const form = new URLSearchParams(body)
  const language = languageOf(form.get('language'))

  const reject = (status: number, error: string, reason: string) => {
    track(env, slug, ['comment_rejected', countryOf(request), language, reason])

    return fail(status, error)
  }

  if (!(await env.PER_CLIENT_COMMENTS.limit({ key: ip })).success) return reject(429, 'rate', 'rate')

  const field = (key: string) => (form.get(key) ?? '').trim()
  const name = field('name')
  // Browsers send textarea line breaks as CRLF; one form keeps the stored length honest.
  const message = field('message').replace(/\r\n?/g, '\n')

  // Bots fill the hidden field. They get a success reply in the usual form so they do not adapt.
  if (field('leave_empty')) {
    track(env, slug, ['comment_rejected', countryOf(request), language, 'honeypot'])

    return reply(201, { id: 0, name, body: message, createdAt: Date.now() })
  }

  const validName = name.length > 0 && name.length <= MAX_NAME && !CONTROL_CHARACTERS.test(name) && !LINE_BREAK.test(name)
  const validMessage = message.length > 0 && message.length <= MAX_MESSAGE && !CONTROL_CHARACTERS.test(message)

  if (!validName || !validMessage) return reject(400, 'invalid', 'invalid')

  const token = field('cf-turnstile-response')

  if (!token || token.length > 2048 || !(await passesTurnstile(token, ip, env))) return reject(400, 'challenge', 'turnstile')

  // Counted only for verified visitors, so bots cannot use up the budget and block real people.
  if (!(await env.ALL_CLIENTS_COMMENTS.limit({ key: 'all' })).success) return reject(429, 'rate', 'rate')

  if (!(await env.ALL_WRITES.limit({ key: 'all' })).success) return reject(429, 'rate', 'rate')

  const createdAt = Date.now()

  const row = await env.DB.prepare('INSERT INTO comments (slug, name, body, created_at) VALUES (?, ?, ?, ?) RETURNING id')
    .bind(slug, name, message, createdAt)
    .first<{ id: number }>()

  if (!row) return fail(500, 'save')

  await forget(slug)
  track(env, slug, ['comment', countryOf(request), language])

  // The comment is saved and shown at once; a failed email must not fail the request.
  ctx.waitUntil(env.EMAIL.send({
    // The runtime requires a recipient; the binding allows only this one.
    to: 'saifalialjanahi@gmail.com',
    from: { email: 'hello@1saif.me', name: '1saif.me comments' },
    subject: `New comment on ${slug}`,
    text: `${name} wrote on ${SITE_ORIGIN}/blog/${slug}:\n\n${message}\n\n--\nTo hide it:\nnpx wrangler d1 execute 1saif-reactions --remote --command "UPDATE comments SET hidden = 1 WHERE id = ${row.id}"`,
  }).catch(error => {
    // Log the code only: the subject and text hold visitor data.
    console.error('send failed', error instanceof Error && 'code' in error ? error.code : 'no code')
  }))

  return reply(201, { id: row.id, name, body: message, createdAt })
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
  const url = new URL(path, SITE_ORIGIN)

  // A same-site pathname only: '//host', a query, a hash or '..' changes the parsed URL and is dropped.
  if (!path.startsWith('/') || path.length > 200 || url.origin !== SITE_ORIGIN || url.pathname !== path) return ignored()

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
    const { pathname } = new URL(request.url)
    const isCollect = pathname === '/api/collect'
    const [, slug = '', action = ''] = ROUTE.exec(pathname) ?? []

    if (!isCollect && !SLUGS.has(slug)) return fail(404, 'post')

    const methods = isCollect || action === 'comments' ? ['POST'] : action === 'like' ? ['PUT', 'DELETE'] : ['GET']

    if (!methods.includes(request.method)) return fail(405, 'method')

    if (request.method === 'GET') return readPost(slug, env, ctx)

    if (request.headers.get('Origin') !== SITE_ORIGIN) return fail(403, 'origin')

    // A missing length means a chunked body of any size, so it is refused before it is read.
    const length = Number(request.headers.get('Content-Length'))

    if (!length || length > (action === 'comments' ? MAX_COMMENT_BYTES : MAX_SMALL_BYTES)) return fail(413, 'size')

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'

    if (isCollect) return collect(request, env, ip)

    return action === 'like' ? like(request, slug, env, ip) : comment(request, slug, env, ctx, ip)
  },
}
