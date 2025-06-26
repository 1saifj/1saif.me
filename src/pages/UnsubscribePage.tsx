import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Home, MessageCircle, Loader2, Info, Send } from 'lucide-react'
import { NewsletterService } from '../services/newsletterService'

const StatusCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="text-center bg-white dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8 lg:p-12 animate-fade-in">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-opacity-10">
      {icon}
    </div>
    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">{title}</h1>
    {children}
  </div>
);

const FeedbackForm: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
    // Optionally clear the form after a delay
    setTimeout(() => {
        setFeedback('');
        // You might want to hide the form or show a persistent success message
    }, 3000);
  };
  
  if (submitted) {
    return (
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
            <p className="text-green-700 dark:text-green-300">Thank you for your feedback!</p>
        </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/80 dark:border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white text-center mb-3">
            <MessageCircle className="inline-block w-5 h-5 mr-2" />
            Sorry to see you go.
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
            We're always looking to improve. Would you share why you unsubscribed?
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Your feedback is valuable..."
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                rows={3}
            />
            <button
                type="submit"
                disabled={!feedback.trim()}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
                <Send className="w-4 h-4 mr-2" />
                Send Feedback
            </button>
        </form>
    </div>
  )
}

const UnsubscribePageComponent: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-unsubscribed'>('loading')
  const [message, setMessage] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid unsubscribe link. Please check the URL.')
      return
    }

    const handleUnsubscribe = async () => {
      try {
        const result = await NewsletterService.unsubscribe(token)
        
        if (result.success) {
          if (result.message.includes('already unsubscribed')) {
            setStatus('already-unsubscribed')
          } else {
            setStatus('success')
          }
        } else {
          setStatus('error')
          setMessage(result.message)
        }
      } catch (error) {
        console.error('Unsubscribe error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }
    
    handleUnsubscribe()
  }, [token])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <StatusCard
            icon={<Loader2 className="w-8 h-8 text-orange-500 animate-spin" />}
            title="Processing Request..."
          >
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we process your unsubscribe request.
            </p>
          </StatusCard>
        )

      case 'success':
        return (
          <StatusCard
            icon={<CheckCircle className="w-8 h-8 text-green-500" />}
            title="Successfully Unsubscribed"
          >
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              You have been removed from our mailing list. We're sorry to see you go!
            </p>
            <FeedbackForm />
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Stay connected through other channels:
              </p>
              <div className="flex justify-center space-x-4 mb-6">
                <Link
                  to="/blog"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Blog
                </Link>
                <Link
                  to="/projects"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Projects
                </Link>
              </div>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-200 transition-colors font-medium shadow-md"
              >
                <Home className="w-5 h-5 mr-2" />
                Return to Homepage
              </Link>
            </div>
          </StatusCard>
        )

      case 'already-unsubscribed':
        return (
          <StatusCard
            icon={<Info className="w-8 h-8 text-blue-500" />}
            title="Already Unsubscribed"
          >
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              This email address is already unsubscribed from our newsletter.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-200 transition-colors font-medium shadow-md"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Homepage
            </Link>
          </StatusCard>
        )

      case 'error':
      default:
        return (
          <StatusCard
            icon={<XCircle className="w-8 h-8 text-red-500" />}
            title="Request Failed"
          >
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {message || 'We couldn\'t process your unsubscribe request. The link may be invalid or expired.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-200 transition-colors font-medium shadow-md"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Homepage
            </Link>
          </StatusCard>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-8">
        {renderContent()}
      </div>
    </div>
  )
}

export const UnsubscribePage = UnsubscribePageComponent
export default UnsubscribePage