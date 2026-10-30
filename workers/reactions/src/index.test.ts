// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { publishedBlogs } from '../../../src/data/blogs'
import { createSlugFromTitle } from '../../../src/utils/slugUtils'
import worker, { Env } from './index'

const slug = createSlugFromTitle(publishedBlogs[0].title)

const sent: { subject: string; text: string }[] = []

const points: { indexes: string[]; blobs: string[]; doubles: number[] }[] = []

const pending: Promise<unknown>[] = []

const ctx = { waitUntil: (promise: Promise<unknown>) => { pending.push(promise) } }

interface StoredComment {
  id: number
  slug: string
  userId: number
  body: string
  createdAt: number
  editedAt: number | null
  edits: number
  hidden: number
}

interface StoredUser {
  login: string
  name: string | null
  blocked: number
}

interface StoredView {
  day: string
  page: string
  visitor: string
  hour: number
  entry: number
  channel: string
  source: string
  medium: string
  campaign: string
  content: string
  language: string
  country: string
  device: string
  browser: string
  os: string
  views: number
  seconds: number
  scroll: number | null
  lcp: number | null
  inp: number | null
  cls: number | null
  ttfb: number | null
}

type Speed = 'lcp' | 'inp' | 'cls' | 'ttfb'

const LIMITS: [Speed, number, number][] = [['lcp', 2500, 4000], ['inp', 200, 500], ['cls', 0.1, 0.25], ['ttfb', 800, 1800]]

// A fake D1 that answers the Worker's own statements from memory, so the tests run on any Node version.
function makeDb() {
  // Each like's created_at, by slug and account.
  const likes = new Map<string, number>()
  const stats = new Map<string, number>()
  const comments: StoredComment[] = []
  const users = new Map<number, StoredUser>()
  const salts = new Map<string, string>()
  const views: StoredView[] = []

  // The rows of each GROUP BY key, as [key, rows] pairs.
  const counted = <Row,>(rows: Row[], key: (row: Row) => string) => {
    const groups = new Map<string, Row[]>()

    for (const row of rows) groups.set(key(row), [...groups.get(key(row)) ?? [], row])

    return [...groups]
  }

  let queries = 0

  const execute = (sql: string, values: (string | number | null)[]) => {
    const [first, second, third, fourth] = values

    queries += 1

    if (sql.startsWith('SELECT likes')) return { results: stats.has(String(first)) ? [{ likes: stats.get(String(first)) }] : [], changes: 0 }

    if (sql.startsWith('SELECT c.id')) {
      const visible = comments
        .filter(item => item.slug === first && item.hidden === 0 && users.get(item.userId)?.blocked === 0)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, Number(second))

      return {
        results: visible.map(({ id, body, createdAt, editedAt, userId }) => ({ id, body, createdAt, editedAt, userId, login: users.get(userId)?.login, name: users.get(userId)?.name })),
        changes: 0,
      }
    }

    if (sql.startsWith('SELECT COUNT(*) AS liked')) return { results: [{ liked: likes.has(`${first} ${second}`) ? 1 : 0 }], changes: 0 }

    // INSERT ... SELECT FROM users WHERE github_id = ? AND blocked = 0. The likes_insert and likes_delete
    // triggers (migrations/0004) move the count with each change.
    if (sql.startsWith('INSERT OR IGNORE INTO likes')) {
      if (users.get(Number(third))?.blocked !== 0) return { results: [], changes: 0 }

      const before = likes.size

      if (!likes.has(`${first} ${third}`)) likes.set(`${first} ${third}`, Number(second))

      const changes = likes.size - before

      stats.set(String(first), (stats.get(String(first)) ?? 0) + changes)

      return { results: [], changes }
    }

    if (sql.startsWith('DELETE FROM likes')) {
      const changes = likes.delete(`${first} ${second}`) ? 1 : 0

      if (changes) stats.set(String(first), Math.max(0, (stats.get(String(first)) ?? 0) - 1))

      return { results: [], changes }
    }

    // SELECT blocked, (the edits of comment ? on post ? by this user, if visible) FROM users WHERE github_id = ?
    if (sql.startsWith('SELECT blocked')) {
      const user = users.get(Number(third))
      const item = comments.find(row => row.id === first && row.slug === second && row.userId === third && row.hidden === 0)

      return { results: user ? [{ blocked: user.blocked, edits: item?.edits ?? null }] : [], changes: 0 }
    }

    if (sql.startsWith('INSERT INTO users')) {
      users.set(Number(first), { login: String(second), name: third === null ? null : String(third), blocked: users.get(Number(first))?.blocked ?? 0 })

      return { results: [], changes: 1 }
    }

    // INSERT ... SELECT FROM users WHERE github_id = ? AND blocked = 0: no row for a missing or blocked user.
    // ... AND fewer than DAILY_COMMENTS of this account's comments on this post since the given time.
    if (sql.startsWith('INSERT INTO comments')) {
      if (users.get(Number(fourth))?.blocked !== 0) return { results: [], changes: 0 }

      if (comments.filter(item => item.slug === first && item.userId === Number(fourth) && item.createdAt > Number(values[5])).length >= Number(values[7])) return { results: [], changes: 0 }

      const id = comments.length + 1
      comments.push({ id, slug: String(first), userId: Number(fourth), body: String(second), createdAt: Number(third), editedAt: null, edits: 0, hidden: 0 })

      return { results: [{ id, createdAt: Number(third) }], changes: 1 }
    }

    // UPDATE comments SET body = ?, edited_at = ?, edits = edits + 1 WHERE id = ? AND slug = ? AND user_id = ? AND hidden = 0
    // AND edits < ? AND the user is not blocked
    if (sql.startsWith('UPDATE comments SET body = ?,')) {
      const item = comments.find(row => row.id === third && row.slug === fourth && row.userId === values[4] && row.hidden === 0 && row.edits < Number(values[5]))

      if (!item || users.get(Number(values[6]))?.blocked !== 0) return { results: [], changes: 0 }

      Object.assign(item, { body: String(first), editedAt: Number(second), edits: item.edits + 1 })

      return { results: [{ id: item.id, createdAt: item.createdAt }], changes: 1 }
    }

    // UPDATE comments SET body = '', hidden = 1 WHERE id = ? AND slug = ? AND user_id = ? AND body != ''
    if (sql.startsWith('UPDATE comments')) {
      const item = comments.find(row => row.id === first && row.slug === second && row.userId === third && row.body !== '')

      if (!item) return { results: [], changes: 0 }

      Object.assign(item, { body: '', hidden: 1 })

      return { results: [], changes: 1 }
    }

    if (sql.startsWith('DELETE FROM salts')) {
      for (const day of salts.keys()) if (day < String(first)) salts.delete(day)

      return { results: [], changes: 0 }
    }

    if (sql.startsWith('INSERT OR IGNORE INTO salts')) {
      if (!salts.has(String(first))) salts.set(String(first), String(second))

      return { results: [], changes: 1 }
    }

    if (sql.startsWith('SELECT salt')) return { results: [{ salt: salts.get(String(first)) }], changes: 0 }

    // INSERT INTO views (...) ON CONFLICT DO UPDATE SET views + 1, entry MAX, seconds +, scroll MAX, each speed the first measured
    if (sql.startsWith('INSERT INTO views')) {
      // The bind order: day, page, visitor, hour, entry, channel, source, medium, campaign, content, language, country,
      // device, browser, os, seconds, scroll, lcp, inp, cls, ttfb.
      const [day, page, visitor] = values.slice(0, 3).map(String)
      const [hour, entry] = values.slice(3, 5).map(Number)
      const [channel, source, medium, campaign, content, language, country, device, browser, os] = values.slice(5, 15).map(String)
      const seconds = Number(values[15])
      const [scroll, lcp, inp, cls, ttfb] = values.slice(16).map(value => value === null ? null : Number(value))
      const row = views.find(item => item.day === day && item.page === page && item.visitor === visitor)

      if (!row) views.push({ day, page, visitor, hour, entry, channel, source, medium, campaign, content, language, country, device, browser, os, views: 1, seconds, scroll, lcp, inp, cls, ttfb })
      else {
        Object.assign(row, { views: row.views + 1, entry: Math.max(row.entry, entry), seconds: row.seconds + seconds, scroll: row.scroll === null || scroll === null ? row.scroll ?? scroll : Math.max(row.scroll, scroll) })
        Object.assign(row, { lcp: row.lcp ?? lcp, inp: row.inp ?? inp, cls: row.cls ?? cls, ttfb: row.ttfb ?? ttfb })
      }

      return { results: [], changes: 1 }
    }

    const inRange = views.filter(row => row.day >= String(first))
    const sum = (rows: StoredView[], value: (row: StoredView) => number) => rows.reduce((total, row) => total + value(row), 0)
    // COUNT(DISTINCT day || visitor): one visitor on one day.
    const visits = (rows: StoredView[]) => new Set(rows.map(row => row.day + row.visitor)).size

    // The visits among rows that read two pages or stayed ten seconds, counting every page of the visit in range.
    const engagedOf = (rows: StoredView[]) => new Set(rows.flatMap(row => {
      const visit = inRange.filter(other => other.day + other.visitor === row.day + row.visitor)

      return visit.length > 1 || sum(visit, other => other.seconds) >= 10 ? [row.day + row.visitor] : []
    })).size

    if (sql.startsWith('SELECT MIN(day)')) return { results: [{ day: views.map(row => row.day).sort()[0] ?? null }], changes: 0 }

    if (sql.startsWith('SELECT day, SUM(views)')) {
      return {
        results: counted(inRange, row => row.day).sort().map(([day, rows]) => {
          const engaged = counted(rows, row => row.visitor).filter(([, visit]) => visit.length > 1 || sum(visit, row => row.seconds) >= 10)

          return { day, views: sum(rows, row => row.views), visitors: visits(rows), seconds: sum(rows, row => row.seconds), engaged: engaged.length }
        }),
        changes: 0,
      }
    }

    if (sql.startsWith('SELECT page, day, SUM(views)')) {
      return {
        results: counted(inRange, row => `${row.page} ${row.day}`).map(([, rows]) => {
          const scrolled = rows.filter(row => row.scroll !== null)

          return {
            page: rows[0].page,
            day: rows[0].day,
            views: sum(rows, row => row.views),
            visitors: rows.length,
            entries: sum(rows, row => row.entry),
            seconds: sum(rows, row => row.seconds),
            scroll: scrolled.length ? sum(scrolled, row => row.scroll ?? 0) : null,
            scrolled: scrolled.length,
            arabic: rows.filter(row => row.language === 'ar').length,
          }
        }),
        changes: 0,
      }
    }

    if (sql.startsWith('SELECT channel, source, medium, campaign')) {
      return {
        results: counted(inRange.filter(row => row.entry === 1), row => [row.channel, row.source, row.medium, row.campaign, row.content].join(' '))
          .map(([, rows]) => ({ channel: rows[0].channel, source: rows[0].source, medium: rows[0].medium, campaign: rows[0].campaign, content: rows[0].content, visitors: visits(rows), engaged: engagedOf(rows) })),
        changes: 0,
      }
    }

    if (sql.startsWith('SELECT device, browser, os, country')) {
      return {
        results: counted(inRange, row => [row.device, row.browser, row.os, row.country].join(' '))
          .map(([, rows]) => ({ device: rows[0].device, browser: rows[0].browser, os: rows[0].os, country: rows[0].country, visitors: visits(rows), engaged: engagedOf(rows) })),
        changes: 0,
      }
    }

    if (sql.startsWith("SELECT CAST(strftime('%w', day)")) {
      return {
        results: counted(inRange, row => `${new Date(`${row.day}T00:00:00Z`).getUTCDay()} ${row.hour}`)
          .map(([key, rows]) => ({ weekday: Number(key.split(' ')[0]), hour: rows[0].hour, visitors: visits(rows) })),
        changes: 0,
      }
    }

    // SUM over no measured value is NULL, as in SQL.
    if (sql.startsWith('SELECT device, COUNT(lcp)')) {
      return {
        results: counted(inRange.filter(row => row.device !== ''), row => row.device).map(([device, rows]) => {
          const speed = new Map<string, number | null>()

          for (const [name, good, poor] of LIMITS) {
            const values = rows.map(row => row[name]).filter(value => value !== null)

            speed.set(name, values.length)
            speed.set(`${name}Good`, values.length ? values.filter(value => value <= good).length : null)
            speed.set(`${name}Poor`, values.length ? values.filter(value => value > poor).length : null)
          }

          return { device, ...Object.fromEntries(speed) }
        }),
        changes: 0,
      }
    }

    // SELECT strftime(...) AS day, COUNT(*) AS count FROM likes | comments WHERE created_at >= ? GROUP BY day
    const baghdadDay = (time: number) => new Date(time + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)

    if (sql.includes('AS day, COUNT(*) AS count FROM likes')) {
      return { results: counted([...likes.values()].filter(time => time >= Number(first)), baghdadDay).map(([day, rows]) => ({ day, count: rows.length })), changes: 0 }
    }

    if (sql.includes('AS day, COUNT(*) AS count FROM comments')) {
      return { results: counted(comments.filter(item => item.createdAt >= Number(first) && item.hidden === 0), item => baghdadDay(item.createdAt)).map(([day, rows]) => ({ day, count: rows.length })), changes: 0 }
    }

    if (sql.startsWith('SELECT slug, COUNT(*) AS count FROM likes')) {
      return { results: counted([...likes].filter(([, createdAt]) => createdAt >= Number(first)), ([key]) => key.split(' ')[0]).map(([slug, rows]) => ({ slug, count: rows.length })), changes: 0 }
    }

    if (sql.startsWith('SELECT slug, COUNT(*) AS count FROM comments')) {
      return { results: counted(comments.filter(item => item.createdAt >= Number(first) && item.hidden === 0), item => item.slug).map(([slug, rows]) => ({ slug, count: rows.length })), changes: 0 }
    }

    throw new Error(`unexpected SQL: ${sql}`)
  }

  const prepare = (sql: string) => {
    const statement = (values: (string | number | null)[]) => ({
      bind: (...next: (string | number | null)[]) => statement(next),
      all: async () => {
        const { results, changes } = execute(sql, values)

        return { results, meta: { changes, rows_read: results.length } }
      },
      first: async () => execute(sql, values).results[0] ?? null,
    })

    return statement([])
  }

  const session = {
    prepare,
    batch: async (statements: ReturnType<typeof prepare>[]) => {
      const results = []

      for (const statement of statements) results.push(await statement.all())

      return results
    },
  }

  return { ...session, withSession: () => session, comments, likes, users, salts, views, queries: () => queries }
}

