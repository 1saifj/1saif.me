// Shared by the contact form and the comment form; the script loads once, on first use.

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

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
