import React, { useState } from 'react';
import { emailService, subscriberService, analyticsService } from '../services/newsletterService';
import { Link } from 'react-router-dom';
import { House } from '@phosphor-icons/react';

const NewsletterTestPage: React.FC = () => {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [workerHealth, setWorkerHealth] = useState<boolean | null>(null);

  const addResult = (result: any) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testWorkerHealth = async () => {
    setLoading(true);
    try {
      const isHealthy = await emailService.checkHealth();
      setWorkerHealth(isHealthy);
      addResult({
        test: 'Worker Health Check',
        success: isHealthy,
        message: isHealthy ? 'Cloudflare Worker is healthy' : 'Worker is not responding'
      });
    } catch (error) {
      setWorkerHealth(false);
      addResult({
        test: 'Worker Health Check',
        success: false,
        message: `Error: ${error}`
      });
    }
    setLoading(false);
  };

  const testSubscription = async () => {
    setLoading(true);
    try {
      const result = await subscriberService.subscribe(testEmail, {
        referrer: 'test-page',
        userAgent: navigator.userAgent
      });
      addResult({
        test: 'Email Subscription',
        success: result.success,
        message: result.message,
        data: result
      });
    } catch (error) {
      addResult({
        test: 'Email Subscription',
        success: false,
        message: `Error: ${error}`
      });
    }
    setLoading(false);
  };

  const testAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await analyticsService.getStats();
      addResult({
        test: 'Analytics Stats',
        success: true,
        message: 'Analytics data retrieved',
        data: stats
      });
    } catch (error) {
      addResult({
        test: 'Analytics Stats',
        success: false,
        message: `Error: ${error}`
      });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
    setWorkerHealth(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] py-24 px-6 border-x border-slate-200 dark:border-zinc-800 flex justify-center">
      <div className="w-full max-w-4xl pt-16">
         <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-12 mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase">
               Integration Test Console
            </h1>
            <Link to="/" className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
               <House weight="bold" /> Return
            </Link>
         </div>

         {/* Instructions Block */}
         <div className="border border-slate-200 dark:border-zinc-800 p-8 mb-12 bg-slate-50 dark:bg-zinc-900/10">
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-4">Diagnostics Protocol</h3>
            <ul className="text-sm font-medium text-slate-600 dark:text-zinc-400 space-y-2 list-decimal pl-4">
               <li>Test worker health module.</li>
               <li>Execute subscription parameters.</li>
               <li>Verify analytics payload injection.</li>
               <li>Monitor remote Cloudflare instances for debugging.</li>
            </ul>
         </div>

         {/* Tests block */}
         <div className="flex flex-col gap-12 mb-16">
            {/* Health Config */}
            <div>
               <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-4 mb-6">
                  <h3 className="uppercase font-bold tracking-tight text-slate-900 dark:text-white text-xl">Cloudflare Worker</h3>
                  <div className="text-[10px] uppercase tracking-widest font-bold">
                     {workerHealth === null && <span className="text-slate-500">Uptime: Unknown</span>}
                     {workerHealth === true && <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1">Node Healthy</span>}
                     {workerHealth === false && <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1">Critical Failure</span>}
                  </div>
               </div>
               <span className="block text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-mono mb-6">Endpoint: https://cloudflare-worker.1saifj.workers.dev</span>
            </div>

            {/* Email Payload */}
            <div>
               <label htmlFor="testEmail" className="block text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-4">
                  Target Address Payload
               </label>
               <input
                 type="email"
                 id="testEmail"
                 value={testEmail}
                 onChange={(e) => setTestEmail(e.target.value)}
                 className="w-full bg-transparent border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-medium p-4 focus:outline-none focus:border-slate-900 dark:focus:border-white"
                 placeholder="Enter payload email"
               />
            </div>
         </div>

         {/* Controls Array */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-200 dark:border-zinc-800 pt-8 mb-16">
            <button onClick={testWorkerHealth} disabled={loading} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 h-16 w-full truncate border border-transparent">
               [1] Ping Worker
            </button>
            <button onClick={testSubscription} disabled={loading || !testEmail} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 h-16 w-full truncate border border-transparent">
               [2] Sub Payload
            </button>
            <button onClick={testAnalytics} disabled={loading} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 h-16 w-full truncate border border-transparent">
               [3] Fetch Data
            </button>
            <button onClick={clearResults} className="p-4 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-900 h-16 w-full border border-slate-200 dark:border-zinc-800 truncate">
               Clear Console
            </button>
         </div>

         {/* Results Screen */}
         {results.length > 0 && (
           <div className="border border-slate-200 dark:border-zinc-800 p-8 bg-slate-50 dark:bg-[#050505]">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-8 font-mono border-b border-slate-200 dark:border-zinc-800 pb-4">
               Output Logs
             </h2>
             <div className="flex flex-col gap-4 font-mono text-xs">
               {results.map((result, index) => (
                 <div key={index} className="flex flex-col border-l-2 border-slate-300 dark:border-zinc-700 pl-4 py-1">
                   <div className="flex items-center justify-between mb-2 opacity-70">
                     <span className="uppercase tracking-wider font-bold">{result.test}</span>
                     <span>{result.timestamp}</span>
                   </div>
                   <p className={`font-bold uppercase tracking-widest mb-2 ${result.success ? 'text-emerald-500' : 'text-red-500'}`}>
                     [{result.success ? 'SUCCESS' : 'FAILED'}] {result.message}
                   </p>
                   {result.data && (
                     <details className="mt-2 text-slate-500 dark:text-zinc-500 cursor-pointer">
                       <summary>ATTACHED_PAYLOAD_DATA</summary>
                       <pre className="mt-4 p-4 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] overflow-x-auto text-[10px]">
                         {JSON.stringify(result.data, null, 2)}
                       </pre>
                     </details>
                   )}
                 </div>
               ))}
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default NewsletterTestPage; 