type Limits = 'PER_CLIENT_LIKES' | 'PER_CLIENT_COMMENTS' | 'ALL_CLIENTS_COMMENTS' | 'ALL_LIKES' | 'PER_CLIENT_COLLECT' | 'ALL_COLLECT' | 'PER_CLIENT_AUTH'

function makeEnv(limits: Partial<Record<Limits, boolean>> = {}) {
  const limit = (allowed = true) => ({ limit: async () => ({ success: allowed }) })
  const db = makeDb()

  const env = {
    // SAFETY: the fake answers every statement the Worker sends, with rows of the columns it selects.
    DB: db as Env['DB'],
    EMAIL: {
      send: async (message: { subject: string; text: string }) => {
        sent.push(message)

        return { messageId: 'id' }
      },
    },
    EVENTS: { writeDataPoint: (point: { indexes: string[]; blobs: string[]; doubles: number[] }) => { points.push(point) } },
    PER_CLIENT_LIKES: limit(limits.PER_CLIENT_LIKES),
    PER_CLIENT_COMMENTS: limit(limits.PER_CLIENT_COMMENTS),
    ALL_CLIENTS_COMMENTS: limit(limits.ALL_CLIENTS_COMMENTS),
    ALL_LIKES: limit(limits.ALL_LIKES),
    PER_CLIENT_COLLECT: limit(limits.PER_CLIENT_COLLECT),
    ALL_COLLECT: limit(limits.ALL_COLLECT),
    PER_CLIENT_AUTH: limit(limits.PER_CLIENT_AUTH),
    SITE_URL: 'https://1saif.me',
    GITHUB_CLIENT_ID: 'Iv23client',
    GITHUB_CLIENT_SECRET: 'client-secret',
    SESSION_SECRET: 'a-long-random-session-secret',
    OWNER_GITHUB_ID: '999',
  } satisfies Env

  return { env, db }
}

// The Cache API exists only in Workers; this one keeps replies in a map keyed by URL.
function stubCache() {
  const stored = new Map<string, Response>()

  vi.stubGlobal('caches', {
    default: {
      match: async (request: Request) => stored.get(request.url)?.clone(),
      put: async (request: Request, response: Response) => { stored.set(request.url, response) },
      delete: async (request: Request) => stored.delete(request.url),
    },
  })
}

const octocat = { id: 42, login: 'octocat', name: 'The Octocat' }

