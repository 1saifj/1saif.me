import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Home, Loader2, Info } from 'lucide-react';
import { NewsletterService } from '../services/newsletterService';

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

const ConfirmSubscriptionPageComponent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-confirmed'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link. Please check the URL.');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const result = await NewsletterService.confirmSubscription(token);
        
        if (result.success) {
          if (result.message.includes('already been confirmed')) {
            setStatus('already-confirmed');
          } else {
            setStatus('success');
          }
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        console.error('Subscription confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };
    
    confirmSubscription();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <StatusCard
            icon={<Loader2 className="w-8 h-8 text-orange-500 animate-spin" />}
            title="Confirming Subscription..."
          >
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we confirm your email address.
            </p>
          </StatusCard>
        );

      case 'success':
        return (
          <StatusCard
            icon={<CheckCircle className="w-8 h-8 text-green-500" />}
            title="Subscription Confirmed!"
          >
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Thank you for subscribing! You'll receive a welcome email shortly with valuable insights and updates.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-200 transition-colors font-medium shadow-md"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Homepage
            </Link>
          </StatusCard>
        );

      case 'already-confirmed':
        return (
          <StatusCard
            icon={<Info className="w-8 h-8 text-blue-500" />}
            title="Already Confirmed"
          >
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              This email address has already been confirmed. Thank you for being a subscriber!
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-200 transition-colors font-medium shadow-md"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Homepage
            </Link>
          </StatusCard>
        );

      case 'error':
      default:
        return (
          <StatusCard
            icon={<XCircle className="w-8 h-8 text-red-500" />}
            title="Confirmation Failed"
          >
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {message || 'We couldn\'t confirm your subscription. The link may be invalid or expired.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-200 transition-colors font-medium shadow-md"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Homepage
            </Link>
          </StatusCard>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-8">
        {renderContent()}
      </div>
    </div>
  );
};

export const ConfirmSubscriptionPage = ConfirmSubscriptionPageComponent;
export default ConfirmSubscriptionPage; 