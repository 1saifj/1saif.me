import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Home, Mail } from 'lucide-react'
import { emailService } from '../utils/emailService'

export const ConfirmSubscriptionPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-confirmed'>('loading')
  const subscriberId = searchParams.get('id')

  useEffect(() => {
    if (!subscriberId) {
      setStatus('error')
      return
    }

    // Attempt to confirm subscription
    const confirmed = emailService.confirmSubscription(subscriberId)
    
    if (confirmed) {
      setStatus('success')
    } else {
      // Check if already confirmed
      const subscribers = emailService.getAllSubscribers()
      const subscriber = subscribers.find(sub => sub.id === subscriberId)
      
      if (subscriber && subscriber.confirmed) {
        setStatus('already-confirmed')
      } else {
        setStatus('error')
      }
    }
  }, [subscriberId])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Confirming Subscription...</h1>
            <p className="text-slate-600 dark:text-slate-300">Please wait while we confirm your subscription.</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Subscription Confirmed! 🎉</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Welcome to the community! You'll now receive weekly insights on software engineering, 
              system architecture, and modern development practices.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">What to expect:</h3>
              <ul className="text-left text-slate-600 dark:text-slate-300 space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Weekly technical articles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Project updates & releases</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Exclusive development insights</span>
                </li>
              </ul>
            </div>
          </div>
        )

      case 'already-confirmed':
        return (
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Already Subscribed</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Your subscription is already active. You should be receiving our newsletter updates.
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Confirmation Failed</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              We couldn't confirm your subscription. The link may be invalid or expired.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 mb-8 max-w-md mx-auto">
              <p className="text-slate-700 dark:text-slate-300">
                Try subscribing again from our homepage, or contact us if you continue having issues.
              </p>
            </div>
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
          
          {status === 'error' && (
            <Link 
              to="/#newsletter"
              className="inline-flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              <span>Subscribe Again</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}