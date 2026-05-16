import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, House, ChatCircle, Spinner, Info, PaperPlaneRight } from '@phosphor-icons/react';
import { NewsletterService } from '../services/newsletterService'

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

const FeedbackForm: React.FC = () => {
 const [feedback, setFeedback] = useState('');
 const [submitted, setSubmitted] = useState(false);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!feedback.trim()) return;
 // Here you would typically send the feedback to your backend
 console.log('Feedback submitted:', feedback);
 setSubmitted(true);
 setTimeout(() => {
 setFeedback('');
 }, 3000);
 };
 
 if (submitted) {
 return (
 <div className="p-8 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/10 mt-8">
 <p className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white flex items-center gap-2">
 <CheckCircle weight="bold" className="w-4 h-4 text-emerald-500" />
 Feedback Transmitted Successfully.
 </p>
 </div>
 );
 }

 return (
 <div className="mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800">
 <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide flex items-center gap-2">
 <ChatCircle className="w-4 h-4" weight="bold" />
 Departure Diagnostics
 </h3>
 <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase mb-6">
 Optional: Provide reason for disconnection.
 </p>
 <form onSubmit={handleSubmit} className="flex flex-col gap-4">
 <textarea
 value={feedback}
 onChange={(e) => setFeedback(e.target.value)}
 placeholder="Input parameters..."
 className="w-full p-4 border-b border-slate-200 dark:border-zinc-800 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-slate-900 dark:focus:border-white resize-none transition-colors"
 rows={2}
 />
 <button
 type="submit"
 disabled={!feedback.trim()}
 className="inline-flex items-center justify-between px-6 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto"
 >
 <span>Transmit Data</span>
 <PaperPlaneRight className="w-4 h-4" weight="bold" />
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
 setMessage('Invalid disconnect protocol link. Check endpoint URL.')
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
 setMessage('Connection reset by peer. External parameters block exit.')
 }
 }
 
 handleUnsubscribe()
 }, [token])

 const renderContent = () => {
 switch (status) {
 case 'loading':
 return (
 <StatusCard
 icon={<Spinner className="w-12 h-12 text-slate-900 dark:text-white animate-spin" weight="bold" />}
 title="Terminating Access..."
 >
 <p className="text-slate-600 dark:text-zinc-500 font-medium pb-8 border-b border-slate-200 dark:border-zinc-800">
 Overriding protocols and removing from secure mailing matrix.
 </p>
 </StatusCard>
 )

 case 'success':
 return (
 <StatusCard
 icon={<CheckCircle className="w-12 h-12 text-slate-900 dark:text-white" weight="bold" />}
 title="Connection Severed"
 >
 <p className="text-lg text-slate-600 dark:text-zinc-400 font-medium">
 Node successfully decoupled. Newsletter distribution halted.
 </p>
 <FeedbackForm />
 <div className="mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
 <Link
 to="/"
 className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-slate-800 dark:hover:bg-slate-200 shrink-0"
 >
 <House className="w-4 h-4" weight="bold" />
 Return to Primary
 </Link>
 <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-600 w-full sm:w-auto">
 <Link to="/#blog" className="hover:text-slate-900 dark:hover:text-white transition-colors">Feed</Link>
 <Link to="/#projects" className="hover:text-slate-900 dark:hover:text-white transition-colors">Systems</Link>
 </div>
 </div>
 </StatusCard>
 )

 case 'already-unsubscribed':
 return (
 <StatusCard
 icon={<Info className="w-12 h-12 text-slate-900 dark:text-white" weight="bold" />}
 title="Link Already Dead"
 >
 <p className="text-lg text-slate-600 dark:text-zinc-400 mb-12 font-medium border-b border-slate-200 dark:border-zinc-800 pb-12">
 The specified node is already removed from distribution lists.
 </p>
 <Link
 to="/"
 className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-slate-800 dark:hover:bg-slate-200"
 >
 <House className="w-4 h-4" weight="bold" />
 Return to Dashboard
 </Link>
 </StatusCard>
 )

 case 'error':
 default:
 return (
 <StatusCard
 icon={<XCircle className="w-12 h-12 text-slate-900 dark:text-white" weight="bold" />}
 title="Exit Blocked"
 >
 <p className="text-lg text-slate-600 dark:text-zinc-400 mb-12 font-medium border-b border-slate-200 dark:border-zinc-800 pb-12">
 {message || 'Unable to kill connection. Endpoint unresponsive or incorrect link.'}
 </p>
 <Link
 to="/"
 className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-slate-800 dark:hover:bg-slate-200"
 >
 <House className="w-4 h-4" weight="bold" />
 Terminate Sequence
 </Link>
 </StatusCard>
 )
 }
 }

 return (
 <div className="min-h-[100dvh] bg-white dark:bg-[#0a0a0a] flex items-center justify-center py-12 px-6">
 <div className="max-w-2xl w-full border-x border-slate-200 dark:border-zinc-800">
 {renderContent()}
 </div>
 </div>
 )
}

export const UnsubscribePage = UnsubscribePageComponent
export default UnsubscribePage