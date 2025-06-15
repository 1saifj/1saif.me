import { useEffect } from 'react'

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

interface PageView {
  page_title: string
  page_location: string
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export const useAnalytics = () => {
  useEffect(() => {
    // Initialize Google Analytics if not already loaded
    if (typeof window !== 'undefined' && !window.gtag) {
      // Create dataLayer
      window.dataLayer = window.dataLayer || []
      
      // Define gtag function
      window.gtag = function() {
        window.dataLayer?.push(arguments)
      }
      
      // Configure with your GA4 measurement ID
      window.gtag('js', new Date())
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      })
    }
  }, [])

  const trackEvent = (event: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value
      })
    }
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event)
    }
  }

  const trackPageView = (pageView: PageView) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: pageView.page_title,
        page_location: pageView.page_location
      })
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Page View:', pageView)
    }
  }

  const trackUserEngagement = (engagementTime: number) => {
    trackEvent({
      action: 'user_engagement',
      category: 'engagement',
      value: engagementTime
    })
  }

  const trackArticleRead = (articleTitle: string, readingTime: number) => {
    trackEvent({
      action: 'article_read',
      category: 'content',
      label: articleTitle,
      value: readingTime
    })
  }

  const trackProjectView = (projectName: string) => {
    trackEvent({
      action: 'project_view',
      category: 'portfolio',
      label: projectName
    })
  }

  const trackContactForm = (action: 'submit' | 'success' | 'error') => {
    trackEvent({
      action: `contact_form_${action}`,
      category: 'contact'
    })
  }

  const trackNewsletterSubscription = (action: 'submit' | 'success' | 'error') => {
    trackEvent({
      action: `newsletter_${action}`,
      category: 'newsletter'
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackUserEngagement,
    trackArticleRead,
    trackProjectView,
    trackContactForm,
    trackNewsletterSubscription
  }
}