import React, { useState } from 'react';
import { emailService, subscriberService, analyticsService } from '../services/newsletterService';

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

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Newsletter Integration Test Page
          </h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              Test the Firebase + Cloudflare Workers newsletter integration.
            </p>
            
            {/* Worker Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Cloudflare Worker Status</h3>
                <div className="flex items-center space-x-2">
                  {workerHealth === null && (
                    <span className="text-gray-500">Unknown</span>
                  )}
                  {workerHealth === true && (
                    <span className="text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Healthy
                    </span>
                  )}
                  {workerHealth === false && (
                    <span className="text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Unhealthy
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Worker URL: https://cloudflare-worker.1saifj.workers.dev
              </p>
            </div>

            {/* Test Email Input */}
            <div className="mb-6">
              <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test email address"
              />
            </div>

            {/* Test Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={testWorkerHealth}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : '🔍 Test Worker Health'}
              </button>
              
              <button
                onClick={testSubscription}
                disabled={loading || !testEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : '📧 Test Subscription'}
              </button>
              
              <button
                onClick={testAnalytics}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : '📊 Test Analytics'}
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                🗑️ Clear Results
              </button>
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test Results</h2>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      result.success 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{result.test}</h3>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className={`font-medium ${getStatusColor(result.success)}`}>
                      {result.success ? '✅' : '❌'} {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                          View Data
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. First, test worker health to ensure Cloudflare Worker is responding</li>
              <li>2. Test email subscription to verify Firebase + Worker email flow</li>
              <li>3. Check analytics to ensure data is being tracked properly</li>
              <li>4. Check your email (if using a real address) for confirmation emails</li>
              <li>5. Monitor Cloudflare Worker logs in the dashboard for debugging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterTestPage; 