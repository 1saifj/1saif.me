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
  hidden: number
}

interface StoredUser {
  login: string
  name: string | null
  blocked: number
}

// A fake D1 that answers the Worker's own statements from memory, so the tests run on any Node version.
function makeDb() {
  const likes = new Set<string>()
  const stats = new Map<string, number>()
  const comments: StoredComment[] = []
  const users = new Map<number, StoredUser>()
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
        results: visible.map(({ id, body, createdAt, userId }) => ({ id, body, createdAt, userId, login: users.get(userId)?.login, name: users.get(userId)?.name })),
        changes: 0,
      }
    }

    if (sql.startsWith('SELECT COUNT(*) AS liked')) return { results: [{ liked: likes.has(`${first} ${second}`) ? 1 : 0 }], changes: 0 }

    // INSERT ... SELECT FROM users WHERE github_id = ? AND blocked = 0. The likes_insert and likes_delete
    // triggers (migrations/0004) move the count with each change.
    if (sql.startsWith('INSERT OR IGNORE INTO likes')) {
      if (users.get(Number(third))?.blocked !== 0) return { results: [], changes: 0 }

      const before = likes.size
      likes.add(`${first} ${third}`)
      const changes = likes.size - before

      stats.set(String(first), (stats.get(String(first)) ?? 0) + changes)

      return { results: [], changes }
    }

    if (sql.startsWith('DELETE FROM likes')) {
      const changes = likes.delete(`${first} ${second}`) ? 1 : 0

      if (changes) stats.set(String(first), Math.max(0, (stats.get(String(first)) ?? 0) - 1))

      return { results: [], changes }
    }

    if (sql.startsWith('INSERT INTO users')) {
      users.set(Number(first), { login: String(second), name: third === null ? null : String(third), blocked: users.get(Number(first))?.blocked ?? 0 })

      return { results: [], changes: 1 }
    }

    // INSERT ... SELECT FROM users WHERE github_id = ? AND blocked = 0: no row for a missing or blocked user.
    if (sql.startsWith('INSERT INTO comments')) {
      if (users.get(Number(fourth))?.blocked !== 0) return { results: [], changes: 0 }

      const id = comments.length + 1
      comments.push({ id, slug: String(first), userId: Number(fourth), body: String(second), createdAt: Number(third), hidden: 0 })

      return { results: [{ id }], changes: 1 }
    }

    if (sql.startsWith('DELETE FROM comments')) {
      const index = comments.findIndex(item => item.id === first && item.slug === second && item.userId === third)

      if (index === -1) return { results: [], changes: 0 }

      comments.splice(index, 1)

      return { results: [], changes: 1 }
    }

    throw new Error(`unexpected SQL: ${sql}`)
  }

  const prepare = (sql: string) => {
    const statement = (values: (string | number | null)[]) => ({
      bind: (...next: (string | number | null)[]) => statement(next),
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

  return { ...session, withSession: () => session, comments, likes, users, queries: () => queries }
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

    expect((await worker.fetch(new Request('https://1saif.me/api/posts/not-a-post'), env, ctx)).status).toBe(404)
    expect((await worker.fetch(send('PUT', '/api/posts/not-a-post/like', '{}'), env, ctx)).status).toBe(404)
    expect((await worker.fetch(send('DELETE', `/api/posts/${slug}/like/3`, ''), env, ctx)).status).toBe(404)
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

  it('shows a new like on the next read, because a write clears the cached reply', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    await read(env)
    await worker.fetch(likeRequest(header), env, ctx)
    expect(await (await read(env)).json()).toEqual({ likes: 1, comments: [] })
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

    expect(comments).toEqual([{ id: 1, body: 'Nice post.\nThanks', createdAt: expect.any(Number), author: octocat }])
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
    expect([...db.likes]).toEqual([`${slug} 7`])
    expect(points.map(point => point.blobs[0])).toEqual(['like', 'like', 'unlike'])
  })

  it('tells the signed-in viewer whether they like the post, apart from the shared cached reply', async () => {
    const { env } = makeEnv()
    const { header } = await signIn(env)

    await read(env)
    expect(await (await likeState(env, header)).json()).toEqual({ liked: false })
    await worker.fetch(likeRequest(header), env, ctx)

    const response = await likeState(env, header)

    expect(await response.json()).toEqual({ liked: true })
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

  it('keeps a missing GitHub name empty and strips control characters from a name', async () => {
    const { env, db } = makeEnv()

    await signIn(env, { id: 1, login: 'a-b', name: null })
    await signIn(env, { id: 2, login: 'c', name: 'Eve\r\nBcc: x' })
    expect(db.users.get(1)?.name).toBeNull()
    expect(db.users.get(2)?.name).toBe('Eve  Bcc: x')
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
    const { location, flow } = await startSignIn(env, back)

    stubGitHub()
    const response = await worker.fetch(callback(`code=abc&state=${location.searchParams.get('state')}`, flow), env, ctx)

    expect(response.headers.get('Location')).toBe('/blog#comments-title')
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
    expect(await response.json()).toEqual({ id: 1, body: 'Nice post.\nThanks', createdAt: expect.any(Number), author: octocat })
    expect(sent).toHaveLength(1)
    expect(sent[0].text).toContain('The Octocat (https://github.com/octocat) wrote on')
    expect(sent[0].text).toContain('--command "UPDATE comments SET hidden = 1 WHERE id = 1"')
    expect(sent[0].text).toContain('--command "UPDATE users SET blocked = 1 WHERE github_id = 42"')
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
    expect(points.at(-1)?.blobs.at(-1)).toBe('rate')
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
    expect(db.comments).toHaveLength(0)
    expect((await (await read(env)).json()).comments).toEqual([])
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
