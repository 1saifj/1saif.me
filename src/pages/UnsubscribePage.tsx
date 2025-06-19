import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, ArrowRight, Home, Heart, MessageCircle } from 'lucide-react'

const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-unsubscribed'>('loading')
  const [message, setMessage] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackReason, setFeedbackReason] = useState('')
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid unsubscribe link')
      return
    }

    // This would typically call your Firebase Function
    // For now, we'll simulate the unsubscribe process
    const unsubscribeUser = async () => {
      try {
        // In production, this would be:
        // const response = await fetch(`/unsubscribe?token=${token}`)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Simulate success for demo
        setStatus('success')
        setMessage('You have been successfully unsubscribed.')
      } catch (error) {
        setStatus('error')
        setMessage('Failed to unsubscribe. Please try again.')
      }
    }

    unsubscribeUser()
  }, [token])

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackReason.trim()) return

    try {
      // In production, this would submit feedback to your Firebase Function
      console.log('Feedback submitted:', feedbackReason)
      setShowFeedback(false)
      // Show a brief success message
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-6">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Processing your request...
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we unsubscribe you from our newsletter.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Successfully Unsubscribed
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              {email ? `${email} has been removed` : 'You have been removed'} from our newsletter list.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Sorry to see you go!
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We're always looking to improve. Would you mind sharing why you unsubscribed?
              </p>
              
              {!showFeedback ? (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 font-medium"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Share Feedback
                </button>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="mt-4">
                  <textarea
                    value={feedbackReason}
                    onChange={(e) => setFeedbackReason(e.target.value)}
                    placeholder="Tell us what we could do better..."
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      type="submit"
                      disabled={!feedbackReason.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFeedback(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Stay Connected
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Even though you've unsubscribed, you can still:
              </p>
              <ul className="text-left text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-3" />
                  Read our latest articles on the blog
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-green-600 mr-3" />
                  Follow us on social media
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-purple-600 mr-3" />
                  Re-subscribe anytime if you change your mind
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 font-medium"
              >
                Read Latest Articles
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        )

      case 'already-unsubscribed':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-6">
              <Mail className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Already Unsubscribed
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              This email address is already unsubscribed from our newsletter.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
        )

      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-6">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Unsubscribe Failed
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {message || 'We encountered an error while processing your unsubscribe request. Please try again or contact support.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-orange-950 dark:to-red-950 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 lg:p-12">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default UnsubscribePage
export { UnsubscribePage }