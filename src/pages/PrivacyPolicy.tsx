import React from 'react'
import { Navigation } from '../components/Navigation'

export const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you contact us or subscribe to our newsletter.</p>
              
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to respond to your inquiries and provide you with updates about our work and projects.</p>
              
              <h2>3. Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
              
              <h2>4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              
              <h2>5. Your Rights</h2>
              <p>Under GDPR, you have the right to access, rectify, erase, restrict processing, object to processing, and data portability regarding your personal data.</p>
              
              <h2>6. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at saifalialjanahi@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 