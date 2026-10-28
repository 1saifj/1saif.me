// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { publishedBlogs } from '../../../src/data/blogs'
import { createSlugFromTitle } from '../../../src/utils/slugUtils'
import worker, { Env, PostComment } from './index'

const slug = createSlugFromTitle(publishedBlogs[0].title)

const sent: { subject: string; text: string }[] = []

const points: { indexes: string[]; blobs: string[]; doubles: number[] }[] = []

const pending: Promise<unknown>[] = []

const ctx = { waitUntil: (promise: Promise<unknown>) => { pending.push(promise) } }

type StoredComment = PostComment & { slug: string; hidden: number }

// A fake D1 that answers the Worker's own statements from memory, so the tests run on any Node version.
function makeDb() {
  const likes = new Set<string>()
  const stats = new Map<string, number>()
  const comments: StoredComment[] = []
  let queries = 0

  const execute = (sql: string, [first, second, third, fourth]: (string | number)[]) => {
    queries += 1

    if (sql.startsWith('SELECT likes')) return { results: stats.has(String(first)) ? [{ likes: stats.get(String(first)) }] : [], changes: 0 }

    if (sql.startsWith('SELECT id')) {
      const visible = comments.filter(item => item.slug === first && item.hidden === 0).sort((a, b) => a.createdAt - b.createdAt).slice(0, Number(second))

      return { results: visible.map(({ id, name, body, createdAt }) => ({ id, name, body, createdAt })), changes: 0 }
    }

    if (sql.startsWith('INSERT OR IGNORE INTO likes')) {
      const before = likes.size
      likes.add(`${first} ${second}`)

      return { results: [], changes: likes.size - before }
    }

    if (sql.startsWith('DELETE FROM likes')) return { results: [], changes: likes.delete(`${first} ${second}`) ? 1 : 0 }

    if (sql.startsWith('INSERT INTO post_stats')) {
      const count = [...likes].filter(key => key.startsWith(`${first} `)).length
      stats.set(String(first), count)

      return { results: [{ likes: count }], changes: 1 }
    }

    if (sql.startsWith('INSERT INTO comments')) {
      const id = comments.length + 1
      comments.push({ id, slug: String(first), name: String(second), body: String(third), createdAt: Number(fourth), hidden: 0 })

      return { results: [{ id }], changes: 1 }
    }

    throw new Error(`unexpected SQL: ${sql}`)
  }

  const prepare = (sql: string) => {
    const statement = (values: (string | number)[]) => ({
      bind: (...next: (string | number)[]) => statement(next),
      all: async () => {
        const { results, changes } = execute(sql, values)

        return { results, meta: { changes } }
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

  return { ...session, withSession: () => session, comments, queries: () => queries }
}

function makeEnv(limits: Partial<Record<'PER_CLIENT_LIKES' | 'PER_CLIENT_COMMENTS' | 'ALL_CLIENTS_COMMENTS' | 'ALL_WRITES' | 'PER_CLIENT_COLLECT' | 'ALL_COLLECT', boolean>> = {}) {
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
    ALL_WRITES: limit(limits.ALL_WRITES),
    PER_CLIENT_COLLECT: limit(limits.PER_CLIENT_COLLECT),
    ALL_COLLECT: limit(limits.ALL_COLLECT),
    TURNSTILE_SECRET: 'secret',
    ALLOWED_HOSTNAME: '1saif.me',
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

function stubTurnstile(result: { success: boolean; hostname?: string; action?: string }) {
  vi.stubGlobal('fetch', async () => Response.json(result))
}

const visitor = '2f1c7c1e-8a4b-4c1d-9e2f-3a4b5c6d7e8f'

function send(method: string, path: string, body: string, headers: Record<string, string> = {}) {
  return new Request(`https://1saif.me${path}`, {
    method,
    body,
    headers: { Origin: 'https://1saif.me', 'Content-Length': String(new TextEncoder().encode(body).length), ...headers },
  })
}

const likeRequest = (method: 'PUT' | 'DELETE', body: { visitor: string; language?: string } = { visitor, language: 'ar' }) => send(method, `/api/posts/${slug}/like`, JSON.stringify(body))

const goodFields = { name: 'Ali', message: 'Nice post.\r\nThanks', language: 'ar', 'cf-turnstile-response': 'token' }

const commentRequest = (fields: Record<string, string>, headers: Record<string, string> = {}) =>
  send('POST', `/api/posts/${slug}/comments`, new URLSearchParams(fields).toString(), { 'Content-Type': 'application/x-www-form-urlencoded', ...headers })

const read = async (env: Env) => {
  const response = await worker.fetch(new Request(`https://1saif.me/api/posts/${slug}`), env, ctx)

  await Promise.all(pending)

  return response
}

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

    expect((await worker.fetch(new Request('https://1saif.me/api/posts/not-a-post'), env, ctx)).status).toBe(404)
    expect((await worker.fetch(send('PUT', '/api/posts/not-a-post/like', JSON.stringify({ visitor })), env, ctx)).status).toBe(404)
  })

  it('serves a repeat read from the edge cache without touching D1', async () => {
    const { env, db } = makeEnv()
    const first = await read(env)

    expect(first.headers.get('Cache-Control')).toBe('public, max-age=30')
    expect(await first.json()).toEqual({ likes: 0, comments: [] })
    const queries = db.queries()

    expect(await (await read(env)).json()).toEqual({ likes: 0, comments: [] })
    expect(db.queries()).toBe(queries)
  })

  it('shows a new like on the next read, because a write clears the cached reply', async () => {
    const { env } = makeEnv()

    await read(env)
    await worker.fetch(likeRequest('PUT'), env, ctx)
    expect(await (await read(env)).json()).toEqual({ likes: 1, comments: [] })
  })

  it('leaves hidden comments out', async () => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'comment' })
    const { env, db } = makeEnv()

    await worker.fetch(commentRequest(goodFields), env, ctx)
    await worker.fetch(commentRequest({ ...goodFields, name: 'Spammer' }), env, ctx)
    db.comments[1].hidden = 1
    await caches.default.delete(new Request(`https://1saif.me/api/posts/${slug}`))

    const { comments } = await (await read(env)).json()

    expect(comments).toEqual([{ id: 1, name: 'Ali', body: 'Nice post.\nThanks', createdAt: expect.any(Number) }])
  })
})