// GitHub's token endpoint and user endpoint, answered from memory. Each call is recorded.
function stubGitHub(user: object = octocat, token: object = { access_token: 'ghu_token', token_type: 'bearer' }) {
  const calls: { url: string; method: string; body: string }[] = []

  vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
    calls.push({ url: String(url), method: init.method ?? 'GET', body: String(init.body ?? '') })

    if (String(url) === 'https://github.com/login/oauth/access_token') return Response.json(token)

    if (String(url) === 'https://api.github.com/user') return Response.json(user)

    return new Response(null, { status: 204 })
  })

  return calls
}

// The live site: each listed post page answers with its status, and every other page with 404. Each call is recorded.
function stubSite(pages: Record<string, number> = {}) {
  const calls: { url: string; method: string; redirect: string }[] = []

  vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
    calls.push({ url: String(url), method: init.method ?? 'GET', redirect: init.redirect ?? 'follow' })

    return new Response(null, { status: pages[String(url).replace('https://1saif.me/blog/', '')] ?? 404 })
  })

  return calls
}

const cookiesOf = (response: Response) => new Map(response.headers.getSetCookie().map(line => {
  const [pair] = line.split(';')
  const at = pair.indexOf('=')

  return [pair.slice(0, at), { value: pair.slice(at + 1), line }]
}))

async function startSignIn(env: Env, back = `/blog/${slug}`) {
  const response = await worker.fetch(new Request(`https://1saif.me/api/auth/github?return=${encodeURIComponent(back)}`), env, ctx)
  const location = new URL(response.headers.get('Location') ?? 'https://refused.invalid')

  return { response, location, flow: cookiesOf(response).get('__Host-github-flow')?.value ?? '' }
}

const callback = (query: string, flow: string) =>
  new Request(`https://1saif.me/api/auth/github/callback?${query}`, { headers: { Cookie: `__Host-github-flow=${flow}` } })

// The whole sign-in, as a browser goes through it. Returns the Cookie header the browser would send next.
async function signIn(env: Env, user: object = octocat) {
  stubGitHub(user)
  const { location, flow } = await startSignIn(env)
  const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), env, ctx)

  await Promise.all(pending)

  const cookies = cookiesOf(response)

  return { response, cookies, header: `__Host-session=${cookies.get('__Host-session')?.value}` }
}

function send(method: string, path: string, body: string, headers: Record<string, string> = {}) {
  return new Request(`https://1saif.me${path}`, {
    method,
    body: method === 'DELETE' && !body ? undefined : body,
    headers: { Origin: 'https://1saif.me', 'Content-Length': String(new TextEncoder().encode(body).length), ...headers },
  })
}

const likeRequest = (cookie: string, method: 'PUT' | 'DELETE' = 'PUT', body = JSON.stringify({ language: 'ar' }), headers: Record<string, string> = {}) =>
  send(method, `/api/posts/${slug}/like`, body, { Cookie: cookie, ...headers })

const likeState = (env: Env, cookie: string) => worker.fetch(new Request(`https://1saif.me/api/posts/${slug}/like`, { headers: { Cookie: cookie } }), env, ctx)

const goodFields = { message: 'Nice post.\r\nThanks', language: 'ar' }

const commentRequest = (cookie: string, fields: Record<string, string> = goodFields, headers: Record<string, string> = {}) =>
  send('POST', `/api/posts/${slug}/comments`, new URLSearchParams(fields).toString(), { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie, ...headers })

const editRequest = (cookie: string, id = 1, fields: Record<string, string> = { message: 'Edited.\r\nNow', language: 'en' }, headers: Record<string, string> = {}) =>
  send('PATCH', `/api/posts/${slug}/comments/${id}`, new URLSearchParams(fields).toString(), { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie, ...headers })

const read = async (env: Env) => {
  const response = await worker.fetch(new Request(`https://1saif.me/api/posts/${slug}`), env, ctx)

  await Promise.all(pending)

  return response
}

const sha256 = async (text: string) => btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

beforeEach(stubCache)

afterEach(() => {
  sent.length = 0
  points.length = 0
  pending.length = 0
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('reactions worker: reads', () => {
  it('answers an unknown post with 404', async () => {
    const { env } = makeEnv()
    stubSite()

    expect((await worker.fetch(new Request('https://1saif.me/api/posts/not-a-post'), env, ctx)).status).toBe(404)
    expect((await worker.fetch(send('PUT', '/api/posts/not-a-post/like', '{}'), env, ctx)).status).toBe(404)
    expect((await worker.fetch(send('DELETE', `/api/posts/${slug}/like/3`, ''), env, ctx)).status).toBe(404)
  })

  it('knows a post published after the deploy by its live page, and asks for that page once', async () => {
    const { env } = makeEnv()
    const calls = stubSite({ 'a-post-after-the-deploy': 200 })

    expect((await worker.fetch(new Request('https://1saif.me/api/posts/a-post-after-the-deploy'), env, ctx)).status).toBe(200)
    expect((await worker.fetch(new Request('https://1saif.me/api/posts/a-post-after-the-deploy'), env, ctx)).status).toBe(200)
    expect(calls).toEqual([{ url: 'https://1saif.me/blog/a-post-after-the-deploy', method: 'HEAD', redirect: 'manual' }])
  })

  it('answers a renamed post, a failed page check or an unreachable site with 404', async () => {
    const { env } = makeEnv()
    stubSite({ 'an-old-post-name': 301, 'a-post-the-site-failed-on': 500 })

    expect((await worker.fetch(new Request('https://1saif.me/api/posts/an-old-post-name'), env, ctx)).status).toBe(404)
    expect((await worker.fetch(new Request('https://1saif.me/api/posts/a-post-the-site-failed-on'), env, ctx)).status).toBe(404)

    vi.stubGlobal('fetch', async () => { throw new TypeError('network') })
    expect((await worker.fetch(new Request('https://1saif.me/api/posts/a-post-while-the-site-is-down'), env, ctx)).status).toBe(404)
  })

  it('serves a repeat read from the edge cache without touching D1', async () => {
    const { env, db } = makeEnv()
    const first = await read(env)

    expect(first.headers.get('Cache-Control')).toBe('public, max-age=0, s-maxage=30')
    expect(await first.json()).toEqual({ likes: 0, comments: [] })
    const queries = db.queries()

    expect(await (await read(env)).json()).toEqual({ likes: 0, comments: [] })
    expect(db.queries()).toBe(queries)
  })

  it('keeps the browser copy off on a cache hit, though the zone raises max-age there', async () => {
    const { env } = makeEnv()
    const key = new Request(`https://1saif.me/api/posts/${slug}`)

    await read(env)
    // What Cloudflare's default Browser Cache TTL (4 hours) does to the stored reply.
    const hit = (await caches.default.match(key))!
    const raised = new Response(hit.body, hit)

    raised.headers.set('Cache-Control', 'public, max-age=14400, s-maxage=30')
    await caches.default.put(key, raised)

    expect((await read(env)).headers.get('Cache-Control')).toBe('public, max-age=0, s-maxage=30')
  })

  it('shows a new comment on the next read, because a comment clears the cached reply', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    await read(env)
    await worker.fetch(commentRequest(header), env, ctx)
    expect((await (await read(env)).json()).comments).toHaveLength(1)
  })

  it('keeps the cached reply on a like, so a burst of likes cannot become a burst of comment reads', async () => {
    const { env, db } = makeEnv()
    const { header } = await signIn(env)

    await read(env)
    await worker.fetch(likeRequest(header), env, ctx)
    const queries = db.queries()

    expect(await (await read(env)).json()).toEqual({ likes: 0, comments: [] })
    expect(db.queries()).toBe(queries)
  })

  it('shows each comment with its author and leaves hidden comments and blocked users out', async () => {
    const { env, db } = makeEnv()
    const octo = await signIn(env)
    const other = await signIn(env, { id: 7, login: 'spammer', name: null })

    await worker.fetch(commentRequest(octo.header), env, ctx)
    await worker.fetch(commentRequest(octo.header, { message: 'Second' }), env, ctx)
    await worker.fetch(commentRequest(other.header, { message: 'Buy now' }), env, ctx)
    db.comments[1].hidden = 1
    db.users.set(7, { login: 'spammer', name: null, blocked: 1 })
    await caches.default.delete(new Request(`https://1saif.me/api/posts/${slug}`))

    const { comments } = await (await read(env)).json()

    expect(comments).toEqual([{ id: 1, body: 'Nice post.\nThanks', createdAt: expect.any(Number), editedAt: null, author: octocat }])
  })
})

describe('reactions worker: likes', () => {
  it('counts one like per GitHub account and tracks it once', async () => {
    const { env } = makeEnv()
    const octo = await signIn(env)
    const other = await signIn(env, { id: 7, login: 'hubot', name: null })

    expect(await (await worker.fetch(likeRequest(octo.header), env, ctx)).json()).toEqual({ likes: 1, liked: true })
    expect(await (await worker.fetch(likeRequest(octo.header), env, ctx)).json()).toEqual({ likes: 1, liked: true })
    expect(await (await worker.fetch(likeRequest(other.header, 'PUT', '{}'), env, ctx)).json()).toEqual({ likes: 2, liked: true })
    expect(points.map(point => point.blobs)).toEqual([['like', '', 'ar'], ['like', '', 'en']])
    expect(points[0].indexes).toEqual([slug])
  })

  it('removes only the caller\'s own like', async () => {
    const { env, db } = makeEnv()
    const octo = await signIn(env)
    const other = await signIn(env, { id: 7, login: 'hubot', name: null })

    await worker.fetch(likeRequest(octo.header), env, ctx)
    await worker.fetch(likeRequest(other.header), env, ctx)
    const response = await worker.fetch(likeRequest(octo.header, 'DELETE'), env, ctx)

    expect(await response.json()).toEqual({ likes: 1, liked: false })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect([...db.likes.keys()]).toEqual([`${slug} 7`])
    expect(points.map(point => point.blobs[0])).toEqual(['like', 'like', 'unlike'])
  })

  it('tells the signed-in viewer whether they like the post, apart from the shared cached reply', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    await read(env)
    expect(await (await likeState(env, header)).json()).toEqual({ likes: 0, liked: false })
    await worker.fetch(likeRequest(header), env, ctx)

    const response = await likeState(env, header)

    expect(await response.json()).toEqual({ likes: 1, liked: true })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect((await likeState(env, '')).status).toBe(401)
  })

  it('adds no like for a blocked account', async () => {
    const { env, db } = makeEnv()
    const { header } = await signIn(env)

    db.users.set(42, { login: 'octocat', name: 'The Octocat', blocked: 1 })

    expect(await (await worker.fetch(likeRequest(header), env, ctx)).json()).toEqual({ likes: 0, liked: false })
    expect(points).toEqual([])
  })

  it.each([
    ['no session', () => likeRequest(''), 401],
    ['a forged session', () => likeRequest('__Host-session=e30.e30'), 401],
    ['a body that is not JSON', (cookie: string) => likeRequest(cookie, 'PUT', 'language'), 400],
    ['another origin', (cookie: string) => likeRequest(cookie, 'PUT', '{}', { Origin: 'https://evil.example' }), 403],
    ['a POST', (cookie: string) => send('POST', `/api/posts/${slug}/like`, '{}', { Cookie: cookie }), 405],
    ['a body without a length', (cookie: string) => likeRequest(cookie, 'PUT', '{}', { 'Content-Length': '' }), 413],
  ])('refuses %s before any write', async (_, request, status) => {
    const { env, db } = makeEnv()
    const { header } = await signIn(env)
    const queries = db.queries()

    expect((await worker.fetch(request(header), env, ctx)).status).toBe(status)
    expect(db.queries()).toBe(queries)
  })

  it.each(['PER_CLIENT_LIKES', 'ALL_LIKES'] as const)('refuses a like over %s before D1', async binding => {
    const { env, db } = makeEnv({ [binding]: false })
    const { header } = await signIn(env)
    const queries = db.queries()

    expect((await worker.fetch(likeRequest(header), env, ctx)).status).toBe(429)
    expect(db.queries()).toBe(queries)
  })

  it('limits likes per account, not per address', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)
    const keys: string[] = []

    const counting = {
      ...env,
      PER_CLIENT_LIKES: {
        limit: async ({ key }: { key: string }) => {
          keys.push(key)

          return { success: true }
        },
      },
    }

    await worker.fetch(likeRequest(header, 'PUT', '{}', { 'CF-Connecting-IP': '203.0.113.9' }), counting, ctx)
    expect(keys).toEqual(['user:42'])
  })

  it('still answers when the analytics binding is missing', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    expect((await worker.fetch(likeRequest(header), { ...env, EVENTS: undefined }, ctx)).status).toBe(200)
  })
})

