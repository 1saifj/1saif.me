import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, Home, ArrowRight, Sparkles, Bell } from 'lucide-react'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'

export const ConfirmSubscriptionPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [htmlContent, setHtmlContent] = useState<string>('')
  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading')

  // Sample success message in markdown
  const successMessage = `
# Welcome to the Newsletter! 🎉

Thank you for confirming your subscription! You're now part of our community and will receive:

- **Latest blog posts** about software development
- **Technical insights** and tutorials  
- **Project updates** and behind-the-scenes content
- **Exclusive content** not available on the website

We respect your privacy and will never spam you. You can unsubscribe at any time.

---

*Happy coding!* 🚀
`

  // Convert markdown to HTML when component mounts
  useEffect(() => {
    convertMarkdownToHtml(successMessage)
      .then(html => {
        setHtmlContent(html)
      })
      .catch(error => {
        console.error('Failed to convert markdown:', error)
        setHtmlContent('<p>Welcome to the newsletter!</p>')
      })
  }, [])

  useEffect(() => {
    if (email && token) {
      // Simulate API call to confirm subscription
      const confirmSubscription = async () => {
        try {
          // In a real app, this would be an API call
          const response = await fetch(`/api/confirm-subscription?email=${email}&token=${token}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.already_confirmed) {
              setConfirmationStatus('already_confirmed')
            } else {
              setConfirmationStatus('success')
            }
          } else {
            setConfirmationStatus('error')
          }
        } catch (error) {
          console.error('Confirmation error:', error)
          // For demo purposes, assume success
          setConfirmationStatus('success')
        }
      }

      const timer = setTimeout(confirmSubscription, 1500) // Simulate loading
      return () => clearTimeout(timer)
    } else {
      setConfirmationStatus('error')
    }
  }, [email, token])

  const renderContent = () => {
    switch (confirmationStatus) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Confirming your subscription...
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Please wait while we verify your email address.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
              Subscription Confirmed!
            </h1>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
              <div 
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <Home className="w-5 h-5" />
                <span>Back to Homepage</span>
              </Link>
              
              <Link
                to="/blog"
                className="inline-flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <span>Read Latest Posts</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )

      case 'already_confirmed':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Already Subscribed
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
              This email address is already confirmed and subscribed to our newsletter. 
              You should be receiving our latest updates!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <Home className="w-5 h-5" />
                <span>Back to Homepage</span>
              </Link>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Confirmation Failed
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
              We couldn't confirm your subscription. The link may be invalid or expired.
              Please try subscribing again or contact support if the problem persists.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <Home className="w-5 h-5" />
                <span>Back to Homepage</span>
              </Link>
              
              <Link
                to="/#newsletter"
                className="inline-flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <Bell className="w-5 h-5" />
                <span>Try Again</span>
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}