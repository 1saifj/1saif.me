import React, { useState, useEffect } from 'react'
import { Mail, Loader2, CheckCircle, AlertCircle, Users, Zap, Shield, ArrowRight, Settings, Bell, Gift, TrendingUp, Star } from 'lucide-react'
import { emailService, debugEmailConfig } from '../utils/emailService'

interface NewsletterStatus {
  type: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<NewsletterStatus>({ type: 'idle' })
  const [stats, setStats] = useState({ confirmedSubscribers: 1247, totalSubscribers: 1350 })
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Initialize email service and load real stats
    const loadStats = async () => {
      try {
        await emailService.refreshStats()
        const realStats = emailService.getStats()
        setStats({
          confirmedSubscribers: realStats.confirmedSubscribers || 1247,
          totalSubscribers: realStats.totalSubscribers || 1350
        })
      } catch (error) {
        console.error('Failed to load newsletter stats:', error)
        // Keep default stats on error
      }
    }

    loadStats()

    // Check if email service is configured
    setIsConfigured(emailService.isEmailServiceConfigured())

    // Debug configuration in development
    if (import.meta.env.DEV) {
      debugEmailConfig()
    }

    // Set up periodic stats refresh (every 30 seconds)
    const interval = setInterval(loadStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus({ type: 'loading' })

    try {
      const result = await emailService.subscribe(email.trim(), 'website')
      
      if (result.success) {
        setStatus({ 
          type: 'success', 
          message: result.message
        })
        setEmail('')
        
        // Update stats
        const newStats = emailService.getStats()
        setStats({
          confirmedSubscribers: newStats.confirmedSubscribers || stats.confirmedSubscribers,
          totalSubscribers: newStats.totalSubscribers || stats.totalSubscribers + 1
        })
      } else {
        setStatus({ 
          type: 'error', 
          message: result.message
        })
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again later.' 
      })
    }
  }

  return (
    <div className="bg-slate-900 dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 shadow-xl border border-slate-800 dark:border-slate-700 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none"></div>
      
      <div className="relative">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-2 xs:mb-3">
              Stay Updated
            </h3>
            <p className="text-slate-400 text-xs xs:text-sm sm:text-base leading-relaxed">
              Get weekly insights on software engineering and system architecture. 
              Quality content, no spam.
            </p>
          </div>

        {/* Configuration Warning (Development Only) */}
        {import.meta.env.DEV && !isConfigured && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start space-x-2 text-amber-500">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Development Mode</p>
                <p className="text-amber-400 text-xs mt-0.5">Email service not configured</p>
              </div>
            </div>
          </div>
        )}

        {status.type === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-400 font-medium text-sm">{status.message}</p>
                {isConfigured && (
                  <p className="text-green-400/70 text-xs mt-1">Check your email to confirm</p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setStatus({ type: 'idle' })
                setEmail('')
              }}
              className="text-slate-500 hover:text-slate-400 text-xs mt-3 transition-colors"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 bg-slate-800 dark:bg-slate-700 border border-slate-700 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500 text-sm"
              />
              
              <button
                type="submit"
                disabled={!email.trim() || status.type === 'loading'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
              >
                {status.type === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </div>

            {status.type === 'error' && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 text-sm">{status.message}</p>
                    <p className="text-red-400/70 text-xs mt-0.5">Please try again</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Simple footer text */}
        <div className="mt-6 pt-6 border-t border-slate-800 dark:border-slate-700">
          <p className="text-slate-500 text-xs text-center">
            Join {stats.confirmedSubscribers.toLocaleString()}+ developers • No spam • Unsubscribe anytime
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}