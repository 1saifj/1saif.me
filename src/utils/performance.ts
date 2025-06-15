// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure Web Vitals
  measureWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP()
    
    // First Input Delay (FID)
    this.observeFID()
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS()
    
    // Time to First Byte (TTFB)
    this.measureTTFB()
  }

  private observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.set('LCP', lastEntry.startTime)
        this.logMetric('LCP', lastEntry.startTime)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }
  }

  private observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            const fid = (entry as any).processingStart - entry.startTime
            this.metrics.set('FID', fid)
            this.logMetric('FID', fid)
          }
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    }
  }

  private observeCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.metrics.set('CLS', clsValue)
        this.logMetric('CLS', clsValue)
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    }
  }

  private measureTTFB() {
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const ttfb = navTiming.responseStart - navTiming.requestStart
      this.metrics.set('TTFB', ttfb)
      this.logMetric('TTFB', ttfb)
    }
  }

  private logMetric(name: string, value: number) {
    if (import.meta.env.DEV) {
      console.log(`🚀 Performance Metric - ${name}: ${value.toFixed(2)}ms`)
    }
    
    // In production, you could send these to analytics
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('event', 'web_vitals', {
        name,
        value: Math.round(value),
        metric_id: this.generateMetricId()
      })
    }
  }

  private generateMetricId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get current metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Resource loading performance
  measureResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          
          // Log slow resources (> 1000ms)
          if (resource.duration > 1000) {
            console.warn(`⚠️ Slow resource: ${resource.name} - ${resource.duration.toFixed(2)}ms`)
          }
          
          // Log large resources (> 1MB)
          if (resource.transferSize && resource.transferSize > 1024 * 1024) {
            console.warn(`📦 Large resource: ${resource.name} - ${(resource.transferSize / 1024 / 1024).toFixed(2)}MB`)
          }
        }
      })
      observer.observe({ entryTypes: ['resource'] })
    }
  }

  // Memory usage monitoring
  measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
      
      if (import.meta.env.DEV) {
        console.log('🧠 Memory Usage:', {
          used: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        })
      }
      
      return memoryInfo
    }
    return null
  }
}

// Image optimization utility
export const optimizeImage = (src: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'auto'
} = {}) => {
  const { width, height, quality = 80, format = 'auto' } = options
  
  // For development, return original image
  if (import.meta.env.DEV) {
    return src
  }
  
  // In production, you could integrate with image optimization services
  // like Cloudinary, ImageKit, or Next.js Image Optimization
  let optimizedSrc = src
  
  // Add query parameters for optimization
  const params = new URLSearchParams()
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())
  if (quality) params.append('q', quality.toString())
  if (format !== 'auto') params.append('f', format)
  
  if (params.toString()) {
    optimizedSrc += (src.includes('?') ? '&' : '?') + params.toString()
  }
  
  return optimizedSrc
}

// Preload critical resources
export const preloadResource = (href: string, as: string, type?: string) => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  document.head.appendChild(link)
}

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  const monitor = PerformanceMonitor.getInstance()
  
  // Start monitoring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      monitor.measureWebVitals()
      monitor.measureResourceTiming()
    })
  } else {
    monitor.measureWebVitals()
    monitor.measureResourceTiming()
  }
  
  // Monitor memory usage periodically
  setInterval(() => {
    monitor.measureMemoryUsage()
  }, 30000) // Every 30 seconds
}

// Accessibility utilities
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)
  
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
} 