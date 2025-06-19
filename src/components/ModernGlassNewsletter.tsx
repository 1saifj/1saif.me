import React, { useState, useRef, useEffect } from 'react'
import { Mail, Sparkles, CheckCircle, ArrowRight, Star, Users, TrendingUp } from 'lucide-react'

interface ModernGlassNewsletterProps {
  onSubscribe: (email: string) => Promise<void>
  isLoading?: boolean
}

export const ModernGlassNewsletter: React.FC<ModernGlassNewsletterProps> = ({ onSubscribe, isLoading }) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

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
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 p-1"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.2) 0%, transparent 50%)`
        }}
      >
        <div className="relative bg-white/10 backdrop-blur-xl rounded-[23px] p-12 text-center border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[23px]" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4">
              Welcome to the Experience! 🎉
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-md mx-auto">
              Thank you for joining our community. Get ready for innovative insights delivered to your inbox.
            </p>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Users className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-white font-semibold">10K+</div>
                <div className="text-white/70 text-sm">Subscribers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <TrendingUp className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-white font-semibold">Weekly</div>
                <div className="text-white/70 text-sm">Updates</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Star className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-white font-semibold">Premium</div>
                <div className="text-white/70 text-sm">Content</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-1 transition-all duration-700 hover:shadow-2xl hover:shadow-purple-500/25"
      style={{
        background: `
          linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%),
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.1) 0%, transparent 50%)
        `,
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* Glass morphism container */}
      <div className="relative bg-white/10 backdrop-blur-xl rounded-[23px] p-10 border border-white/20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-[23px]">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-1/2 -right-8 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute -bottom-6 left-1/3 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse delay-500" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/30">
              <Sparkles className="w-4 h-4" />
              <span>Premium Newsletter</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Join the
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Innovation Wave
              </span>
            </h2>
            
            <p className="text-white/90 text-lg leading-relaxed max-w-md mx-auto">
              Get exclusive insights, cutting-edge trends, and innovative solutions delivered weekly.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Weekly Insights</div>
                <div className="text-white/70 text-xs">Curated content</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Premium Access</div>
                <div className="text-white/70 text-xs">Exclusive content</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your email address"
                required
                className={`w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/70 transition-all duration-300 ${
                  isFocused 
                    ? 'border-white/50 bg-white/30 shadow-lg shadow-white/20' 
                    : 'border-white/30 hover:border-white/40'
                }`}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !email}
              className="group w-full relative overflow-hidden bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 hover:border-white/50 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse" />
              
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Join the Innovation Wave</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Trust indicators */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm mb-3">
              Trusted by 10,000+ innovators worldwide
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full border-2 border-white/50" />
                ))}
              </div>
              <span className="text-white/90 text-sm font-medium">Join them today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 