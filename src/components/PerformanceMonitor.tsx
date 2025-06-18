import React, { useEffect } from 'react'
import { useAnalytics } from './Analytics'

interface PerformanceMetrics {
  fcp?: number      // First Contentful Paint
  lcp?: number      // Largest Contentful Paint
  fid?: number      // First Input Delay
  cls?: number      // Cumulative Layout Shift
  ttfb?: number     // Time to First Byte
}

export const PerformanceMonitor: React.FC = () => {
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    // Track performance metrics when the component mounts
    const trackPerformanceMetrics = () => {
      const metrics: PerformanceMetrics = {}

      // Get navigation timing
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navTiming) {
          metrics.ttfb = navTiming.responseStart - navTiming.requestStart
        }

        // Track Core Web Vitals using Performance Observer
        if ('PerformanceObserver' in window) {
          try {
            // First Contentful Paint
            const fcpObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                  metrics.fcp = entry.startTime
                  trackEvent({
                    action: 'core_web_vital',
                    category: 'performance',
                    label: 'fcp',
                    value: Math.round(entry.startTime)
                  })
                }
              }
            })
            fcpObserver.observe({ entryTypes: ['paint'] })

            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries()
              const lastEntry = entries[entries.length - 1]
              metrics.lcp = lastEntry.startTime
              trackEvent({
                action: 'core_web_vital',
                category: 'performance',
                label: 'lcp',
                value: Math.round(lastEntry.startTime)
              })
            })
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const fidEntry = entry as any // Type assertion for FID entry
                metrics.fid = fidEntry.processingStart - fidEntry.startTime
                trackEvent({
                  action: 'core_web_vital',
                  category: 'performance',
                  label: 'fid',
                  value: Math.round(fidEntry.processingStart - fidEntry.startTime)
                })
              }
            })
            fidObserver.observe({ entryTypes: ['first-input'] })

            // Cumulative Layout Shift
            let clsValue = 0
            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const clsEntry = entry as any // Type assertion for CLS entry
                if (!clsEntry.hadRecentInput) {
                  clsValue += clsEntry.value
                }
              }
              metrics.cls = clsValue
              trackEvent({
                action: 'core_web_vital',
                category: 'performance',
                label: 'cls',
                value: Math.round(clsValue * 1000) // Convert to more readable number
              })
            })
            clsObserver.observe({ entryTypes: ['layout-shift'] })

            // Clean up observers after 30 seconds
            setTimeout(() => {
              fcpObserver.disconnect()
              lcpObserver.disconnect()
              fidObserver.disconnect()
              clsObserver.disconnect()
            }, 30000)

          } catch (error) {
            console.warn('Performance Observer not supported:', error)
          }
        }

        // Track page load time
        window.addEventListener('load', () => {
          setTimeout(() => {
            const loadTime = performance.now()
            trackEvent({
              action: 'page_load_time',
              category: 'performance',
              label: window.location.pathname,
              value: Math.round(loadTime)
            })
          }, 0)
        })

        // Track memory usage (if available)
        if ('memory' in performance) {
          const memoryInfo = (performance as any).memory
          trackEvent({
            action: 'memory_usage',
            category: 'performance',
            label: 'used_heap_size',
            value: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) // MB
          })
        }

        // Track connection info (if available)
        if ('connection' in navigator) {
          const connection = (navigator as any).connection
          trackEvent({
            action: 'connection_info',
            category: 'performance',
            label: `${connection.effectiveType || 'unknown'}_${connection.downlink || 0}mbps`
          })
        }
      }
    }

    // Track immediately and on load
    trackPerformanceMetrics()

    // Track user engagement metrics
    let startTime = Date.now()
    let isVisible = !document.hidden
    let totalTimeVisible = 0

    const handleVisibilityChange = () => {
      const now = Date.now()
      
      if (document.hidden) {
        if (isVisible) {
          totalTimeVisible += now - startTime
          isVisible = false
        }
      } else {
        if (!isVisible) {
          startTime = now
          isVisible = true
        }
      }
    }

    const handleUnload = () => {
      const now = Date.now()
      if (isVisible) {
        totalTimeVisible += now - startTime
      }
      
      trackEvent({
        action: 'time_on_page',
        category: 'engagement',
        label: window.location.pathname,
        value: Math.round(totalTimeVisible / 1000) // seconds
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleUnload)

    // Track scroll depth
    let maxScrollPercent = 0
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100)
      
      if (scrollPercent > maxScrollPercent) {
        maxScrollPercent = scrollPercent
        
        // Track at 25%, 50%, 75%, 100%
        if (scrollPercent >= 25 && scrollPercent % 25 === 0) {
          trackEvent({
            action: 'scroll_depth',
            category: 'engagement',
            label: window.location.pathname,
            value: scrollPercent
          })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Track rage clicks (multiple rapid clicks)
    let clickCount = 0
    let clickTimer: NodeJS.Timeout
    
    const handleClick = (e: MouseEvent) => {
      clickCount++
      
      if (clickTimer) {
        clearTimeout(clickTimer)
      }
      
      clickTimer = setTimeout(() => {
        if (clickCount >= 5) {
          trackEvent({
            action: 'rage_click',
            category: 'user_frustration',
            label: (e.target as HTMLElement)?.tagName || 'unknown',
            value: clickCount
          })
        }
        clickCount = 0
      }, 1000)
    }

    document.addEventListener('click', handleClick)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleUnload)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClick)
      if (clickTimer) {
        clearTimeout(clickTimer)
      }
    }
  }, [trackEvent])

  return null // This component doesn't render anything
}

// Hook to access performance data in other components
export const usePerformanceData = () => {
  const [performanceData, setPerformanceData] = React.useState<PerformanceMetrics>({})

  React.useEffect(() => {
    const updatePerformanceData = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        setPerformanceData({
          ttfb: navigation ? navigation.responseStart - navigation.requestStart : undefined,
          // Add other metrics as they become available
        })
      }
    }

    updatePerformanceData()
    
    // Update every few seconds to capture new metrics
    const interval = setInterval(updatePerformanceData, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return performanceData
}

export default PerformanceMonitor 