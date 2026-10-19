// Receives the home page contact form and emails it to Saif. Cheap checks run first, so
// junk traffic is dropped before it costs a Turnstile call or an email.

interface ContactEmail {
  to: string
  from: { email: string; name: string }
  replyTo: { email: string; name: string }
  subject: string
  text: string
}

interface SendEmail {
  send(message: ContactEmail): Promise<{ messageId: string }>
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

export interface Env {
  EMAIL: SendEmail
  PER_CLIENT: RateLimit
  ALL_CLIENTS: RateLimit
  TURNSTILE_SECRET: string
}

const SITE_ORIGIN = 'https://1saif.me'

// URL-encoding makes one Arabic letter 6 bytes, so 5,000 characters need about 45 KB.
const MAX_BODY_BYTES = 65_536

const MAX_NAME = 100

const MAX_EMAIL = 254

const MAX_MESSAGE = 5_000

const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/

// Control characters, except tab and line breaks, which a message may hold.
// eslint-disable-next-line no-control-regex -- matching control characters is the point.
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/

const LINE_BREAK = /[\r\n]/

const reply = (status: number, error?: string) => Response.json(error ? { error } : { ok: true }, { status, headers: { 'Cache-Control': 'no-store' } })

async function passesTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    // A pasted secret can carry a trailing space or line break.
    body: new URLSearchParams({ secret: secret.trim(), response: token, remoteip: ip }),
    signal: AbortSignal.timeout(5_000),
  })

  // SAFETY: the shape is Cloudflare's documented siteverify response, also on its 400 replies; every field read is checked below.
  const result = await response.json().catch(() => ({ success: false })) as TurnstileResult

  // A token minted for another site or another form must not pass here.
  const passed = result.success === true && result.hostname === '1saif.me' && result.action === 'contact'

  if (!passed) console.warn('turnstile failed', response.status, result['error-codes'], result.hostname, result.action)

  return passed
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') return reply(405, 'method')

    if (request.headers.get('Origin') !== SITE_ORIGIN) return reply(403, 'origin')

    if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) return reply(415, 'type')

    // A missing length means a chunked body of any size, so it is refused before it is read.
    const length = Number(request.headers.get('Content-Length'))

    if (!length || length > MAX_BODY_BYTES) return reply(413, 'size')

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'

    if (!(await env.PER_CLIENT.limit({ key: ip })).success) return reply(429, 'rate')

    const body = await request.text()

    if (body.length > MAX_BODY_BYTES) return reply(413, 'size')

    const form = new URLSearchParams(body)
    const field = (key: string) => (form.get(key) ?? '').trim()

    // Bots fill the hidden field. They get a success reply so they do not adapt.
    if (field('leave_empty')) return reply(200)

    const name = field('name')
    const email = field('email')
    const message = field('message')
    const validName = name.length > 0 && name.length <= MAX_NAME && !CONTROL_CHARACTERS.test(name) && !LINE_BREAK.test(name)
    const validEmail = email.length <= MAX_EMAIL && EMAIL_PATTERN.test(email)
    const validMessage = message.length > 0 && message.length <= MAX_MESSAGE && !CONTROL_CHARACTERS.test(message)

    if (!validName || !validEmail || !validMessage) return reply(400, 'invalid')

    const token = field('cf-turnstile-response')

    if (!token || token.length > 2048) return reply(400, 'challenge')

    if (!(await passesTurnstile(token, ip, env.TURNSTILE_SECRET))) return reply(400, 'challenge')

    // Counted only for verified visitors, so bots cannot use up the budget and block real people.
    if (!(await env.ALL_CLIENTS.limit({ key: 'all' })).success) return reply(429, 'rate')

    try {
      await env.EMAIL.send({
        // The runtime requires a recipient; the binding allows only this one.
        to: 'saifalialjanahi@gmail.com',
        from: { email: 'hello@1saif.me', name: '1saif.me contact form' },
        replyTo: { email, name },
        subject: `Contact form: ${name}`,
        text: `${message}\n\n--\n${name} <${email}>`,
      })
    } catch (error) {
      // Log the code only: the message is personal data.
      console.error('send failed', error instanceof Error && 'code' in error ? error.code : 'no code', String(error).slice(0, 300))

      return reply(502, 'send')
    }

    return reply(200)
  },
}
