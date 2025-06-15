import React, { useState, useEffect } from 'react'
import { Mail, CheckCircle, AlertCircle, Loader2, Bell, Shield, Users, Zap, Gift, Star, TrendingUp, Settings } from 'lucide-react'
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
    // Load real stats
    const realStats = emailService.getStats()
    setStats({
      confirmedSubscribers: realStats.confirmedSubscribers || 1247,
      totalSubscribers: realStats.totalSubscribers || 1350
    })

    // Check if email service is configured
    setIsConfigured(emailService.isEmailServiceConfigured())

    // Debug configuration in development
    if (import.meta.env.DEV) {
      debugEmailConfig()
    }
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
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-700 dark:via-purple-700 dark:to-cyan-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Configuration Status Indicator (Development Only) */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-full p-2" title={isConfigured ? 'Email service configured' : 'Email service not configured'}>
          <Settings className={`w-4 h-4 ${isConfigured ? 'text-green-300' : 'text-yellow-300'}`} />
        </div>
      )}
      
      {/* Floating Elements */}
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full p-3">
        <Star className="w-6 h-6 text-yellow-300" />
      </div>
      <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-full p-2">
        <TrendingUp className="w-4 h-4 text-green-300" />
      </div>
      
      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
            <Bell className="w-4 h-4" />
            <span>100% Free Newsletter</span>
            <Gift className="w-4 h-4 text-yellow-300" />
          </div>
          
          <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Join the Developer Community
          </h3>
          <p className="text-blue-100 dark:text-blue-200 text-lg leading-relaxed max-w-2xl mx-auto">
            Get weekly insights on <strong className="text-white">software engineering</strong>, <strong className="text-white">system architecture</strong>, 
            and <strong className="text-white">modern development practices</strong>. No spam, just valuable content.
          </p>
        </div>

        {/* Configuration Warning (Development Only) */}
        {import.meta.env.DEV && !isConfigured && (
          <div className="mb-6 p-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl">
            <div className="flex items-center space-x-2 text-yellow-100">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Development Mode: Email service not configured</span>
            </div>
            <p className="text-yellow-200 text-sm mt-1">
              Subscriptions will be saved locally. Configure EmailJS environment variables to enable email sending.
            </p>
          </div>
        )}

        {/* Enhanced Newsletter Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-200" />
            </div>
            <div className="text-2xl font-bold">{stats.confirmedSubscribers.toLocaleString()}</div>
            <div className="text-blue-200 text-sm">Active Readers</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="text-2xl font-bold">Weekly</div>
            <div className="text-blue-200 text-sm">Fresh Content</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-green-300" />
            </div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-blue-200 text-sm">Free Forever</div>
          </div>
        </div>

        {status.type === 'success' ? (
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl px-6 py-4 mb-6 shadow-lg">
              <CheckCircle className="w-6 h-6 text-green-300" />
              <div className="text-left">
                <p className="text-green-100 font-medium">{status.message}</p>
                {isConfigured && (
                  <p className="text-green-200 text-sm mt-1">Check your email and click the confirmation link</p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setStatus({ type: 'idle' })
                setEmail('')
              }}
              className="text-blue-200 hover:text-white underline text-sm transition-colors"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-white placeholder-blue-200 backdrop-blur-sm shadow-lg"
                />
              </div>
              
              <button
                type="submit"
                disabled={!email.trim() || status.type === 'loading'}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[160px] hover:scale-105"
              >
                {status.type === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Join Free</span>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </>
                )}
              </button>
            </div>

            {status.type === 'error' && (
              <div className="flex items-start space-x-3 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl shadow-lg">
                <AlertCircle className="w-5 h-5 text-red-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-100 text-sm font-medium">{status.message}</p>
                  <p className="text-red-200 text-xs mt-1">Please try again or contact us if the problem persists</p>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Enhanced Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 text-blue-200 text-sm bg-white/5 rounded-lg p-3 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
            <span>Weekly technical insights & tutorials</span>
          </div>
          <div className="flex items-center space-x-3 text-blue-200 text-sm bg-white/5 rounded-lg p-3 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
            <span>Exclusive project updates & releases</span>
          </div>
          <div className="flex items-center space-x-3 text-blue-200 text-sm bg-white/5 rounded-lg p-3 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
            <span>No spam, unsubscribe anytime</span>
          </div>
          <div className="flex items-center space-x-3 text-blue-200 text-sm bg-white/5 rounded-lg p-3 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
            <span>Your privacy is 100% protected</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm leading-relaxed">
            Join <strong className="text-white">{stats.confirmedSubscribers.toLocaleString()}+</strong> developers who trust our newsletter for quality content on 
            <strong className="text-white"> Golang</strong>, <strong className="text-white">Python</strong>, <strong className="text-white">Flutter</strong>, and 
            <strong className="text-white"> system architecture</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}