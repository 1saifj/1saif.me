import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Home, Mail, Heart } from 'lucide-react'
import { emailService } from '../utils/emailService'

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>('loading')
  const [showFeedback, setShowFeedback] = useState(false)
  const subscriberId = searchParams.get('id')

  useEffect(() => {
    if (!subscriberId) {
      setStatus('error')
      return
    }

    // Attempt to unsubscribe
    const unsubscribed = emailService.unsubscribe(subscriberId)
    
    if (unsubscribed) {
      setStatus('success')
    } else {
      setStatus('not-found')
    }
  }, [subscriberId])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Processing Unsubscribe...</h1>
            <p className="text-slate-600 dark:text-slate-300">Please wait while we process your request.</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Successfully Unsubscribed</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              You've been removed from our newsletter. We're sorry to see you go!
            </p>
            
            {!showFeedback ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  We'd love to improve our newsletter. Would you mind sharing why you unsubscribed?
                </p>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Share Feedback
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Why did you unsubscribe?</h3>
                <div className="space-y-2 text-left">
                  {[
                    'Too many emails',
                    'Content not relevant',
                    'Poor email design',
                    'Found better alternatives',
                    'No longer interested',
                    'Other reason'
                  ].map((reason) => (
                    <label key={reason} className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="feedback" className="text-blue-600" />
                      <span className="text-slate-700 dark:text-slate-300">{reason}</span>
                    </label>
                  ))}
                </div>
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Submit Feedback
                </button>
              </div>
            )}
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-8 max-w-md mx-auto">
              <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                You can always resubscribe later if you change your mind. 
                We'll be here when you're ready!
              </p>
            </div>
          </div>
        )

      case 'not-found':
        return (
          <div className="text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Subscription Not Found</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              We couldn't find an active subscription with this link. You may already be unsubscribed.
            </p>
          </div>
        )

      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Unsubscribe Failed</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              We couldn't process your unsubscribe request. The link may be invalid or expired.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {renderContent()}
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link 
            to="/"
            className="inline-flex items-center space-x-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
          
          <Link 
            to="/#newsletter"
            className="inline-flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Mail className="w-5 h-5" />
            <span>Resubscribe</span>
          </Link>
        </div>
      </div>
    </div>
  )
}