describe('reactions worker: likes', () => {
  it('counts a repeated like once and tracks it once', async () => {
    const { env } = makeEnv()

    expect(await (await worker.fetch(likeRequest('PUT'), env, ctx)).json()).toEqual({ likes: 1 })
    expect(await (await worker.fetch(likeRequest('PUT'), env, ctx)).json()).toEqual({ likes: 1 })
    expect(await (await worker.fetch(likeRequest('PUT', { visitor: visitor.replace('2f', '3f') }), env, ctx)).json()).toEqual({ likes: 2 })
    expect(points.map(point => point.blobs)).toEqual([['like', '', 'ar'], ['like', '', 'en']])
    expect(points[0].indexes).toEqual([slug])
  })

  it('removes a like and recounts', async () => {
    const { env } = makeEnv()

    await worker.fetch(likeRequest('PUT'), env, ctx)
    const response = await worker.fetch(likeRequest('DELETE'), env, ctx)

    expect(await response.json()).toEqual({ likes: 0 })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(points.map(point => point.blobs[0])).toEqual(['like', 'unlike'])
  })

  it.each([
    ['a visitor that is not a UUID', likeRequest('PUT', { visitor: 'me' }), 400],
    ['a body that is not JSON', send('PUT', `/api/posts/${slug}/like`, 'visitor'), 400],
    ['another origin', send('PUT', `/api/posts/${slug}/like`, JSON.stringify({ visitor }), { Origin: 'https://evil.example' }), 403],
    ['a POST', send('POST', `/api/posts/${slug}/like`, JSON.stringify({ visitor })), 405],
    ['a body without a length', send('PUT', `/api/posts/${slug}/like`, JSON.stringify({ visitor }), { 'Content-Length': '' }), 413],
  ])('refuses %s before any write', async (_, request, status) => {
    const { env, db } = makeEnv()

    expect((await worker.fetch(request, env, ctx)).status).toBe(status)
    expect(db.queries()).toBe(0)
  })

  it.each(['PER_CLIENT_LIKES', 'ALL_WRITES'] as const)('refuses a like over %s before D1', async binding => {
    const { env, db } = makeEnv({ [binding]: false })

    expect((await worker.fetch(likeRequest('PUT'), env, ctx)).status).toBe(429)
    expect(db.queries()).toBe(0)
  })

  it('still answers when the analytics binding is missing', async () => {
    const { env } = makeEnv()

    expect((await worker.fetch(likeRequest('PUT'), { ...env, EVENTS: undefined }, ctx)).status).toBe(200)
  })
})

