import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, House, Spinner, Info } from '@phosphor-icons/react';
import { NewsletterService } from '../services/newsletterService';

const StatusCard: React.FC<{
 icon: React.ReactNode;
 title: string;
 children: React.ReactNode;
}> = ({ icon, title, children }) => (
 <div className="text-left bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-8 sm:p-12 animate-fade-in w-full">
 <div className="mb-8">
 {icon}
 </div>
 <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-slate-900 dark:text-white mb-6 uppercase leading-tight">{title}</h1>
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
 icon={<Spinner className="w-12 h-12 text-slate-900 dark:text-white animate-spin" weight="bold" />}
 title="Validating Integrity..."
 >
 <p className="text-slate-600 dark:text-zinc-500 font-medium">
 Establishing connection and verifying credentials matrix.
 </p>
 </StatusCard>
 );

 case 'success':
 return (
 <StatusCard
 icon={<CheckCircle className="w-12 h-12 text-slate-900 dark:text-white" weight="bold" />}
 title="Access Authorized"
 >
 <p className="text-lg text-slate-600 dark:text-zinc-400 mb-12 font-medium">
 Subscription link valid. The system has confirmed your entry. You will now receive protocol updates.
 </p>
 <Link
 to="/"
 className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-slate-800 dark:hover:bg-slate-200"
 >
 <House className="w-4 h-4" weight="bold" />
 Return to Dashboard
 </Link>
 </StatusCard>
 );

 case 'already-confirmed':
 return (
 <StatusCard
 icon={<Info className="w-12 h-12 text-slate-900 dark:text-white" weight="bold" />}
 title="Redundant Action"
 >
 <p className="text-lg text-slate-600 dark:text-zinc-400 mb-12 font-medium">
 This endpoint is already verified. No further action is required.
 </p>
 <Link
 to="/"
 className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-slate-800 dark:hover:bg-slate-200"
 >
 <House className="w-4 h-4" weight="bold" />
 Return to Dashboard
 </Link>
 </StatusCard>
 );

 case 'error':
 default:
 return (
 <StatusCard
 icon={<XCircle className="w-12 h-12 text-slate-900 dark:text-white" weight="bold" />}
 title="Validation Failed"
 >
 <p className="text-lg text-slate-600 dark:text-zinc-400 mb-12 font-medium">
 {message || 'Unable to establish secure handshake. The link may be invalid or expired.'}
 </p>
 <Link
 to="/"
 className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-slate-800 dark:hover:bg-slate-200"
 >
 <House className="w-4 h-4" weight="bold" />
 Terminate & Return
 </Link>
 </StatusCard>
 );
 }
 };

 return (
 <div className="min-h-[100dvh] bg-white dark:bg-[#0a0a0a] flex items-center justify-center py-12 px-6">
 <div className="max-w-2xl w-full border-x border-slate-200 dark:border-zinc-800">
 {renderContent()}
 </div>
 </div>
 );
};

export const ConfirmSubscriptionPage = ConfirmSubscriptionPageComponent;
export default ConfirmSubscriptionPage; 