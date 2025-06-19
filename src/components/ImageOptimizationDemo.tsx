import React from 'react';
import { OptimizedImage, getOptimizedImageUrl, preloadImage } from '../utils/imageOptimization';

export const ImageOptimizationDemo: React.FC = () => {
  const testImage = '/sj_image.jpeg';
  
  // Generate different optimized URLs for demonstration
  const optimizedUrls = {
    thumbnail: getOptimizedImageUrl(testImage, { width: 150, height: 150, fit: 'cover' }),
    medium: getOptimizedImageUrl(testImage, { width: 400, format: 'webp', quality: 80 }),
    large: getOptimizedImageUrl(testImage, { width: 800, format: 'auto', quality: 85 }),
    blurred: getOptimizedImageUrl(testImage, { width: 300, blur: 5 })
  };

  const handlePreload = async () => {
    try {
      await preloadImage(testImage, { width: 800, format: 'webp' });
      alert('Image preloaded successfully!');
    } catch (error) {
      alert('Preload failed - this is expected in development mode');
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        🖼️ Cloudflare Image Optimization Demo
      </h2>
      
      <div className="space-y-8">
        {/* Original vs Optimized */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Original vs OptimizedImage Component
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Original img tag:</p>
              <img 
                src={testImage} 
                alt="Original" 
                className="w-32 h-32 object-cover rounded-lg border-2 border-red-200 dark:border-red-800"
              />
              <p className="text-xs text-slate-500 mt-1">Direct image load</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">OptimizedImage component:</p>
                             <OptimizedImage
                 src={testImage}
                 alt="Optimized"
                 width={128}
                 height={128}
                 customOptions={{ width: 150, height: 150, format: 'webp', quality: 85 }}
                 className="w-32 h-32 object-cover rounded-lg border-2 border-green-200 dark:border-green-800"
               />
              <p className="text-xs text-slate-500 mt-1">With lazy loading & optimization</p>
            </div>
          </div>
        </div>

        {/* Different Sizes */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Responsive Sizes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
                             <OptimizedImage
                 src={testImage}
                 alt="Thumbnail"
                 customOptions={{ width: 100, height: 100, fit: 'cover' }}
                 className="w-20 h-20 object-cover rounded-full mx-auto"
               />
               <p className="text-xs text-slate-500 mt-2">100x100 thumbnail</p>
             </div>
             <div className="text-center">
               <OptimizedImage
                 src={testImage}
                 alt="Small"
                 customOptions={{ width: 200, height: 200, fit: 'cover' }}
                 className="w-32 h-32 object-cover rounded-lg mx-auto"
               />
               <p className="text-xs text-slate-500 mt-2">200x200 small</p>
             </div>
             <div className="text-center">
               <OptimizedImage
                 src={testImage}
                 alt="Medium"
                 customOptions={{ width: 300, format: 'webp' }}
                 className="w-40 h-32 object-cover rounded-lg mx-auto"
               />
               <p className="text-xs text-slate-500 mt-2">300px WebP</p>
             </div>
             <div className="text-center">
               <OptimizedImage
                 src={testImage}
                 alt="Large"
                 customOptions={{ width: 400, quality: 90 }}
                 className="w-48 h-32 object-cover rounded-lg mx-auto"
               />
              <p className="text-xs text-slate-500 mt-2">400px HQ</p>
            </div>
          </div>
        </div>

        {/* Generated URLs */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Generated Optimization URLs
          </h3>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-xs space-y-2">
            <div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Thumbnail (150x150):</span>
              <br />
              <code className="text-slate-600 dark:text-slate-300 break-all">{optimizedUrls.thumbnail}</code>
            </div>
            <div>
              <span className="font-semibold text-green-600 dark:text-green-400">Medium WebP (400px):</span>
              <br />
              <code className="text-slate-600 dark:text-slate-300 break-all">{optimizedUrls.medium}</code>
            </div>
            <div>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Large Auto (800px):</span>
              <br />
              <code className="text-slate-600 dark:text-slate-300 break-all">{optimizedUrls.large}</code>
            </div>
            <div>
              <span className="font-semibold text-orange-600 dark:text-orange-400">Blurred (300px):</span>
              <br />
              <code className="text-slate-600 dark:text-slate-300 break-all">{optimizedUrls.blurred}</code>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Test Functions
          </h3>
          <div className="space-x-4">
            <button
              onClick={handlePreload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Preload Function
            </button>
          </div>
        </div>

        {/* Development Note */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            📝 Development Mode Note
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            In development, optimization URLs are generated but won't actually optimize images. 
            Deploy to production with Cloudflare to see real optimization benefits:
          </p>
          <ul className="list-disc list-inside text-xs text-yellow-600 dark:text-yellow-400 mt-2 space-y-1">
            <li><strong>Polish:</strong> Automatic compression (FREE)</li>
            <li><strong>Mirage:</strong> Adaptive loading (FREE)</li>
            <li><strong>Image Resizing:</strong> 100k requests/month free</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 