describe('reactions worker: comments', () => {
  it('saves a valid comment, returns it and mails the hide command', async () => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'comment' })
    const { env } = makeEnv()
    const response = await worker.fetch(commentRequest(goodFields), env, ctx)

    await Promise.all(pending)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ id: 1, name: 'Ali', body: 'Nice post.\nThanks', createdAt: expect.any(Number) })
    expect(sent).toHaveLength(1)
    expect(sent[0].text).toContain('npx wrangler d1 execute 1saif-reactions --remote --command "UPDATE comments SET hidden = 1 WHERE id = 1"')
    expect(points.map(point => point.blobs)).toEqual([['comment', '', 'ar']])
  })

  it('keeps the comment when the email fails', async () => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'comment' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { env, db } = makeEnv()

    env.EMAIL.send = async () => {
      throw Object.assign(new Error('Ali'), { code: 'E_SEND' })
    }

    expect((await worker.fetch(commentRequest(goodFields), env, ctx)).status).toBe(201)
    await Promise.all(pending)
    expect(db.comments).toHaveLength(1)
  })

  it('answers bots that fill the hidden field with success and saves nothing', async () => {
    const { env, db } = makeEnv()

    expect((await worker.fetch(commentRequest({ ...goodFields, leave_empty: 'spam' }), env, ctx)).status).toBe(201)
    expect(db.comments).toHaveLength(0)
    expect(points[0].blobs).toEqual(['comment_rejected', '', 'ar', 'honeypot'])
  })

  it.each([
    ['an empty name', { name: '' }],
    ['a name with a line break', { name: 'Ali\nBcc' }],
    ['a name over 60 characters', { name: 'x'.repeat(61) }],
    ['an empty message', { message: ' ' }],
    ['a message over 2,000 characters', { message: 'x'.repeat(2_001) }],
  ])('refuses %s', async (_, override) => {
    const { env, db } = makeEnv()

    expect((await worker.fetch(commentRequest({ ...goodFields, ...override }), env, ctx)).status).toBe(400)
    expect(db.comments).toHaveLength(0)
    expect(points[0].blobs.at(-1)).toBe('invalid')
  })

  it('accepts a 2,000-character Arabic message', async () => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'comment' })
    const { env } = makeEnv()

    expect((await worker.fetch(commentRequest({ ...goodFields, message: 'ع'.repeat(2_000) }), env, ctx)).status).toBe(201)
  })

  it.each([
    ['a failed challenge', { success: false }],
    ['a token from another site', { success: true, hostname: 'evil.example', action: 'comment' }],
    ['a token from another form', { success: true, hostname: '1saif.me', action: 'contact' }],
    ['a test token in production', { success: true, hostname: '1saif.me', action: 'test' }],
  ])('refuses %s', async (_, result) => {
    stubTurnstile(result)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { env, db } = makeEnv()

    expect((await worker.fetch(commentRequest(goodFields), env, ctx)).status).toBe(400)
    expect(db.comments).toHaveLength(0)
    expect(points[0].blobs.at(-1)).toBe('turnstile')
  })

  it('accepts the test secret reply when wrangler dev runs on localhost', async () => {
    stubTurnstile({ success: true, hostname: 'example.com' })
    const { env } = makeEnv()

    expect((await worker.fetch(commentRequest(goodFields), { ...env, ALLOWED_HOSTNAME: 'localhost' }, ctx)).status).toBe(201)
  })

  it('fails closed when siteverify cannot be reached', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('network down')
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { env } = makeEnv()

    expect((await worker.fetch(commentRequest(goodFields), env, ctx)).status).toBe(400)
  })

  it.each(['PER_CLIENT_COMMENTS', 'ALL_CLIENTS_COMMENTS', 'ALL_WRITES'] as const)('refuses a comment over %s', async binding => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'comment' })
    const { env, db } = makeEnv({ [binding]: false })

    expect((await worker.fetch(commentRequest(goodFields), env, ctx)).status).toBe(429)
    expect(db.comments).toHaveLength(0)
    expect(points[0].blobs.at(-1)).toBe('rate')
  })

  it('refuses a JSON body', async () => {
    const { env } = makeEnv()

    expect((await worker.fetch(commentRequest(goodFields, { 'Content-Type': 'application/json' }), env, ctx)).status).toBe(415)
  })
})

describe('reactions worker: page views', () => {
  const beacon = { path: '/ar/blog/x/', ref: 'https://www.google.com/search?q=saif', lang: 'ar', w: 390, lcp: 1200, cls: 0, inp: -1, ttfb: 80 }

  const collect = (body: Partial<typeof beacon>, headers: Record<string, string> = {}) => send('POST', '/api/collect', JSON.stringify(body), { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'Mozilla/5.0', ...headers })

  it('writes one data point with the referrer host only', async () => {
    const { env } = makeEnv()
    const response = await worker.fetch(collect(beacon), env, ctx)

    expect(response.status).toBe(204)
    expect(points).toEqual([{ indexes: ['/blog/x'], blobs: ['pageview', '/ar/blog/x/', 'www.google.com', 'ar', '', 'mobile'], doubles: [1, 1200, 0, -1, 80] }])
  })

  it('keeps an inside referrer empty', async () => {
    const { env } = makeEnv()

    await worker.fetch(collect({ ...beacon, path: '/', ref: 'https://1saif.me/blog', w: 1440 }), env, ctx)
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
    ['a path with a query', collect({ ...beacon, path: '/blog?q=1' })],
    ['a path with a hash', collect({ ...beacon, path: '/blog#top' })],
    ['another host', collect({ ...beacon, path: '//evil.example/x' })],
    ['a path over 200 characters', collect({ ...beacon, path: `/${'x'.repeat(200)}` })],
    ['a body that is not JSON', send('POST', '/api/collect', 'hello')],
  ])('drops %s with 204', async (_, request) => {
    const { env } = makeEnv()

    expect((await worker.fetch(request, env, ctx)).status).toBe(204)
    expect(points).toHaveLength(0)
  })

  it.each(['PER_CLIENT_COLLECT', 'ALL_COLLECT'] as const)('drops a view over %s', async binding => {
    const { env } = makeEnv({ [binding]: false })

    expect((await worker.fetch(collect(beacon), env, ctx)).status).toBe(204)
    expect(points).toHaveLength(0)
  })
})
