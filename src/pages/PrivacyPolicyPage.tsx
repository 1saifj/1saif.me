import React from 'react'
import { Navigation } from '../components/Navigation'
import { Shield, Mail, Eye, Database, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react'

export const PrivacyPolicyPage: React.FC = () => {
  const contactInfo = {
    email: "saifalialjanahi@gmail.com",
    name: "Saif Ali Aljanahi",
    location: "An Najaf, Iraq"
  }

  const dataTypes = [
    {
      type: "Personal Information",
      description: "Name, email address, phone number when you contact us",
      purpose: "To respond to your inquiries and provide requested services",
      retention: "3 years from last contact"
    },
    {
      type: "Usage Analytics",
      description: "Anonymous page views, session duration, device type",
      purpose: "To improve website performance and user experience",
      retention: "24 months"
    },
    {
      type: "Newsletter Subscription",
      description: "Email address for newsletter subscriptions",
      purpose: "To send periodic updates about new content and projects",
      retention: "Until unsubscribed"
    },
    {
      type: "Technical Data",
      description: "IP address, browser type, referring website",
      purpose: "For security, analytics, and website optimization",
      retention: "12 months"
    }
  ]

  const yourRights = [
    {
      icon: Eye,
      title: "Right to Access",
      description: "You can request to see what personal data we hold about you."
    },
    {
      icon: CheckCircle,
      title: "Right to Rectification",
      description: "You can ask us to correct any inaccurate personal data we have."
    },
    {
      icon: Shield,
      title: "Right to Erasure",
      description: "You can request us to delete your personal data."
    },
    {
      icon: Database,
      title: "Right to Portability",
      description: "You can request a copy of your data in a machine-readable format."
    },
    {
      icon: AlertCircle,
      title: "Right to Object",
      description: "You can object to certain types of data processing."
    },
    {
      icon: Users,
      title: "Right to Restrict",
      description: "You can ask us to limit how we use your data."
    }
  ]

  return (
    <>
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 transition-colors duration-300">
                Privacy Policy
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                This privacy policy explains how we collect, use, and protect your personal information.
              </p>
              <div className="flex items-center justify-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 mr-2" />
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Introduction */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                1. Introduction
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                This privacy policy applies to the personal portfolio website of <strong>{contactInfo.name}</strong> 
                (referred to as "we", "us", or "our"). We are committed to protecting your privacy and being transparent 
                about how we collect, use, and share your information.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This policy complies with the General Data Protection Regulation (GDPR) and other applicable privacy laws.
              </p>
            </div>

            {/* Data We Collect */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
                2. Information We Collect
              </h2>
              <div className="space-y-6">
                {dataTypes.map((data, index) => (
                  <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{data.type}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-2"><strong>What:</strong> {data.description}</p>
                    <p className="text-slate-600 dark:text-slate-300 mb-2"><strong>Why:</strong> {data.purpose}</p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>Retention:</strong> {data.retention}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How We Use Data */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                3. How We Use Your Information
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  To respond to your contact form submissions and inquiries
                </li>
                <li className="flex items-start text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  To send newsletter updates if you have subscribed
                </li>
                <li className="flex items-start text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  To analyze website usage and improve user experience
                </li>
                <li className="flex items-start text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  To ensure website security and prevent spam
                </li>
                <li className="flex items-start text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  To comply with legal obligations
                </li>
              </ul>
            </div>

            {/* Legal Basis */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                4. Legal Basis for Processing
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Consent</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Newsletter subscriptions, contact form submissions, and cookie usage
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Legitimate Interest</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Website analytics, security monitoring, and performance optimization
                  </p>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                5. Data Sharing and Third Parties
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                We do not sell, rent, or trade your personal information. We may share data with:
              </p>
              <ul className="space-y-2">
                <li className="text-slate-600 dark:text-slate-300">
                  <strong>EmailJS:</strong> For sending contact form submissions and newsletters
                </li>
                <li className="text-slate-600 dark:text-slate-300">
                  <strong>Analytics Services:</strong> Privacy-focused analytics (Plausible, Umami, or Fathom)
                </li>
                <li className="text-slate-600 dark:text-slate-300">
                  <strong>Hosting Provider:</strong> For website hosting and content delivery
                </li>
                <li className="text-slate-600 dark:text-slate-300">
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
                6. Your Rights Under GDPR
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {yourRights.map((right, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 flex-shrink-0">
                      <right.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{right.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{right.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cookies */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                7. Cookies and Tracking
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                We use cookies and similar technologies to improve your browsing experience. You can control 
                cookie settings through our cookie banner or your browser settings.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Essential</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Required for website functionality</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Analytics</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Help us understand usage patterns</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Preferences</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Remember your settings</p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                8. Data Security
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal data:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-600 dark:text-slate-300">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-3" />
                  SSL/TLS encryption for data transmission
                </li>
                <li className="flex items-center text-slate-600 dark:text-slate-300">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-3" />
                  Secure hosting with regular security updates
                </li>
                <li className="flex items-center text-slate-600 dark:text-slate-300">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-3" />
                  Access controls and data minimization
                </li>
                <li className="flex items-center text-slate-600 dark:text-slate-300">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-3" />
                  Regular security monitoring and updates
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 border-2 border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                9. Contact Us
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                If you have any questions about this privacy policy or want to exercise your rights, please contact us:
              </p>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <a href={`mailto:${contactInfo.email}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {contactInfo.email}
                </a>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                We will respond to your request within 30 days as required by GDPR.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                10. Changes to This Policy
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any significant changes 
                by posting the new policy on this page and updating the "Last updated" date. We encourage you to 
                review this policy periodically to stay informed about how we protect your information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 