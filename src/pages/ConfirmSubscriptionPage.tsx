import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, ArrowRight, Home } from 'lucide-react'

const ConfirmSubscriptionPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-confirmed'>('loading')
  const [message, setMessage] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid confirmation link')
      return
    }

    // This would typically call your Firebase Function
    // For now, we'll simulate the confirmation process
    const confirmSubscription = async () => {
      try {
        // In production, this would be:
        // const response = await fetch(`/confirmSubscription?token=${token}`)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulate success for demo
        setStatus('success')
        setMessage('Your subscription has been confirmed successfully!')
      } catch (error) {
        setStatus('error')
        setMessage('Failed to confirm subscription. Please try again.')
      }
    }

    confirmSubscription()
  }, [token])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Confirming your subscription...
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we confirm your email subscription.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              🎉 Subscription Confirmed!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Welcome to our newsletter! You'll receive our latest insights on software engineering and tech trends.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                What's next?
              </h3>
              <ul className="text-left text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  Check your inbox for a welcome email
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-green-600 mr-3" />
                  Get ready for weekly tech insights
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

      case 'already-confirmed':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Already Confirmed
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Your subscription was already confirmed. You're all set to receive our newsletter!
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
              Confirmation Failed
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {message || 'We encountered an error while confirming your subscription. Please try again or contact support.'}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 lg:p-12">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default ConfirmSubscriptionPage
export { ConfirmSubscriptionPage }