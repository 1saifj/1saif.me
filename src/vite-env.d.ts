/// <reference types="vite/client" />

interface ImportMetaEnv {
  // EmailJS Configuration
  readonly VITE_EMAILJS_SERVICE_ID: string
  readonly VITE_EMAILJS_TEMPLATE_ID: string
  readonly VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID: string
  readonly VITE_EMAILJS_PUBLIC_KEY: string

  // Site Configuration
  readonly VITE_SITE_URL: string
  readonly VITE_SITE_NAME: string
  readonly VITE_SITE_DESCRIPTION: string

  // Analytics Configuration
  readonly VITE_PLAUSIBLE_DOMAIN: string
  readonly VITE_UMAMI_WEBSITE_ID: string
  readonly VITE_FATHOM_SITE_ID: string

  // Newsletter Configuration
  readonly VITE_NEWSLETTER_FROM_NAME: string
  readonly VITE_NEWSLETTER_FROM_EMAIL: string

  // PWA Configuration
  readonly VITE_PWA_NAME: string
  readonly VITE_PWA_SHORT_NAME: string
  readonly VITE_PWA_DESCRIPTION: string

  // Production Settings
  readonly VITE_APP_ENV: string
  readonly VITE_API_BASE_URL: string

  // Security Headers
  readonly VITE_CSP_REPORT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
