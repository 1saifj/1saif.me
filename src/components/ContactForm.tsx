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
  theme: 'auto'
  size: 'flexible'
  appearance: 'interaction-only'
  callback: (token: string) => void
  'expired-callback': () => void
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
  const [status, setStatus] = useState<Status>('idle')

  // The challenge takes seconds, so it starts as soon as the visitor heads for the form.
  function startTurnstile() {
    const container = widgetRef.current

    if (!container || widgetId.current) return

    loadTurnstile()
      .then(() => {
        if (!window.turnstile || widgetId.current) return

        widgetId.current = window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          action: 'contact',
          language,
          theme: 'auto',
          size: 'flexible',
          appearance: 'interaction-only',
          callback: value => {
            token.current = value
            tokenWaiters.current.splice(0).forEach(resolve => resolve(value))
          },
          'expired-callback': () => { token.current = undefined },
        })
      })
      .catch(() => setStatus('challenge'))
  }

  function waitForToken(): Promise<string | undefined> {
    startTurnstile()

    if (token.current) return Promise.resolve(token.current)

    return new Promise(resolve => {
      tokenWaiters.current.push(resolve)
      setTimeout(() => resolve(undefined), TOKEN_WAIT_MS)
    })
  }

  // The third-party script loads only near the form: about two screens away, or on the first focus inside it.
  useEffect(() => {
    const form = formRef.current

    if (!form) return

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      startTurnstile()
    }, { rootMargin: '200% 0px' })

    observer.observe(form)

    return () => observer.disconnect()
  // startTurnstile reads only refs and the language.
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
      token.current = undefined

      if (widgetId.current) window.turnstile?.reset(widgetId.current)
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
