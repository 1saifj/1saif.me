import React, { useState, useEffect } from 'react'
import { WarningCircle, CheckCircle, CircleNotch, ArrowRight } from '@phosphor-icons/react'
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
      }
    }

    loadStats()
    setIsConfigured(emailService.isEmailServiceConfigured())

    if (import.meta.env.DEV) {
      debugEmailConfig()
    }

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
        setStatus({ type: 'success', message: result.message })
        setEmail('')
        
        const newStats = emailService.getStats()
        setStats({
          confirmedSubscribers: newStats.confirmedSubscribers || stats.confirmedSubscribers,
          totalSubscribers: newStats.totalSubscribers || stats.totalSubscribers + 1
        })
      } else {
        setStatus({ type: 'error', message: result.message })
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' })
    }
  }

  return (
    <div className="border-t border-b border-slate-200 dark:border-zinc-800 py-16 md:py-24 relative overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left: Copy */}
          <div>
            <h3 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tighter">
              Join the<br />
              <span className="text-slate-400 dark:text-zinc-600">Newsletter.</span>
            </h3>
            <p className="text-slate-600 dark:text-zinc-400 text-lg max-w-md leading-relaxed">
              Get weekly insights on software engineering, system architecture, and tech leadership. High signal, low noise.
            </p>
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-4">
              <span className="font-mono text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">
                {stats.confirmedSubscribers.toLocaleString()}
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-600">
                ACTIVE<br />SUBSCRIBERS
              </span>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {import.meta.env.DEV && !isConfigured && (
              <div className="mb-8 p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left flex items-start gap-3">
                <WarningCircle weight="fill" className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-widest">Dev Mode</p>
                  <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Email service not configured.</p>
                </div>
              </div>
            )}

            {status.type === 'success' ? (
              <div className="border border-slate-200 dark:border-zinc-800 p-8 md:p-12 hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                <div className="flex flex-col items-start gap-4">
                  <CheckCircle weight="fill" className="w-8 h-8 text-slate-900 dark:text-white" />
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold text-xl mb-2">{status.message}</p>
                    {isConfigured && (
                      <p className="text-slate-500 dark:text-zinc-400 text-sm">Please check your email to confirm subscription.</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setStatus({ type: 'idle' }); setEmail('') }}
                    className="mt-6 text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white transition-colors"
                  >
                    Subscribe Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@example.com"
                    required
                    className="w-full bg-transparent border-b-2 border-slate-200 dark:border-zinc-800 focus:border-slate-900 dark:focus:border-white py-4 pl-0 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors text-lg rounded-none"
                  />
                  <button 
                    type="submit"
                    disabled={!email.trim() || status.type === 'loading'}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white transition-colors disabled:opacity-50"
                  >
                    {status.type === 'loading' ? (
                      <CircleNotch weight="bold" className="w-6 h-6 animate-spin" />
                    ) : (
                      <ArrowRight weight="bold" className="w-6 h-6" />
                    )}
                  </button>
                </div>
                
                {status.type === 'error' && (
                  <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left flex items-start gap-3">
                    <WarningCircle weight="fill" className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-sm tracking-widest uppercase">Error</p>
                      <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">{status.message}</p>
                    </div>
                  </div>
                )}
                
                <p className="text-slate-400 dark:text-zinc-600 text-xs font-bold tracking-widest uppercase">
                  Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
