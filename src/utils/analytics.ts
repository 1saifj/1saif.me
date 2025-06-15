// Free analytics configuration using environment variables
// Supports Plausible (self-hosted/free), Umami (open source), and Fathom (privacy-focused)

interface AnalyticsConfig {
  plausible?: {
    domain: string
    src?: string
  }
  umami?: {
    websiteId: string
    src?: string
  }
  fathom?: {
    siteId: string
    src?: string
  }
}

class Analytics {
  private config: AnalyticsConfig = {}
  private isProduction = import.meta.env.VITE_APP_ENV === 'production'

  constructor() {
    this.initializeConfig()
    if (this.isProduction) {
      this.loadAnalytics()
    }
  }

  private initializeConfig() {
    // Plausible Analytics (Free & Open Source)
    if (import.meta.env.VITE_PLAUSIBLE_DOMAIN) {
      this.config.plausible = {
        domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN,
        src: 'https://plausible.io/js/script.js'
      }
    }

    // Umami Analytics (Open Source)
    if (import.meta.env.VITE_UMAMI_WEBSITE_ID) {
      this.config.umami = {
        websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID,
        src: 'https://analytics.umami.is/script.js'
      }
    }

    // Fathom Analytics (Privacy-focused, has free tier)
    if (import.meta.env.VITE_FATHOM_SITE_ID) {
      this.config.fathom = {
        siteId: import.meta.env.VITE_FATHOM_SITE_ID,
        src: 'https://cdn.usefathom.com/script.js'
      }
    }
  }

  private loadAnalytics() {
    // Load Plausible
    if (this.config.plausible) {
      const script = document.createElement('script')
      script.defer = true
      script.src = this.config.plausible.src!
      script.setAttribute('data-domain', this.config.plausible.domain)
      document.head.appendChild(script)
      console.log('✅ Plausible Analytics loaded')
    }

    // Load Umami
    if (this.config.umami) {
      const script = document.createElement('script')
      script.defer = true
      script.src = this.config.umami.src!
      script.setAttribute('data-website-id', this.config.umami.websiteId)
      document.head.appendChild(script)
      console.log('✅ Umami Analytics loaded')
    }

    // Load Fathom
    if (this.config.fathom) {
      const script = document.createElement('script')
      script.src = this.config.fathom.src!
      script.setAttribute('data-site', this.config.fathom.siteId)
      script.defer = true
      document.head.appendChild(script)
      console.log('✅ Fathom Analytics loaded')
    }

    if (!this.hasAnyAnalytics()) {
      console.log('ℹ️ No analytics configured. Add environment variables to enable tracking.')
    }
  }

  private hasAnyAnalytics(): boolean {
    return !!(this.config.plausible || this.config.umami || this.config.fathom)
  }

  // Custom event tracking (works with all providers)
  trackEvent(eventName: string, props?: Record<string, any>) {
    if (!this.isProduction) {
      console.log('📊 Analytics Event (dev):', eventName, props)
      return
    }

    // Plausible custom events
    if (this.config.plausible && (window as any).plausible) {
      (window as any).plausible(eventName, { props })
    }

    // Umami custom events
    if (this.config.umami && (window as any).umami) {
      (window as any).umami.track(eventName, props)
    }

    // Fathom custom events
    if (this.config.fathom && (window as any).fathom) {
      (window as any).fathom.trackGoal(eventName, props?.value || 0)
    }
  }

  // Common portfolio events
  trackProjectView(projectSlug: string) {
    this.trackEvent('Project View', { project: projectSlug })
  }

  trackBlogPostView(postSlug: string) {
    this.trackEvent('Blog Post View', { post: postSlug })
  }

  trackNewsletterSignup(email: string) {
    this.trackEvent('Newsletter Signup', { email: email.split('@')[1] }) // Track domain only for privacy
  }

  trackContactFormSubmit() {
    this.trackEvent('Contact Form Submit')
  }

  trackDownload(fileName: string) {
    this.trackEvent('File Download', { file: fileName })
  }

  trackExternalLink(url: string) {
    this.trackEvent('External Link Click', { url })
  }

  // Performance tracking
  trackPageLoad() {
    if (!this.isProduction) return

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      this.trackEvent('Page Load Time', { 
        time: Math.round(loadTime),
        page: window.location.pathname 
      })
    })
  }

  // Get analytics status for debugging
  getStatus() {
    return {
      isProduction: this.isProduction,
      configured: this.hasAnyAnalytics(),
      providers: {
        plausible: !!this.config.plausible,
        umami: !!this.config.umami,
        fathom: !!this.config.fathom
      },
      config: this.config
    }
  }
}

// Create singleton instance
export const analytics = new Analytics()

// React hook for easy component usage
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackProjectView: analytics.trackProjectView.bind(analytics),
    trackBlogPostView: analytics.trackBlogPostView.bind(analytics),
    trackNewsletterSignup: analytics.trackNewsletterSignup.bind(analytics),
    trackContactFormSubmit: analytics.trackContactFormSubmit.bind(analytics),
    trackDownload: analytics.trackDownload.bind(analytics),
    trackExternalLink: analytics.trackExternalLink.bind(analytics),
    getStatus: analytics.getStatus.bind(analytics)
  }
}

// Initialize page load tracking
analytics.trackPageLoad()

export default analytics 