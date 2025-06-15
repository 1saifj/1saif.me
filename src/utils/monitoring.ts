// Production monitoring and error tracking
// Free alternatives to expensive services like Sentry

interface ErrorReport {
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  userId?: string
  sessionId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

interface PerformanceMetric {
  name: string
  value: number
  timestamp: string
  url: string
  sessionId: string
  additionalData?: Record<string, any>
}

class ProductionMonitoring {
  private sessionId: string
  private isProduction: boolean
  private errorQueue: ErrorReport[] = []
  private metricQueue: PerformanceMetric[] = []
  private maxQueueSize = 50

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isProduction = import.meta.env.VITE_APP_ENV === 'production'
    
    if (this.isProduction) {
      this.setupErrorTracking()
      this.setupPerformanceTracking()
      this.setupUnloadHandler()
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        severity: 'medium',
        context: {
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript'
        }
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        severity: 'high',
        context: {
          type: 'promise_rejection',
          reason: event.reason
        }
      })
    })
  }

  private setupPerformanceTracking() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          this.reportMetric({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            sessionId: this.sessionId,
            additionalData: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              firstByte: navigation.responseStart - navigation.fetchStart,
              domInteractive: navigation.domInteractive - navigation.fetchStart
            }
          })
        }

        // Track Core Web Vitals
        this.trackCoreWebVitals()
      }, 0)
    })
  }

  private trackCoreWebVitals() {
    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcp = entries[entries.length - 1]
      
      this.reportMetric({
        name: 'first_contentful_paint',
        value: fcp.startTime,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        sessionId: this.sessionId
      })
    })
    
    try {
      fcpObserver.observe({ entryTypes: ['paint'] })
    } catch (e) {
      // Ignore if not supported
    }

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1]
      
      this.reportMetric({
        name: 'largest_contentful_paint',
        value: lcp.startTime,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        sessionId: this.sessionId
      })
    })
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // Ignore if not supported
    }

    // First Input Delay (FID) and Cumulative Layout Shift (CLS)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as any // Type assertion for FID
          this.reportMetric({
            name: 'first_input_delay',
            value: fidEntry.processingStart - entry.startTime,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            sessionId: this.sessionId
          })
        } else if (entry.entryType === 'layout-shift') {
          const clsEntry = entry as any // Type assertion for CLS
          if (!clsEntry.hadRecentInput) {
            this.reportMetric({
              name: 'cumulative_layout_shift',
              value: clsEntry.value,
              timestamp: new Date().toISOString(),
              url: window.location.href,
              sessionId: this.sessionId
            })
          }
        }
      })
    })
    
    try {
      fidObserver.observe({ entryTypes: ['first-input', 'layout-shift'] })
    } catch (e) {
      // Ignore if not supported
    }
  }

  private setupUnloadHandler() {
    // Send queued data before page unload
    window.addEventListener('beforeunload', () => {
      this.flush()
    })

    // Also flush periodically
    setInterval(() => {
      this.flush()
    }, 30000) // Every 30 seconds
  }

  // Public methods
  reportError(error: Partial<ErrorReport>) {
    const fullError: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: error.timestamp || new Date().toISOString(),
      sessionId: this.sessionId,
      severity: error.severity || 'medium',
      context: error.context
    }

    if (this.isProduction) {
      this.errorQueue.push(fullError)
      this.trimQueue()
    } else {
      console.error('Error reported:', fullError)
    }
  }

  reportMetric(metric: PerformanceMetric) {
    if (this.isProduction) {
      this.metricQueue.push(metric)
      this.trimQueue()
    } else {
      console.log('Metric reported:', metric)
    }
  }

  private trimQueue() {
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize)
    }
    if (this.metricQueue.length > this.maxQueueSize) {
      this.metricQueue = this.metricQueue.slice(-this.maxQueueSize)
    }
  }

  private flush() {
    if (!this.isProduction || (this.errorQueue.length === 0 && this.metricQueue.length === 0)) {
      return
    }

    // In a real implementation, send to your monitoring service
    // For now, we'll store locally and log
    const data = {
      errors: [...this.errorQueue],
      metrics: [...this.metricQueue],
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    }

    // Store in localStorage for now (replace with actual monitoring service)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('monitoring_logs') || '[]')
      existingLogs.push(data)
      
      // Keep only last 10 sessions
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10)
      }
      
      localStorage.setItem('monitoring_logs', JSON.stringify(existingLogs))
    } catch (e) {
      console.warn('Failed to store monitoring data:', e)
    }

    // Clear queues
    this.errorQueue = []
    this.metricQueue = []
  }

  // Get monitoring data for debugging
  getStoredLogs() {
    try {
      return JSON.parse(localStorage.getItem('monitoring_logs') || '[]')
    } catch (e) {
      return []
    }
  }

  clearStoredLogs() {
    localStorage.removeItem('monitoring_logs')
  }
}

// Export singleton instance
export const monitoring = new ProductionMonitoring()

// Helper function for manual error reporting
export const reportError = (error: string | Error, context?: Record<string, any>, severity: ErrorReport['severity'] = 'medium') => {
  monitoring.reportError({
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'object' ? error.stack : undefined,
    severity,
    context
  })
}

// Helper function for custom metrics
export const reportMetric = (name: string, value: number, additionalData?: Record<string, any>) => {
  monitoring.reportMetric({
    name,
    value,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    sessionId: monitoring['sessionId'], // Access private property
    additionalData
  })
} 