describe('reactions worker: GitHub sign-in', () => {
  it('sends the visitor to GitHub with a state and a PKCE challenge, kept in a short signed cookie', async () => {
    const { env } = makeEnv()
    const { response, location, flow } = await startSignIn(env)

    expect(response.status).toBe(302)
    expect(location.origin + location.pathname).toBe('https://github.com/login/oauth/authorize')
    expect(Object.fromEntries(location.searchParams)).toEqual({
      client_id: 'Iv23client',
      redirect_uri: 'https://1saif.me/api/auth/github/callback',
      state: expect.stringMatching(/^[\w-]{22}$/),
      code_challenge: expect.stringMatching(/^[\w-]{43}$/),
      code_challenge_method: 'S256',
    })
    expect(flow).toMatch(/^[\w-]+\.[\w-]+$/)
    expect(cookiesOf(response).get('__Host-github-flow')?.line).toContain('Path=/; Max-Age=600; Secure; SameSite=Lax; HttpOnly')
  })

  it('signs in: sends the PKCE verifier, saves the user, sets the session and keeps no GitHub token', async () => {
    const { env, db } = makeEnv()
    const calls = stubGitHub()
    const { location, flow } = await startSignIn(env)
    const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), env, ctx)

    await Promise.all(pending)

    const exchange = new URLSearchParams(calls[0].body)
    const cookies = cookiesOf(response)
    const viewer = JSON.parse(atob((cookies.get('__Host-viewer')?.value ?? '').replace(/-/g, '+').replace(/_/g, '/')))

    expect(response.status).toBe(303)
    expect(response.headers.get('Location')).toBe(`/blog/${slug}#comments-title`)
    expect(exchange.get('code')).toBe('abc')
    expect(exchange.get('client_secret')).toBe('client-secret')
    expect(await sha256(exchange.get('code_verifier') ?? '')).toBe(location.searchParams.get('code_challenge'))
    expect(calls.map(call => `${call.method} ${call.url}`)).toEqual([
      'POST https://github.com/login/oauth/access_token',
      'GET https://api.github.com/user',
    ])
    expect(db.users.get(42)).toEqual({ login: 'octocat', name: 'The Octocat', blocked: 0 })
    expect(cookies.get('__Host-session')?.line).toContain('Max-Age=2592000; Secure; SameSite=Lax; HttpOnly')
    expect(cookies.get('__Host-viewer')?.line).not.toContain('HttpOnly')
    expect(viewer).toEqual(octocat)
    expect(cookies.get('__Host-github-flow')?.line).toContain('Max-Age=0')
  })

  it('keeps a missing GitHub name empty and strips control and direction characters from a name', async () => {
    const { env, db } = makeEnv()

    await signIn(env, { id: 1, login: 'a-b', name: null })
    await signIn(env, { id: 2, login: 'c', name: 'Eve\r\nBcc: x' })
    // Direction overrides and zero-width characters could make a name read as another one.
    await signIn(env, { id: 3, login: 'd', name: 'Sai\u200Bf \u202Ehsilgne\u202C Aljanahi\uFEFF' })
    expect(db.users.get(1)?.name).toBeNull()
    expect(db.users.get(2)?.name).toBe('Eve  Bcc: x')
    expect(db.users.get(3)?.name).toBe('Saif hsilgne Aljanahi')
  })

  it.each([
    ['another state', (state: string) => `code=abc&state=${state}x`],
    ['no code, as when the visitor cancels on GitHub', (state: string) => `error=access_denied&state=${state}`],
  ])('refuses a callback with %s, without calling GitHub', async (_, query) => {
    const { env, db } = makeEnv()
    const calls = stubGitHub()
    const { location, flow } = await startSignIn(env)
    const response = await worker.fetch(callback(query(location.searchParams.get('state') ?? ''), flow), env, ctx)

    expect(response.headers.get('Location')).toBe(`/blog/${slug}?signin=failed#comments-title`)
    expect(cookiesOf(response).has('__Host-session')).toBe(false)
    expect(calls).toHaveLength(0)
    expect(db.users.size).toBe(0)
  })

  it('refuses a callback without the sign-in cookie or with a forged one', async () => {
    const { env } = makeEnv()
    const calls = stubGitHub()
    const { location, flow } = await startSignIn(env)
    const state = location.searchParams.get('state')
    const [payload, signature] = flow.split('.')
    const forged = `${btoa(JSON.stringify({ use: 'flow', state, verifier: 'x', back: '/blog', exp: Date.now() + 60_000 })).replace(/=+$/, '')}.${signature}`

    for (const cookie of ['', forged, `${payload}.${signature}x`]) {
      const response = await worker.fetch(callback(`code=abc&state=${state}`, cookie), env, ctx)

      expect(response.headers.get('Location')).toContain('signin=failed')
    }

    expect(calls).toHaveLength(0)
  })

  it('fails the sign-in when GitHub refuses the code with a 200 reply', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { env, db } = makeEnv()

    stubGitHub(octocat, { error: 'bad_verification_code' })
    const { location, flow } = await startSignIn(env)
    const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), env, ctx)

    expect(response.headers.get('Location')).toContain('signin=failed')
    expect(db.users.size).toBe(0)
  })

  it.each([
    ['a profile without a valid login', { id: 42, login: '<script>', name: 'x' }],
    ['a profile without an ID', { login: 'octocat' }],
  ])('fails the sign-in on %s', async (_, user) => {
    const { env, db } = makeEnv()
    const { cookies } = await signIn(env, user)

    expect(cookies.has('__Host-session')).toBe(false)
    expect(db.users.size).toBe(0)
  })

  it.each(['https://evil.example/', '//evil.example', '/blog/not-a-post', `/blog/${slug}?x=1`])('returns only to a post page, not to %s', async back => {
    const { env } = makeEnv()
    stubSite()
    const { location, flow } = await startSignIn(env, back)

    stubGitHub()
    const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), env, ctx)

    expect(response.headers.get('Location')).toBe('/blog#comments-title')
  })

  it('returns to a post published after the deploy', async () => {
    const { env } = makeEnv()
    stubSite({ 'a-post-to-return-to': 200 })
    const { location, flow } = await startSignIn(env, '/blog/a-post-to-return-to')

    stubGitHub()
    const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), env, ctx)

    expect(response.headers.get('Location')).toBe('/blog/a-post-to-return-to#comments-title')
  })

  it('returns to the Arabic post page', async () => {
    const { env } = makeEnv()
    const { location, flow } = await startSignIn(env, `/ar/blog/${slug}`)

    stubGitHub()
    const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), env, ctx)

    expect(response.headers.get('Location')).toBe(`/ar/blog/${slug}#comments-title`)
  })

  it('limits sign-in starts per client', async () => {
    const { env } = makeEnv({ PER_CLIENT_AUTH: false })

    expect((await startSignIn(env)).response.status).toBe(429)
  })

  it('limits callbacks per client, so a replayed flow cookie cannot flood GitHub', async () => {
    const { env } = makeEnv()
    const calls = stubGitHub()
    const { location, flow } = await startSignIn(env)
    const limited = { ...env, PER_CLIENT_AUTH: { limit: async () => ({ success: false }) } }
    const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), limited, ctx)

    expect(response.headers.get('Location')).toBe(`/blog/${slug}?signin=failed#comments-title`)
    expect(calls).toEqual([])
  })

  it('takes a 2,000-character comment in Chinese', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    expect((await worker.fetch(commentRequest(header, { message: '字'.repeat(2000), language: 'en' }), env, ctx)).status).toBe(201)
  })

  it('signs out only from the site', async () => {
    const { env } = makeEnv()
    const response = await worker.fetch(send('POST', '/api/auth/logout', ''), env, ctx)
    const cookies = cookiesOf(response)

    expect(response.status).toBe(204)
    expect(cookies.get('__Host-session')?.line).toContain('Max-Age=0')
    expect(cookies.get('__Host-viewer')?.line).toContain('Max-Age=0')
    expect((await worker.fetch(send('POST', '/api/auth/logout', '', { Origin: 'https://evil.example' }), env, ctx)).status).toBe(403)
    expect((await worker.fetch(new Request('https://1saif.me/api/auth/logout'), env, ctx)).status).toBe(404)
  })
})

