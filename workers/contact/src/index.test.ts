// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import worker, { Env } from './index'

const sent: unknown[] = []

function makeEnv(perClient = true, allClients = true): Env {
  return {
    EMAIL: {
      send: async message => {
        sent.push(message)

        return { messageId: 'id' }
      },
    },
    PER_CLIENT: { limit: async () => ({ success: perClient }) },
    ALL_CLIENTS: { limit: async () => ({ success: allClients }) },
    TURNSTILE_SECRET: 'secret',
  }
}

function stubTurnstile(result: { success: boolean; hostname?: string; action?: string }) {
  vi.stubGlobal('fetch', async () => Response.json(result))
}

const goodFields = { name: 'Ali', email: 'ali@example.com', message: 'Hello', 'cf-turnstile-response': 'token' }

function post(fields: Record<string, string>, headers: Record<string, string> = {}) {
  const body = new URLSearchParams(fields).toString()

  return new Request('https://1saif.me/api/contact', {
    method: 'POST',
    body,
    headers: { Origin: 'https://1saif.me', 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': String(body.length), ...headers },
  })
}

afterEach(() => {
  sent.length = 0
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('contact worker', () => {
  it('sends a valid message with the visitor as reply-to', async () => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'contact' })
    const response = await worker.fetch(post(goodFields), makeEnv())

    expect(response.status).toBe(200)
    expect(sent).toEqual([expect.objectContaining({ from: { email: 'hello@1saif.me', name: '1saif.me contact form' }, replyTo: { email: 'ali@example.com', name: 'Ali' } })])
  })

  it('sends a 5,000-character Arabic message', async () => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'contact' })
    const response = await worker.fetch(post({ ...goodFields, name: 'علي', message: 'ع'.repeat(5_000) }), makeEnv())

    expect(response.status).toBe(200)
    expect(sent).toHaveLength(1)
  })

  it.each([
    ['a GET request', new Request('https://1saif.me/api/contact'), 405],
    ['another origin', post(goodFields, { Origin: 'https://evil.example' }), 403],
    ['a JSON body', post(goodFields, { 'Content-Type': 'application/json' }), 415],
    ['a body without a length', post(goodFields, { 'Content-Length': '' }), 413],
    ['a body over 64 KiB', post(goodFields, { 'Content-Length': '70000' }), 413],
  ])('refuses %s before any send', async (_, request, status) => {
    expect((await worker.fetch(request, makeEnv())).status).toBe(status)
    expect(sent).toHaveLength(0)
  })

  it('refuses a client over its rate limit', async () => {
    expect((await worker.fetch(post(goodFields), makeEnv(false))).status).toBe(429)
  })

  it('refuses verified visitors once the shared budget is spent', async () => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'contact' })
    expect((await worker.fetch(post(goodFields), makeEnv(true, false))).status).toBe(429)
    expect(sent).toHaveLength(0)
  })

  it('answers bots that fill the hidden field with success and sends nothing', async () => {
    expect((await worker.fetch(post({ ...goodFields, leave_empty: 'spam' }), makeEnv())).status).toBe(200)
    expect(sent).toHaveLength(0)
  })

  it.each([
    ['an empty name', { name: '' }],
    ['a name with a line break', { name: 'Ali\nBcc: x@y.z' }],
    ['a bad email', { email: 'not-an-email' }],
    ['a message over 5,000 characters', { message: 'x'.repeat(5_001) }],
  ])('refuses %s', async (_, override) => {
    expect((await worker.fetch(post({ ...goodFields, ...override }), makeEnv())).status).toBe(400)
  })

  it.each([
    ['a failed challenge', { success: false }],
    ['a token from another site', { success: true, hostname: 'evil.example', action: 'contact' }],
    ['a token from another form', { success: true, hostname: '1saif.me', action: 'login' }],
  ])('refuses %s', async (_, result) => {
    stubTurnstile(result)
    expect((await worker.fetch(post(goodFields), makeEnv())).status).toBe(400)
    expect(sent).toHaveLength(0)
  })

  it('fails closed when siteverify cannot be reached', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('network down')
    })

    expect((await worker.fetch(post(goodFields), makeEnv())).status).toBe(400)
    expect(sent).toHaveLength(0)
  })

  it('logs the error code but no visitor data when the send fails', async () => {
    stubTurnstile({ success: true, hostname: '1saif.me', action: 'contact' })
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const env = makeEnv()

    env.EMAIL.send = async () => {
      throw Object.assign(new Error('Contact form: Ali ali@example.com Hello'), { code: 'E_SEND' })
    }

    expect((await worker.fetch(post(goodFields), env)).status).toBe(502)
    expect(logged.mock.calls).toEqual([['send failed', 'E_SEND']])
  })
})
