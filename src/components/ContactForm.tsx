import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { Language } from '../i18n/language'
import { ContactErrors, ContactField, firstInvalidField, validateContact, validateField } from '../utils/contactValidation'

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
  'refresh-expired': 'auto'
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
    checking: 'Checking…',
    checkingNote: 'Waiting for the spam check to finish.',
    sending: 'Sending…',
    note: 'I usually reply within a few days.',
    sent: 'Thanks. Your message was sent, and I will reply by email.',
    sentTitle: 'Message sent',
    sendAnother: 'Send another message',
    rate: 'Too many messages were sent. Wait a minute, then try again.',
    challenge: 'The spam check did not pass. Try again.',
    failed: 'The message was not sent. Try again, or email me directly.',
    errors: {
      nameRequired: 'Enter your name.',
      nameLong: 'Keep the name to 100 characters or fewer.',
      nameLine: 'Use one line without control characters.',
      emailRequired: 'Enter your email address.',
      emailLong: 'Keep the email to 254 characters or fewer.',
      emailInvalid: 'Use an address like name@example.com.',
      messageRequired: 'Write a message.',
      messageLong: 'Keep the message to 5,000 characters or fewer.',
      messageControl: 'Remove control characters from the message.',
    },
  },
  ar: {
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    message: 'الرسالة',
    send: 'إرسال الرسالة',
    checking: 'جارٍ التحقق…',
    checkingNote: 'بانتظار انتهاء التحقق من البريد المزعج.',
    sending: 'جارٍ الإرسال…',
    note: 'أرد عادةً خلال أيام قليلة.',
    sent: 'شكراً. أُرسلت رسالتك، وسأرد عليك عبر البريد الإلكتروني.',
    sentTitle: 'أُرسلت الرسالة',
    sendAnother: 'إرسال رسالة أخرى',
    rate: 'أُرسل عدد كبير من الرسائل. انتظر دقيقة ثم حاول مرة أخرى.',
    challenge: 'لم ينجح التحقق من البريد المزعج. حاول مرة أخرى.',
    failed: 'لم تُرسل الرسالة. حاول مرة أخرى، أو راسلني مباشرة عبر البريد الإلكتروني.',
    errors: {
      nameRequired: 'أدخل اسمك.',
      nameLong: 'اجعل الاسم 100 حرف أو أقل.',
      nameLine: 'استخدم سطراً واحداً دون محارف تحكّم.',
      emailRequired: 'أدخل بريدك الإلكتروني.',
      emailLong: 'اجعل البريد 254 حرفاً أو أقل.',
      emailInvalid: 'استخدم عنواناً مثل name@example.com.',
      messageRequired: 'اكتب رسالة.',
      messageLong: 'اجعل الرسالة 5000 حرف أو أقل.',
      messageControl: 'أزل محارف التحكّم من الرسالة.',
    },
  },
}

type Status = 'idle' | 'checking' | 'sending' | 'sent' | 'rate' | 'challenge' | 'failed'

let turnstileScript: Promise<void> | undefined

