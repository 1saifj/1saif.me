import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { Language } from '../i18n/language'

// Public site key of the 1saif-contact Turnstile widget (hostname 1saif.me).
const TURNSTILE_SITE_KEY = '0x4AAAAAAFbfd5bsGhJ9I7uT'

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const TOKEN_WAIT_MS = 20_000

interface TurnstileOptions {
  sitekey: string
  action: string
  language: string
  theme: 'light' | 'dark'
  size: 'flexible'
  appearance: 'interaction-only'
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
  'timeout-callback': () => void
}

interface Turnstile {
  render(container: HTMLElement, options: TurnstileOptions): string
  reset(widgetId: string): void
}

declare global {
  interface Window { turnstile?: Turnstile }
}

const copy = {
  en: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send message',
    sending: 'Sending…',
    note: 'I usually reply within a few days.',
    sent: 'Thanks. Your message was sent, and I will reply by email.',
    rate: 'Too many messages were sent. Wait a minute, then try again.',
    challenge: 'The spam check did not pass. Try again.',
    failed: 'The message was not sent. Try again, or email me directly.',
  },
  ar: {
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    message: 'الرسالة',
    send: 'إرسال الرسالة',
    sending: 'جارٍ الإرسال…',
    note: 'أرد عادةً خلال أيام قليلة.',
    sent: 'شكراً. أُرسلت رسالتك، وسأرد عليك عبر البريد الإلكتروني.',
    rate: 'أُرسل عدد كبير من الرسائل. انتظر دقيقة ثم حاول مرة أخرى.',
    challenge: 'لم ينجح التحقق من البريد المزعج. حاول مرة أخرى.',
    failed: 'لم تُرسل الرسالة. حاول مرة أخرى، أو راسلني مباشرة عبر البريد الإلكتروني.',
  },
}

type Status = 'idle' | 'sending' | 'sent' | 'rate' | 'challenge' | 'failed'

let turnstileScript: Promise<void> | undefined

function loadTurnstile(): Promise<void> {
  turnstileScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => { turnstileScript = undefined; reject(new Error('Turnstile did not load')) }

    document.head.append(script)
  })

  return turnstileScript
}

export const ContactForm: React.FC<{ language: Language }> = ({ language }) => {
  const t = copy[language]
  const formRef = useRef<HTMLFormElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string>()
  const token = useRef<string>()
  const tokenWaiters = useRef<((token: string | undefined) => void)[]>([])
  // Set when the widget reports an error, so a submit does not wait 20 s for a token that will not come.
  const challengeFailed = useRef(false)
  const [status, setStatus] = useState<Status>('idle')

  // Every waiter gets the same answer: the token, or nothing when the challenge fails.
  function settleToken(value: string | undefined) {
    token.current = value
    tokenWaiters.current.splice(0).forEach(resolve => resolve(value))
  }

  function failTurnstile() {
    challengeFailed.current = true
    settleToken(undefined)
  }

  // The challenge takes seconds, so it starts as soon as the visitor heads for the form.
  function startTurnstile(): Promise<boolean> {
    const container = widgetRef.current

    if (!container) return Promise.resolve(false)

    if (widgetId.current) return Promise.resolve(true)

    return loadTurnstile()
      .then(() => {
        if (!window.turnstile) return false

        if (!widgetId.current) {
          widgetId.current = window.turnstile.render(container, {
            sitekey: TURNSTILE_SITE_KEY,
            action: 'contact',
            language,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            size: 'flexible',
            appearance: 'interaction-only',
            callback: value => {
              challengeFailed.current = false
              settleToken(value)
            },
            'expired-callback': () => { token.current = undefined },
            'error-callback': failTurnstile,
            'timeout-callback': failTurnstile,
          })
        }

        return true
      })
      .catch(() => false)
  }

  function resetTurnstile() {
    token.current = undefined
    challengeFailed.current = false

    if (widgetId.current) window.turnstile?.reset(widgetId.current)
  }

  function waitForToken(): Promise<string | undefined> {
    return new Promise<string | undefined>(resolve => {
      if (token.current) {
        resolve(token.current)

        return
      }

      if (challengeFailed.current) {
        resolve(undefined)

        return
      }

      const finish = (value: string | undefined) => {
        clearTimeout(timer)
        tokenWaiters.current = tokenWaiters.current.filter(item => item !== finish)
        resolve(value)
      }

      const timer = setTimeout(() => finish(undefined), TOKEN_WAIT_MS)
      tokenWaiters.current.push(finish)

      // A script that cannot load must fail the attempt now, not leave the button waiting for 20 s.
      void startTurnstile().then(ready => {
        if (!ready) finish(undefined)
      })
    })
  }

  // The third-party script loads only near the form: about two screens away, or on the first focus inside it.
  useEffect(() => {
    const form = formRef.current

    if (!form) return

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      void startTurnstile()
    }, { rootMargin: '200% 0px' })

    observer.observe(form)

    return () => observer.disconnect()
  // startTurnstile reads only refs, the language and the site theme.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const body = new URLSearchParams([...new FormData(form)].map(([key, value]) => [key, String(value)]))
    setStatus('sending')

    // A visitor can finish the form before the challenge does; wait for it instead of failing.
    const value = await waitForToken()

    if (!value) {
      // A failed or expired challenge needs a fresh widget before the next attempt.
      resetTurnstile()
      setStatus('challenge')

      return
    }

    body.set('cf-turnstile-response', value)

    try {
      const response = await fetch('/api/contact', { method: 'POST', body })
      const result: { error?: string } = await response.json()

      if (response.ok) form.reset()
      setStatus(response.ok ? 'sent' : result.error === 'rate' || result.error === 'challenge' ? result.error : 'failed')
    } catch {
      setStatus('failed')
    } finally {
      // Each token works once, so every attempt needs a new one.
      resetTurnstile()
    }
  }

  const message = status === 'idle' || status === 'sending' ? t.note : t[status]
  const tone = status === 'sent' ? 'ok' : status === 'idle' || status === 'sending' ? undefined : 'error'

  return (
    <form ref={formRef} className="contact-form" onSubmit={submit} onFocus={startTurnstile}>
      <div className="contact-form-row">
        <label className="contact-field"><span>{t.name}</span><input name="name" autoComplete="name" required maxLength={100} /></label>
        <label className="contact-field"><span>{t.email}</span><input name="email" type="email" autoComplete="email" dir="ltr" required maxLength={254} /></label>
      </div>
      <label className="contact-field"><span>{t.message}</span><textarea name="message" rows={5} required maxLength={5000} /></label>
      {/* Hidden from people; bots that fill it are dropped by the Worker. The name is one no autofill matches. */}
      <div className="contact-form-trap" aria-hidden="true">
        <input name="leave_empty" tabIndex={-1} autoComplete="off" />
      </div>
      <div ref={widgetRef} className="contact-form-challenge" />
      <div className="contact-form-footer">
        <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? t.sending : t.send}</button>
        <p className="contact-form-status" role="status" data-tone={tone}>{message}</p>
      </div>
    </form>
  )
}
