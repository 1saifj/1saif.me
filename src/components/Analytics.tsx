import React, { useEffect } from 'react'

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
  useEffect(() => {
    // Track initial page load
    analytics.trackPageView(window.location.pathname, document.title)

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
          label: window.location.pathname,
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
            label: window.location.pathname,
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

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleExternalClick)
    }
  }, [])

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