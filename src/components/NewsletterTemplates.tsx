import React, { useState } from 'react'
import { Mail, Sparkles, Zap, TrendingUp, BookOpen, Users, CheckCircle, ArrowRight, Star, Rocket, Heart, Shield } from 'lucide-react'

interface NewsletterTemplateProps {
  onSubscribe: (email: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Gradient Hero Newsletter Template
 * Modern gradient design with animated elements
 */
export const GradientHeroNewsletter: React.FC<NewsletterTemplateProps> = ({ onSubscribe, isLoading }) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    try {
      await onSubscribe(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Subscription error:', error)
    }
  }

  if (isSubmitted) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Almost There! 🚀</h3>
          <p className="text-white/90 leading-relaxed">
            Check your email for a confirmation link to complete your subscription.
          </p>
        </div>
        <div className="absolute top-4 right-4 text-white/30">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-pink-300/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300/20 rounded-full blur-md animate-ping"></div>
      </div>
      
      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium">Join 1,000+ Engineers</span>
          </div>
          
          <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Level Up Your Engineering Game
          </h3>
          
          <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
            Get exclusive insights, tutorials, and industry secrets delivered to your inbox. 
            No spam, just pure engineering gold. ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            <Shield className="w-4 h-4 inline mr-1" />
            No spam. Unsubscribe anytime. Your privacy matters.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Minimalist Card Newsletter Template
 * Clean, professional design with subtle animations
 */
export const MinimalistCardNewsletter: React.FC<NewsletterTemplateProps> = ({ onSubscribe, isLoading }) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    try {
      await onSubscribe(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Subscription error:', error)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
          Success! Check Your Email
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          We've sent you a confirmation link. Click it to complete your subscription.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Stay Updated
        </h3>
        
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Join our newsletter for the latest engineering insights, tutorials, and industry trends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@company.com"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Free forever. No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}

/**
 * Feature-Rich Newsletter Template
 * Showcases benefits and social proof
 */
export const FeatureRichNewsletter: React.FC<NewsletterTemplateProps> = ({ onSubscribe, isLoading }) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    try {
      await onSubscribe(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Subscription error:', error)
    }
  }

  const features = [
    { icon: BookOpen, title: 'Deep Technical Guides', desc: 'In-depth tutorials and best practices' },
    { icon: TrendingUp, title: 'Industry Insights', desc: 'Latest trends and emerging technologies' },
    { icon: Zap, title: 'Quick Tips', desc: 'Actionable advice you can use immediately' },
    { icon: Users, title: 'Community Access', desc: 'Connect with fellow engineers' }
  ]

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-3xl p-8 border border-green-200 dark:border-green-800 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">
          Welcome to the Community! 🎉
        </h3>
        <p className="text-green-700 dark:text-green-300 leading-relaxed">
          Check your email for a confirmation link. You're one step away from exclusive engineering content!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Star className="w-4 h-4" />
          <span>Trusted by 1,000+ Engineers</span>
        </div>
        
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Join Our Engineering Newsletter
        </h3>
        
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Get weekly insights that will accelerate your engineering career and keep you ahead of the curve.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon
          return (
            <div key={index} className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{feature.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Get Started</span>
                <Heart className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <Shield className="w-4 h-4 inline mr-1" />
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  )
}

/**
 * Compact Inline Newsletter Template
 * Perfect for embedding in blog posts or sidebars
 */
export const CompactInlineNewsletter: React.FC<NewsletterTemplateProps> = ({ onSubscribe, isLoading }) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    try {
      await onSubscribe(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Subscription error:', error)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Thanks! Check your email to confirm.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Weekly Newsletter</h4>
          <p className="text-slate-600 dark:text-slate-300 text-xs">Engineering insights & tutorials</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Join'
          )}
        </button>
      </form>
    </div>
  )
}

// Export all templates
export const NewsletterTemplates = {
  GradientHero: GradientHeroNewsletter,
  MinimalistCard: MinimalistCardNewsletter,
  FeatureRich: FeatureRichNewsletter,
  CompactInline: CompactInlineNewsletter
} 