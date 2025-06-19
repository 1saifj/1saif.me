import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

class AnalyticsManager {
  private static instance: AnalyticsManager
  private events: AnalyticsEvent[] = []
  private sessionStart: number = Date.now()

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager()
    }
    return AnalyticsManager.instance
  }

  trackEvent(event: AnalyticsEvent) {
    this.events.push({
      ...event,
      value: event.value || Date.now() - this.sessionStart
    })
    
    // In production, send to your analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value
        })
      }
    } else {
      console.log('Analytics Event:', event)
    }
  }

  trackPageView(path: string, title: string) {
    this.trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: path
    })
  }

  trackReadingProgress(articleSlug: string, progress: number) {
    if (progress > 0 && progress % 25 === 0) { // Track at 25%, 50%, 75%, 100%
      this.trackEvent({
        action: 'reading_progress',
        category: 'engagement',
        label: articleSlug,
        value: progress
      })
    }
  }

  trackDownload(fileName: string) {
    this.trackEvent({
      action: 'download',
      category: 'interaction',
      label: fileName
    })
  }

  trackContact(method: string) {
    this.trackEvent({
      action: 'contact',
      category: 'conversion',
      label: method
    })
  }

  trackProjectView(projectName: string) {
    this.trackEvent({
      action: 'project_view',
      category: 'portfolio',
      label: projectName
    })
  }

  getSessionData() {
    return {
      duration: Date.now() - this.sessionStart,
      events: this.events.length,
      lastActivity: this.events[this.events.length - 1]
    }
  }
}

export const analytics = AnalyticsManager.getInstance()

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation()

  useEffect(() => {
    // Track initial page load
    analytics.trackPageView(location.pathname, document.title)

    // Track time spent on page
    let startTime = Date.now()
    let isActive = true

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false
        const timeSpent = Date.now() - startTime
        analytics.trackEvent({
          action: 'time_on_page',
          category: 'engagement',
          label: location.pathname,
          value: Math.round(timeSpent / 1000) // seconds
        })
      } else {
        isActive = true
        startTime = Date.now()
      }
    }

    // Track scroll depth
    let maxScroll = 0
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercent > maxScroll && scrollPercent > 0) {
        maxScroll = scrollPercent
        if (maxScroll % 25 === 0) {
          analytics.trackEvent({
            action: 'scroll_depth',
            category: 'engagement',
            label: location.pathname,
            value: maxScroll
          })
        }
      }
    }

    // Track clicks on external links
    const handleExternalClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.href.startsWith('http') && !target.href.includes(window.location.hostname)) {
        analytics.trackEvent({
          action: 'external_link',
          category: 'navigation',
          label: target.href
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('click', handleExternalClick)

    // Track page views for SPA navigation
    useEffect(() => {
      // Track page view in Cloudflare Analytics
      if (window.cloudflare?.beam) {
        window.cloudflare.beam.track('pageview', {
          path: location.pathname,
          title: document.title
        })
      }
    }, [location])

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleExternalClick)
    }
  }, [location])

  return <>{children}</>
}

// Hook for easy analytics access in components
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackReadingProgress: analytics.trackReadingProgress.bind(analytics),
    trackDownload: analytics.trackDownload.bind(analytics),
    trackContact: analytics.trackContact.bind(analytics),
    trackProjectView: analytics.trackProjectView.bind(analytics),
    getSessionData: analytics.getSessionData.bind(analytics)
  }
}

export default AnalyticsProvider

// Cloudflare Analytics interface
declare global {
  interface Window {
    cloudflare?: {
      beam?: {
        track: (eventName: string, data?: Record<string, any>) => void
      }
    }
  }
}

// Custom event tracking helper
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  // Cloudflare Analytics custom events
  if (window.cloudflare?.beam) {
    window.cloudflare.beam.track(eventName, data)
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('Analytics Event:', eventName, data)
  }
}

// Predefined event trackers
export const analyticsEvents = {
  // Newsletter events
  newsletterSubscription: (email: string, template: string) => {
    trackEvent('newsletter_subscription', {
      template,
      timestamp: new Date().toISOString()
    })
  },

  // Portfolio events
  projectView: (projectId: string, projectTitle: string) => {
    trackEvent('project_view', {
      project_id: projectId,
      project_title: projectTitle
    })
  },

  // Blog events
  blogPostView: (postId: string, postTitle: string) => {
    trackEvent('blog_post_view', {
      post_id: postId,
      post_title: postTitle
    })
  },

  // Contact events
  contactFormSubmit: (source: string) => {
    trackEvent('contact_form_submit', {
      source,
      timestamp: new Date().toISOString()
    })
  },

  // Download events
  resumeDownload: () => {
    trackEvent('resume_download', {
      timestamp: new Date().toISOString()
    })
  },

  // Social media clicks
  socialMediaClick: (platform: string, location: string) => {
    trackEvent('social_media_click', {
      platform,
      location
    })
  },

  // Newsletter template events
  templatePreview: (templateName: string) => {
    trackEvent('template_preview', {
      template_name: templateName
    })
  },

  // Search events
  searchQuery: (query: string, resultsCount: number) => {
    trackEvent('search_query', {
      query,
      results_count: resultsCount
    })
  }
} 