describe('reactions worker: comments', () => {
  it('saves a comment from a signed-in user and mails the hide and block commands', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)
    const response = await worker.fetch(commentRequest(header), env, ctx)

    await Promise.all(pending)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ id: 1, body: 'Nice post.\nThanks', createdAt: expect.any(Number), editedAt: null, author: octocat })
    expect(sent).toHaveLength(1)
    expect(sent[0].text).toContain('The Octocat (https://github.com/octocat) wrote on')
    expect(sent[0].text).toContain('--command "UPDATE comments SET hidden = 1 WHERE id = 1"')
    expect(sent[0].text).toContain('--command "UPDATE users SET blocked = 1 WHERE github_id = 42; DELETE FROM likes WHERE user_id = 42"')
    // The comment goes last, so text in it cannot pass for one of the commands.
    expect(sent[0].text.endsWith('Nice post.\nThanks')).toBe(true)
    expect(points.map(point => point.blobs)).toEqual([['comment', '', 'ar']])
  })

  it('refuses a comment without a session before reading the body or D1', async () => {
    const { env, db } = makeEnv()

    expect((await worker.fetch(commentRequest(''), env, ctx)).status).toBe(401)
    expect(db.queries()).toBe(0)
  })

  it('refuses a session cookie with a changed payload', async () => {
    const { env, db } = makeEnv()
    const { cookies } = await signIn(env)
    const [, signature] = (cookies.get('__Host-session')?.value ?? '').split('.')
    const payload = btoa(JSON.stringify({ use: 'session', id: 1, login: 'admin', name: null, exp: Date.now() + 60_000 })).replace(/=+$/, '')

    expect((await worker.fetch(commentRequest(`__Host-session=${payload}.${signature}`), env, ctx)).status).toBe(401)
    expect(db.comments).toHaveLength(0)
  })

  it('refuses the sign-in cookie used as a session', async () => {
    const { env } = makeEnv()
    const { flow } = await startSignIn(env)

    expect((await worker.fetch(commentRequest(`__Host-session=${flow}`), env, ctx)).status).toBe(401)
  })

  it('refuses an expired session', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 31 * 24 * 60 * 60 * 1000)
    expect((await worker.fetch(commentRequest(header), env, ctx)).status).toBe(401)
  })

  it('refuses a session signed with another secret', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    expect((await worker.fetch(commentRequest(header), { ...env, SESSION_SECRET: 'rotated' }, ctx)).status).toBe(401)
  })

  it('refuses a blocked user', async () => {
    const { env, db } = makeEnv()
    const { header } = await signIn(env)

    db.users.set(42, { login: 'octocat', name: null, blocked: 1 })
    expect((await worker.fetch(commentRequest(header), env, ctx)).status).toBe(403)
    expect(db.comments).toHaveLength(0)
    expect(points.at(-1)?.blobs.at(-1)).toBe('blocked')
  })

  it('refuses an 11th comment from one account on one post in a day, hidden and deleted ones included', async () => {
    const { env, db } = makeEnv()
    const { header } = await signIn(env)

    for (let i = 0; i < 10; i += 1) expect((await worker.fetch(commentRequest(header, { message: `Comment ${i}` }), env, ctx)).status).toBe(201)

    // Deleting a comment must not free a place, or one account could post and delete all day.
    expect((await worker.fetch(send('DELETE', `/api/posts/${slug}/comments/1`, '', { Cookie: header, Origin: 'https://1saif.me' }), env, ctx)).status).toBe(200)
    db.comments[1].hidden = 1
    const refused = await worker.fetch(commentRequest(header), env, ctx)

    expect(refused.status).toBe(429)
    expect((await refused.json()).error).toBe('daily')
    expect(db.comments).toHaveLength(10)
    expect(points.at(-1)?.blobs.at(-1)).toBe('daily')

    for (const item of db.comments) item.createdAt -= 86_400_000
    expect((await worker.fetch(commentRequest(header), env, ctx)).status).toBe(201)
  })

  it('keeps the comment when the email fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { env, db } = makeEnv()
    const { header } = await signIn(env)

    env.EMAIL.send = async () => {
      throw Object.assign(new Error('octocat'), { code: 'E_SEND' })
    }

    expect((await worker.fetch(commentRequest(header), env, ctx)).status).toBe(201)
    await Promise.all(pending)
    expect(db.comments).toHaveLength(1)
  })

  it.each([
    ['an empty message', ' '],
    ['a message over 2,000 characters', 'x'.repeat(2_001)],
    ['a control character', 'a\u0000b'],
  ])('refuses %s', async (_, message) => {
    const { env, db } = makeEnv()
    const { header } = await signIn(env)

    expect((await worker.fetch(commentRequest(header, { message }), env, ctx)).status).toBe(400)
    expect(db.comments).toHaveLength(0)
    expect(points.at(-1)?.blobs.at(-1)).toBe('invalid')
  })

  it('accepts a 2,000-character Arabic message', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    expect((await worker.fetch(commentRequest(header, { message: 'ع'.repeat(2_000) }), env, ctx)).status).toBe(201)
  })

  it('refuses a comment over ALL_CLIENTS_COMMENTS', async () => {
    const { env, db } = makeEnv({ ALL_CLIENTS_COMMENTS: false })
    const { header } = await signIn(env)

    expect((await worker.fetch(commentRequest(header), env, ctx)).status).toBe(429)
    expect(db.comments).toHaveLength(0)
    // Refused before any tracked check, so many accounts together cannot pass the analytics bound.
    expect(points).toHaveLength(0)
    expect((await worker.fetch(commentRequest(header, { message: ' ' }), env, ctx)).status).toBe(429)
    expect(points).toHaveLength(0)
  })

  it('refuses a comment over PER_CLIENT_COMMENTS without spending an analytics point', async () => {
    const { env, db } = makeEnv({ PER_CLIENT_COMMENTS: false })
    const { header } = await signIn(env)

    expect((await worker.fetch(commentRequest(header), env, ctx)).status).toBe(429)
    expect(db.comments).toHaveLength(0)
    expect(points).toHaveLength(0)
  })

  it('refuses a JSON body and another origin', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    expect((await worker.fetch(commentRequest(header, goodFields, { 'Content-Type': 'application/json' }), env, ctx)).status).toBe(415)
    expect((await worker.fetch(commentRequest(header, goodFields, { Origin: 'https://evil.example' }), env, ctx)).status).toBe(403)
  })

  it('lets the author delete their own comment, and nobody else', async () => {
    const { env, db } = makeEnv()
    const octo = await signIn(env)
    const other = await signIn(env, { id: 7, login: 'someone', name: null })
    const remove = (cookie: string, origin = 'https://1saif.me') => send('DELETE', `/api/posts/${slug}/comments/1`, '', { Cookie: cookie, Origin: origin })

    await worker.fetch(commentRequest(octo.header), env, ctx)
    await read(env)

    expect((await worker.fetch(remove(other.header), env, ctx)).status).toBe(404)
    expect((await worker.fetch(remove(''), env, ctx)).status).toBe(401)
    expect((await worker.fetch(remove(octo.header, 'https://evil.example'), env, ctx)).status).toBe(403)
    expect(db.comments).toHaveLength(1)

    expect((await worker.fetch(remove(octo.header), env, ctx)).status).toBe(200)
    expect(db.comments[0]).toMatchObject({ body: '', hidden: 1 })
    expect((await (await read(env)).json()).comments).toEqual([])
    expect((await worker.fetch(remove(octo.header), env, ctx)).status).toBe(404)
  })

  it('lets the author edit their own comment, keeps its date, marks it edited and mails the new text', async () => {
    const { env, db } = makeEnv()
    const octo = await signIn(env)
    const other = await signIn(env, { id: 7, login: 'someone', name: null })

    await worker.fetch(commentRequest(octo.header), env, ctx)
    const before = await (await read(env)).json()

    sent.length = 0
    points.length = 0
    expect((await worker.fetch(editRequest(other.header), env, ctx)).status).toBe(404)
    expect((await worker.fetch(editRequest(''), env, ctx)).status).toBe(401)
    expect((await worker.fetch(editRequest(octo.header, 1, undefined, { Origin: 'https://evil.example' }), env, ctx)).status).toBe(403)
    expect((await worker.fetch(editRequest(octo.header, 1, undefined, { 'Content-Type': 'application/json' }), env, ctx)).status).toBe(415)
    expect((await worker.fetch(editRequest(octo.header, 1, { message: ' ' }), env, ctx)).status).toBe(400)
    expect((await worker.fetch(editRequest(octo.header, 1, { message: 'x'.repeat(2_001) }), env, ctx)).status).toBe(400)
    expect(db.comments[0]).toMatchObject({ body: 'Nice post.\nThanks', editedAt: null })

    const response = await worker.fetch(editRequest(octo.header), env, ctx)

    await Promise.all(pending)
    expect(response.status).toBe(200)
    const edited = await response.json()

    expect(edited).toEqual({ id: 1, body: 'Edited.\nNow', createdAt: before.comments[0].createdAt, editedAt: expect.any(Number), author: octocat })
    // The edit cleared the cached reply, so the next read shows it.
    expect((await (await read(env)).json()).comments).toEqual([edited])
    expect(sent).toHaveLength(1)
    expect(sent[0].subject).toBe(`Edited comment on ${slug}`)
    expect(sent[0].text).toContain('--command "UPDATE comments SET hidden = 1 WHERE id = 1"')
    expect(sent[0].text.endsWith('edited their comment on https://1saif.me/blog/' + slug + ':\n\nEdited.\nNow')).toBe(true)
    expect(points.map(point => point.blobs[0])).toEqual(['comment_rejected', 'comment_rejected', 'comment_edited'])
  })

  it('refuses an edit of a deleted or hidden comment, and from a blocked account', async () => {
    const { env, db } = makeEnv()
    const { header } = await signIn(env)

    await worker.fetch(commentRequest(header), env, ctx)
    await worker.fetch(commentRequest(header), env, ctx)
    await worker.fetch(send('DELETE', `/api/posts/${slug}/comments/1`, '', { Cookie: header }), env, ctx)
    db.comments[1].hidden = 1

    expect((await worker.fetch(editRequest(header, 1), env, ctx)).status).toBe(404)
    expect((await worker.fetch(editRequest(header, 2), env, ctx)).status).toBe(404)
    expect(db.comments.map(item => item.body)).toEqual(['', 'Nice post.\nThanks'])

    db.comments[1].hidden = 0
    db.users.set(42, { login: 'octocat', name: null, blocked: 1 })
    expect((await worker.fetch(editRequest(header, 2), env, ctx)).status).toBe(403)
    expect(db.comments[1].editedAt).toBeNull()
  })

  it('refuses an 11th edit of one comment', async () => {
    const { env, db } = makeEnv()
    const { header } = await signIn(env)

    await worker.fetch(commentRequest(header), env, ctx)

    for (let i = 0; i < 10; i += 1) expect((await worker.fetch(editRequest(header, 1, { message: `Edit ${i}` }), env, ctx)).status).toBe(200)

    const refused = await worker.fetch(editRequest(header), env, ctx)

    expect(refused.status).toBe(429)
    expect((await refused.json()).error).toBe('edits')
    expect(db.comments[0].body).toBe('Edit 9')
  })

  it('limits edits with the comment rate limits', async () => {
    for (const limit of ['PER_CLIENT_COMMENTS', 'ALL_CLIENTS_COMMENTS'] as const) {
      const { env, db } = makeEnv()
      const { header } = await signIn(env)

      await worker.fetch(commentRequest(header), env, ctx)
      env[limit] = { limit: async () => ({ success: false }) }
      expect((await worker.fetch(editRequest(header), env, ctx)).status).toBe(429)
      expect(db.comments[0].editedAt).toBeNull()
    }
  })

  it('takes PATCH only on one comment and POST only on the list', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    expect((await worker.fetch(send('PATCH', `/api/posts/${slug}/comments`, 'message=x', { Cookie: header }), env, ctx)).status).toBe(405)
    expect((await worker.fetch(send('POST', `/api/posts/${slug}/comments/1`, 'message=x', { Cookie: header }), env, ctx)).status).toBe(405)
  })
})

const PHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'

const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

describe('reactions worker: page views', () => {
  const beacon = { path: '/ar/blog/x/', ref: 'https://www.google.com/search?q=saif', lang: 'ar', entry: true, lcp: 1200, cls: 0, inp: -1, ttfb: 80 }

  const collect = (body: Record<string, string | number | boolean>, headers: Record<string, string> = {}) => send('POST', '/api/read', JSON.stringify(body), { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': PHONE, ...headers })

  // The row a beacon writes, from one address.
  const rowOf = async (body: Record<string, string | number | boolean>, headers: Record<string, string> = {}) => {
    const { env, db } = makeEnv()

    await worker.fetch(collect(body, { 'CF-Connecting-IP': '192.0.2.1', ...headers }), env, ctx)
    await Promise.all(pending)

    return db.views[0]
  }

  it('writes one data point with the referrer host only', async () => {
    const { env } = makeEnv()
    const response = await worker.fetch(collect(beacon), env, ctx)

    expect(response.status).toBe(204)
    expect(points).toEqual([{ indexes: ['/blog/x'], blobs: ['pageview', '/ar/blog/x/', 'www.google.com', 'ar', '', 'mobile'], doubles: [1, 1200, 0, -1, 80] }])
  })

  // A tab opened before a deploy still sends the old beacon, without entry, time, scroll or touch.
  it('writes a full row from the old beacon', async () => {
    const row = await rowOf({ path: '/blog/x/', ref: 'https://www.google.com', lang: 'en', w: 390, lcp: 900, cls: 0, inp: -1, ttfb: 70 })

    expect(Object.values(row).filter(value => value === undefined || Number.isNaN(value))).toEqual([])
    expect(row).toMatchObject({ entry: 0, channel: 'search', seconds: 0, scroll: null, lcp: 900, inp: null })
  })

  // EasyPrivacy blocks /api/collect, so the beacon moved to /api/read; a tab opened before the move still uses the old path.
  it('counts a view sent to the old path', async () => {
    const { env, db } = makeEnv()

    await worker.fetch(send('POST', '/api/collect', JSON.stringify(beacon), { 'User-Agent': PHONE, 'CF-Connecting-IP': '192.0.2.1' }), env, ctx)
    await Promise.all(pending)

    expect(db.views).toHaveLength(1)
  })

  it('keeps an inside referrer empty', async () => {
    const { env } = makeEnv()

    await worker.fetch(collect({ ...beacon, path: '/', ref: 'https://1saif.me/blog' }, { 'User-Agent': MAC }), env, ctx)
    expect(points[0].indexes).toEqual(['/'])
    expect(points[0].blobs.slice(2)).toEqual(['', 'ar', '', 'desktop'])
  })

  it.each([
    ['another origin', collect(beacon, { Origin: 'https://evil.example' }), 403],
    ['a body over 2 KB', collect({ ...beacon, ref: 'x'.repeat(3_000) }), 413],
  ])('refuses %s', async (_, request, status) => {
    const { env } = makeEnv()

    expect((await worker.fetch(request, env, ctx)).status).toBe(status)
    expect(points).toHaveLength(0)
  })

  it.each([
    ['a bot', collect(beacon, { 'User-Agent': 'Googlebot/2.1' })],
    ['a headless browser', collect(beacon, { 'User-Agent': 'Mozilla/5.0 HeadlessChrome/120' })],
    ['a speed test', collect(beacon, { 'User-Agent': `${MAC} Chrome-Lighthouse` })],
    ['a signed AI agent with a normal browser string', collect(beacon, { 'User-Agent': MAC, 'Signature-Agent': '"https://chatgpt.com"' })],
    ['an AI agent by its token', collect(beacon, { 'User-Agent': `${MAC} Google-Agent` })],
    ["Meta's crawler with a normal browser string", collect(beacon, { 'User-Agent': `${MAC} meta-externalagent/1.1` })],
    ['a path with a query', collect({ ...beacon, path: '/blog?q=1' })],
    ['a path with a hash', collect({ ...beacon, path: '/blog#top' })],
    ['another host', collect({ ...beacon, path: '//evil.example/x' })],
    ['a path that is only slashes', collect({ ...beacon, path: '//' })],
    ['a path with a backslash host', collect({ ...beacon, path: '/\\' })],
    ['a path over 200 characters', collect({ ...beacon, path: `/${'x'.repeat(200)}` })],
    ['a body that is not JSON', send('POST', '/api/read', 'hello')],
  ])('drops %s with 204', async (_, request) => {
    const { env } = makeEnv()

    expect((await worker.fetch(request, env, ctx)).status).toBe(204)
    expect(points).toHaveLength(0)
  })

  it.each(['PER_CLIENT_COLLECT', 'ALL_COLLECT'] as const)('drops a view over %s', async binding => {
    const { env, db } = makeEnv({ [binding]: false })

    expect((await worker.fetch(collect(beacon), env, ctx)).status).toBe(204)
    await Promise.all(pending)
    expect(points).toHaveLength(0)
    expect(db.views).toHaveLength(0)
  })

  it('counts a visitor once per page and day, by a hash that holds no IP address', async () => {
    const { env, db } = makeEnv()

    await worker.fetch(collect(beacon, { 'CF-Connecting-IP': '203.0.113.7' }), env, ctx)
    await worker.fetch(collect({ ...beacon, path: '/blog/x', ref: '' }, { 'CF-Connecting-IP': '203.0.113.7' }), env, ctx)
    await worker.fetch(collect(beacon, { 'CF-Connecting-IP': '203.0.113.8' }), env, ctx)
    await Promise.all(pending)

    expect(db.views).toHaveLength(2)
    expect(db.views.map(({ page, views, entry, channel, source, language, device, browser, os }) => ({ page, views, entry, channel, source, language, device, browser, os }))).toEqual([
      { page: '/blog/x', views: 2, entry: 1, channel: 'search', source: 'google.com', language: 'ar', device: 'mobile', browser: 'Safari', os: 'iOS' },
      { page: '/blog/x', views: 1, entry: 1, channel: 'search', source: 'google.com', language: 'ar', device: 'mobile', browser: 'Safari', os: 'iOS' },
    ])
    expect(db.views[0].visitor).toMatch(/^[\w-]{22}$/)
    expect(JSON.stringify(db.views)).not.toContain('203.0.113')
  })

  it.each([
    ['a search engine', { ref: 'https://www.google.com/' }, ['search', 'google.com', '', '']],
    ['ChatGPT, by its tag', { ref: 'https://chatgpt.com/', source: 'chatgpt.com' }, ['ai', 'chatgpt.com', '', '']],
    ['Gemini, by its tag', { source: 'gemini' }, ['ai', 'gemini', '', '']],
    ['Perplexity, by its host', { ref: 'https://www.perplexity.ai/' }, ['ai', 'perplexity.ai', '', '']],
    ['Gemini before Google search', { ref: 'https://gemini.google.com/' }, ['ai', 'gemini.google.com', '', '']],
    ['Hacker News', { ref: 'https://news.ycombinator.com/item' }, ['social', 'news.ycombinator.com', '', '']],
    ['a Google Ads click', { keys: 'utm_campaign,gclid', campaign: 'Launch_2026' }, ['paid', 'google', 'cpc', 'launch_2026']],
    ['a shared Facebook link', { keys: 'fbclid', ref: 'https://l.facebook.com/' }, ['social', 'facebook', 'social', '']],
    ['a Snapchat ad, whose ID has capitals', { keys: 'ScCid' }, ['paid', 'snapchat', 'cpc', '']],
    ['an Instagram share with no referrer', { keys: 'igsh' }, ['social', 'instagram', 'social', '']],
    ['a Mailchimp email with no referrer', { keys: 'mc_cid,mc_eid' }, ['email', 'mailchimp', 'email', '']],
    ['a newsletter', { source: 'Newsletter', medium: 'email', campaign: 'Oct 2026' }, ['email', 'newsletter', 'email', 'oct 2026']],
    ['a paid tag on any source', { source: 'linkedin', medium: 'paid_social' }, ['paid', 'linkedin', 'paid_social', '']],
    ['an organic_social tag on an unknown source', { source: 'company_page', medium: 'organic_social' }, ['social', 'company_page', 'organic_social', '']],
    ['an e_mail tag', { source: 'list', medium: 'e_mail' }, ['email', 'list', 'e_mail', '']],
    ['another site', { ref: 'https://dev.example/post' }, ['referral', 'dev.example', '', '']],
    ['no referrer', {}, ['direct', '', '', '']],
    ['an email address or markup in a tag', { source: 'me@example.com', campaign: '<b>spring</b>' }, ['direct', '', '', 'bspringb']],
    ['an unknown click ID', { keys: 'xclid' }, ['direct', '', '', '']],
  ])('records %s as where the visit came from', async (_, origin, expected) => {
    const row = await rowOf({ path: '/', ...origin })

    expect([row.channel, row.source, row.medium, row.campaign]).toEqual(expected)
  })

  it('records which link of a campaign started the visit, without markup', async () => {
    const row = await rowOf({ path: '/', source: 'linkedin', medium: 'organic_social', campaign: 'cloud', content: 'Post_01<i>' })

    expect([row.channel, row.campaign, row.content]).toEqual(['social', 'cloud', 'post_01i'])
  })

  it.each([
    ['an iPhone', PHONE, {}, ['mobile', 'Safari', 'iOS']],
    ['an iPad, which sends the Mac string', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15', { touch: true }, ['tablet', 'Safari', 'iOS']],
    ['a Mac', MAC, {}, ['desktop', 'Chrome', 'macOS']],
    ['Edge on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', {}, ['desktop', 'Edge', 'Windows']],
    ['an Android phone', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36', {}, ['mobile', 'Chrome', 'Android']],
    ['an Android tablet', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', {}, ['tablet', 'Chrome', 'Android']],
    ['Firefox on Linux', 'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0', {}, ['desktop', 'Firefox', 'Linux']],
    ['the Instagram app', `${PHONE} Instagram 400.0.0.0`, {}, ['mobile', 'In-app', 'iOS']],
  ])('records the device, browser and system of %s', async (_, agent, extra, expected) => {
    const row = await rowOf({ path: '/', ...extra }, { 'User-Agent': agent })

    expect([row.device, row.browser, row.os]).toEqual(expected)
  })

  it('knows Brave by its Sec-CH-UA brand', async () => {
    const row = await rowOf({ path: '/' }, { 'User-Agent': MAC, 'Sec-CH-UA': '"Brave";v="140", "Chromium";v="140", "Not=A?Brand";v="24"' })

    expect(row.browser).toBe('Brave')
  })

  it('adds the time, keeps the deepest scroll and the first speed of a page read twice', async () => {
    const { env, db } = makeEnv()
    const headers = { 'CF-Connecting-IP': '192.0.2.1' }

    await worker.fetch(collect({ path: '/blog/x', entry: true, seconds: 30, scroll: 40, lcp: 1200.4, inp: -1, cls: 0.01234, ttfb: 80 }, headers), env, ctx)
    await worker.fetch(collect({ path: '/blog/x', entry: false, seconds: 7200, scroll: 140, lcp: -1, inp: 180, cls: 0.5, ttfb: -1 }, headers), env, ctx)
    await Promise.all(pending)

    expect(db.views).toHaveLength(1)
    expect(db.views[0]).toMatchObject({ views: 2, entry: 1, seconds: 1830, scroll: 100, lcp: 1200, inp: 180, cls: 0.0123, ttfb: 80 })
  })

  it('gives a visitor a new ID on a new Baghdad day and deletes the old salt', async () => {
    const { env, db } = makeEnv()
    vi.useFakeTimers({ toFake: ['Date'] })

    // 20:59 UTC is 23:59 in Baghdad; a minute later the day changes there.
    for (const time of ['2026-03-01T20:59:00Z', '2026-03-01T21:00:00Z']) {
      vi.setSystemTime(new Date(time))
      await worker.fetch(collect(beacon), env, ctx)
      await Promise.all(pending)
    }

    vi.useRealTimers()
    expect(db.views.map(row => row.day)).toEqual(['2026-03-01', '2026-03-02'])
    expect(db.views[0].visitor).not.toBe(db.views[1].visitor)
    expect([...db.salts.keys()]).toEqual(['2026-03-02'])
  })

  it("does not count the owner's own views", async () => {
    const { env, db } = makeEnv()
    const owner = await signIn(env, { id: 999, login: 'saif', name: 'Saif' })

    await worker.fetch(collect(beacon, { Cookie: owner.header }), env, ctx)
    await Promise.all(pending)
    expect(points).toHaveLength(0)
    expect(db.views).toHaveLength(0)
  })

  it('keeps counting when D1 fails', async () => {
    const { env } = makeEnv()
    vi.spyOn(env.DB, 'prepare').mockImplementation(() => { throw new Error('D1 is down') })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect((await worker.fetch(collect(beacon, { 'CF-Connecting-IP': '198.51.100.1' }), env, ctx)).status).toBe(204)
    await Promise.all(pending)
    expect(points).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith('view count failed')
  })
})

describe('reactions worker: insights', () => {
  const read = (env: Env, query = '', cookie = '') => worker.fetch(new Request(`https://1saif.me/api/insights${query}`, { headers: cookie ? { Cookie: cookie } : {} }), env, ctx)

  const view = (path: string, ip: string, beacon: Record<string, string | number | boolean>) =>
    send('POST', '/api/read', JSON.stringify({ path, lang: path.startsWith('/ar') ? 'ar' : 'en', entry: true, seconds: 5, ...beacon }), { 'User-Agent': MAC, 'CF-Connecting-IP': ip })

  it('answers 404 to anyone but the owner', async () => {
    const { env } = makeEnv()
    const reader = await signIn(env)

    expect((await read(env)).status).toBe(404)
    expect((await read(env, '', reader.header)).status).toBe(404)
  })

  it('reports visits, pages, origins, audience, hours, speed, likes and comments for the range', async () => {
    const { env } = makeEnv()
    vi.useFakeTimers({ toFake: ['Date'] })
    // 12:30 on Wednesday 4 March in Baghdad.
    vi.setSystemTime(new Date('2026-03-04T09:30:00Z'))
    const reader = await signIn(env)

    const views: [string, string, Record<string, string | number | boolean>][] = [
      [`/blog/${slug}`, '1', { ref: 'https://news.ycombinator.com/item', seconds: 40, scroll: 80, lcp: 1800, ttfb: 300 }],
      [`/ar/blog/${slug}`, '1', { entry: false, seconds: 20, scroll: 100 }],
      [`/blog/${slug}`, '2', { lcp: 5000, ttfb: 900 }],
      ['/', '2', { ref: 'https://www.google.com/' }],
      ['/', '3', { seconds: 3 }],
    ]

    for (const [path, ip, beacon] of views) await worker.fetch(view(path, `192.0.2.${ip}`, beacon), env, ctx)

    await worker.fetch(likeRequest(reader.header), env, ctx)
    await worker.fetch(commentRequest(reader.header), env, ctx)
    await Promise.all(pending)
    const owner = await signIn(env, { id: 999, login: 'saif', name: 'Saif' })
    const response = await read(env, '?days=7', owner.header)
    const body = await response.json()

    vi.useRealTimers()
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(body.from).toBe('2026-02-26')
    expect(body.before).toBe('2026-02-19')
    expect(body.first).toBe('2026-03-04')
    expect(body.read).toBeGreaterThan(0)
    // Visitor 1 stayed 60 seconds and visitor 2 read two pages; visitor 3 left after 3 seconds.
    expect(body.daily).toEqual([{ day: '2026-03-04', views: 5, visitors: 3, seconds: 73, engaged: 2 }])
    expect(body.pages).toEqual([
      { page: `/blog/${slug}`, day: '2026-03-04', views: 3, visitors: 2, entries: 2, seconds: 65, scroll: 100, scrolled: 1, arabic: 0 },
      { page: '/', day: '2026-03-04', views: 2, visitors: 2, entries: 2, seconds: 8, scroll: null, scrolled: 0, arabic: 0 },
    ])
    // Visitor 2 started on a post with no referrer and came back from Google, so both starts are engaged visits.
    expect(body.acquisition).toEqual([
      { channel: 'social', source: 'news.ycombinator.com', medium: '', campaign: '', content: '', visitors: 1, engaged: 1 },
      { channel: 'direct', source: '', medium: '', campaign: '', content: '', visitors: 2, engaged: 1 },
      { channel: 'search', source: 'google.com', medium: '', campaign: '', content: '', visitors: 1, engaged: 1 },
    ])
    expect(body.audience).toEqual([{ device: 'desktop', browser: 'Chrome', os: 'macOS', country: '', visitors: 3, engaged: 2 }])
    expect(body.hours).toEqual([{ weekday: 3, hour: 12, visitors: 3 }])
    expect(body.speed).toEqual([{ device: 'desktop', lcp: 2, lcpGood: 1, lcpPoor: 1, inp: 0, inpGood: null, inpPoor: null, cls: 0, clsGood: null, clsPoor: null, ttfb: 2, ttfbGood: 1, ttfbPoor: 0 }])
    expect(body.likesDaily).toEqual([{ day: '2026-03-04', count: 1 }])
    expect(body.commentsDaily).toEqual([{ day: '2026-03-04', count: 1 }])
    expect(body.likes).toEqual([{ slug, count: 1 }])
    expect(body.comments).toEqual([{ slug, count: 1 }])
  })

  it.each(['?days=0', '?days=366', '?days=7.5', '?days=x'])('refuses %s', async query => {
    const { env } = makeEnv()
    const owner = await signIn(env, { id: 999, login: 'saif', name: 'Saif' })

    expect((await read(env, query, owner.header)).status).toBe(400)
  })

  it('returns the owner to the insights page after sign-in', async () => {
    const { env } = makeEnv()
    stubSite()
    const { location, flow } = await startSignIn(env, '/ar/insights')

    stubGitHub()
    const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), env, ctx)

    expect(response.headers.get('Location')).toBe('/ar/insights#comments-title')
  })
})
