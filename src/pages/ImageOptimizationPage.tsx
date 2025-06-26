import React from 'react';
import { Navigation } from '../components/Navigation';
import { Contact } from '../components/Contact';
import { ImageOptimizationDemo } from '../components/ImageOptimizationDemo';

const ImageOptimizationPage: React.FC = () => {
  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              🖼️ Cloudflare Image Optimization Demo
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Test and demonstrate Cloudflare's powerful image optimization features including 
              Polish compression, Mirage adaptive loading, and dynamic resizing.
            </p>
          </div>
          
          <ImageOptimizationDemo />
          
          <div className="mt-12 sm:mt-16 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🚀 Ready for Production
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                When deployed through Cloudflare, these optimizations will automatically:
              </p>
              <ul className="list-disc list-inside text-blue-600 dark:text-blue-400 text-sm mt-2 space-y-1 text-left max-w-2xl mx-auto">
                <li>Compress images with Polish (up to 40% size reduction)</li>
                <li>Serve WebP/AVIF automatically to supporting browsers</li>
                <li>Lazy load images based on connection speed with Mirage</li>
                <li>Resize images on-demand with 100k free requests/month</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Contact />
    </>
  );
};

export default ImageOptimizationPage; 