export function loadTurnstile(): Promise<void> {
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

function fieldControl(form: HTMLFormElement, field: ContactField): HTMLInputElement | HTMLTextAreaElement | null {
  const control = form.elements.namedItem(field)

  return control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement ? control : null
}

export const ContactForm: React.FC<{ language: Language }> = ({ language }) => {
  const t = copy[language]
  const formRef = useRef<HTMLFormElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const sentRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string>()
  // The one in-flight or finished start, so the idle, observer and focus paths never render a second widget.
  const startPromise = useRef<Promise<boolean>>()
  const token = useRef<string>()
  const tokenWaiters = useRef<((token: string | undefined) => void)[]>([])
  // Set when the widget reports an error, so a submit does not wait 20 s for a token that will not come.
  const challengeFailed = useRef(false)
  // The name field is not mounted while the confirmation shows, so it gets focus after the form returns.
  const focusName = useRef(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<ContactErrors>({})
  const [attempted, setAttempted] = useState(false)

  // Every waiter gets the same answer: the token, or nothing when the challenge fails.
  function settleToken(value: string | undefined) {
    token.current = value
    tokenWaiters.current.splice(0).forEach(resolve => resolve(value))
  }

  function failTurnstile() {
    challengeFailed.current = true
    settleToken(undefined)
  }

  // The challenge takes seconds, so it starts before the visitor reaches the form.
  function startTurnstile(): Promise<boolean> {
    startPromise.current ??= renderTurnstile().then(ready => {
      // A failed load must not stick: the next focus or submit tries again.
      if (!ready) startPromise.current = undefined

      return ready
    })

    return startPromise.current
  }

  function renderTurnstile(): Promise<boolean> {
    const container = widgetRef.current

    if (!container) return Promise.resolve(false)

    return loadTurnstile()
      .then(() => {
        if (!window.turnstile) return false

        widgetId.current ??= window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          action: 'contact',
          language,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          size: 'flexible',
          appearance: 'interaction-only',
          'refresh-expired': 'auto',
          callback: value => {
            challengeFailed.current = false
            settleToken(value)
          },
          // With refresh-expired auto, a new token replaces the expired one; until it arrives, none is sent.
          'expired-callback': () => { token.current = undefined },
          'error-callback': failTurnstile,
          'timeout-callback': failTurnstile,
        })

        return true
      })
      .catch(() => false)
  }

  function resetTurnstile() {
    token.current = undefined
    challengeFailed.current = false

    // Reset starts the next challenge at once, so a second message does not wait for it.
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

  // Turnstile starts once the page is idle, so the token is usually ready before the visitor reaches the form.
  useEffect(() => {
    let idle = 0
    let timer = 0

    const setTimer = window.setTimeout.bind(window)
    const start = () => { void startTurnstile() }

    // A #contact link lands on the form, so that visitor cannot wait.
    if (window.location.hash === '#contact') {
      start()

      return
    }

    const schedule = () => {
      if ('requestIdleCallback' in window) {
        idle = window.requestIdleCallback(start, { timeout: 2000 })
      } else {
        timer = setTimer(start, 200)
      }
    }

    // The load event keeps the challenge from competing with the page's own images and styles.
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })

    return () => {
      window.removeEventListener('load', schedule)

      if (idle) window.cancelIdleCallback(idle)
      window.clearTimeout(timer)
    }
  // startTurnstile reads only refs; the widget starts once per page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fallbacks while the idle start waits: near the form, or on the first focus inside it.
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

  // The confirmation takes focus so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (status === 'sent') sentRef.current?.focus()

    if (status !== 'idle' || !focusName.current) return

    focusName.current = false
    const form = formRef.current

    if (form) fieldControl(form, 'name')?.focus()
  }, [status])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    const values = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
    }

    const found = validateContact(values)

    setErrors(found)

    // A failed field stops the request before the slow challenge starts.
    const first = firstInvalidField(found)

    if (first) {
      setAttempted(true)
      fieldControl(form, first)?.focus()

      return
    }

    const body = new URLSearchParams([...data].map(([key, value]) => [key, String(value)]))

    // A visitor can finish the form before the challenge does; wait for it instead of failing.
    if (!token.current) setStatus('checking')

    const value = await waitForToken()

    if (!value) {
      // A failed or expired challenge needs a fresh widget before the next attempt.
      resetTurnstile()
      setStatus('challenge')

      return
    }

    setStatus('sending')
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

  // After the first failed submit, a field is re-checked as it changes so its error clears when it is fixed.
  function revalidate(field: ContactField, value: string) {
    if (!attempted) return

    setErrors(current => ({ ...current, [field]: validateField(field, value) }))
  }

  function sendAnother() {
    formRef.current?.reset()
    setErrors({})
    setAttempted(false)
    focusName.current = true
    setStatus('idle')
  }

  const busy = status === 'checking' || status === 'sending'
  const waiting = status === 'idle' || busy
  const message = status === 'checking' ? t.checkingNote : waiting ? t.note : t[status]
  const tone = status === 'sent' ? 'ok' : waiting ? undefined : 'error'

  return (
    <form ref={formRef} className="contact-form" onSubmit={submit} onFocus={startTurnstile} noValidate>
      {status === 'sent' ? (
        <div ref={sentRef} className="contact-form-sent" role="status" tabIndex={-1}>
          <h3>{t.sentTitle}</h3>
          <p>{t.sent}</p>
          <button type="button" onClick={sendAnother}>{t.sendAnother}</button>
        </div>
      ) : <>
        <div className="contact-form-row">
          <div className="contact-field">
            <label htmlFor="contact-name">{t.name}</label>
            <input id="contact-name" name="name" autoComplete="name" maxLength={100} aria-required="true" aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? 'contact-name-error' : undefined} onChange={event => revalidate('name', event.currentTarget.value)} />
            {errors.name && <span className="contact-field-error" id="contact-name-error">{t.errors[errors.name]}</span>}
          </div>
          <div className="contact-field">
            <label htmlFor="contact-email">{t.email}</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" dir="ltr" maxLength={254} aria-required="true" aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'contact-email-error' : undefined} onChange={event => revalidate('email', event.currentTarget.value)} />
            {errors.email && <span className="contact-field-error" id="contact-email-error">{t.errors[errors.email]}</span>}
          </div>
        </div>
        <div className="contact-field">
          <label htmlFor="contact-message">{t.message}</label>
          <textarea id="contact-message" name="message" rows={5} maxLength={5000} aria-required="true" aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? 'contact-message-error' : undefined} onChange={event => revalidate('message', event.currentTarget.value)} />
          {errors.message && <span className="contact-field-error" id="contact-message-error">{t.errors[errors.message]}</span>}
        </div>
      </>}
      {/* Hidden from people; bots that fill it are dropped by the Worker. The name is one no autofill matches. */}
      <div className="contact-form-trap" aria-hidden="true">
        <input name="leave_empty" tabIndex={-1} autoComplete="off" />
      </div>
      {/* Kept mounted across the confirmation so the same Turnstile widget serves the next message. */}
      <div ref={widgetRef} className="contact-form-challenge" />
      {status !== 'sent' && <div className="contact-form-footer">
        <button type="submit" disabled={busy}>{status === 'checking' ? t.checking : status === 'sending' ? t.sending : t.send}</button>
        <p className="contact-form-status" role="status" data-tone={tone}>{message}</p>
      </div>}
    </form>
  )
}
