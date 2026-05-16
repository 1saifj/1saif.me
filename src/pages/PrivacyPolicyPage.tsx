import React from 'react'
import { Navigation } from '../components/Navigation'
import { Shield, Envelope, Eye, Database, Clock, Users, WarningCircle, CheckCircle } from '@phosphor-icons/react';

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
 icon: WarningCircle,
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
 <main className="pt-24 bg-white dark:bg-[#0a0a0a] min-h-[100dvh]">
 <div className="container mx-auto px-6 max-w-4xl py-16">
 
  {/* Document Header */}
 <div className="mb-16 border-b-2 border-slate-900 dark:border-white pb-12">
 <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">
 Privacy <br /> Policy Statement
 </h1>
 <p className="text-xl text-slate-600 dark:text-zinc-400 font-medium">
 Data collection execution parameters and user information protocols.
 </p>
 <div className="flex items-center mt-8 text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 font-mono">
 <Clock className="w-4 h-4 mr-2" weight="bold" />
 System Update Log: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
 </div>
 </div>

 <div className="border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0a0a0a]">
 {/* Introduction */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-6">
 1. Introduction Parameters
 </h2>
 <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-4">
 This privacy policy applies to the personal portfolio website of <strong>{contactInfo.name}</strong> 
 (referred to as "we", "us", or "our"). We are committed to protecting your privacy and being transparent 
 about how we collect, use, and share your information.
 </p>
 <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
 This policy complies with the General Data Protection Regulation (GDPR) and other applicable privacy laws.
 </p>
 </div>

 {/* Data We Collect */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8">
 2. Information Vectors
 </h2>
 <div className="flex flex-col border-t border-slate-200 dark:border-zinc-800">
 {dataTypes.map((data, index) => (
 <div key={index} className="flex flex-col md:flex-row border-b border-slate-200 dark:border-zinc-800 py-6">
 <h3 className="md:w-64 text-sm font-bold text-slate-900 dark:text-white mb-2 md:mb-0 uppercase tracking-wide flex items-center shrink-0">
 {data.type}
 </h3>
 <div className="flex-1 font-mono text-xs text-slate-600 dark:text-zinc-400 space-y-2">
 <p><span className="text-slate-900 dark:text-white mr-2 uppercase tracking-widest">Payload:</span> {data.description}</p>
 <p><span className="text-slate-900 dark:text-white mr-2 uppercase tracking-widest">Execution:</span> {data.purpose}</p>
 <p><span className="text-slate-900 dark:text-white mr-2 uppercase tracking-widest">Timeline:</span> {data.retention}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* How We Use Data */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8">
 3. Output Sequences
 </h2>
 <ul className="space-y-4">
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <CheckCircle className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 To respond to your contact form submissions and inquiries
 </li>
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <CheckCircle className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 To send newsletter updates if you have subscribed
 </li>
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <CheckCircle className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 To analyze website usage and improve user experience
 </li>
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <CheckCircle className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 To ensure website security and prevent spam
 </li>
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <CheckCircle className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 To comply with legal obligations
 </li>
 </ul>
 </div>

 {/* Legal Basis */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8">
 4. Legal Matrix
 </h2>
 <div className="grid md:grid-cols-2 gap-4">
 <div className="border border-slate-200 dark:border-zinc-800 p-6 bg-white dark:bg-[#050505]">
 <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Approval Protocol</h3>
 <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
 Newsletter subscriptions, contact form submissions, and cookie usage
 </p>
 </div>
 <div className="border border-slate-200 dark:border-zinc-800 p-6 bg-white dark:bg-[#050505]">
 <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">System Legitimate Interest</h3>
 <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
 Website analytics, security monitoring, and performance optimization
 </p>
 </div>
 </div>
 </div>

 {/* Data Sharing */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-6">
 5. Third Party Cross-Processing
 </h2>
 <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-6">
 We do not sell, rent, or trade your personal information. We may share data with:
 </p>
 <ul className="space-y-4 font-mono text-xs">
 <li className="text-slate-600 dark:text-zinc-400 flex flex-col md:flex-row md:items-center">
 <strong className="text-slate-900 dark:text-white md:w-48 tracking-widest uppercase">EmailJS</strong> 
 <span>For sending contact form submissions and newsletters</span>
 </li>
 <li className="text-slate-600 dark:text-zinc-400 flex flex-col md:flex-row md:items-center border-t border-slate-200 dark:border-zinc-800 pt-4">
 <strong className="text-slate-900 dark:text-white md:w-48 tracking-widest uppercase">Analytics Services</strong> 
 <span>Privacy-focused analytics (Plausible, Umami, or Fathom)</span>
 </li>
 <li className="text-slate-600 dark:text-zinc-400 flex flex-col md:flex-row md:items-center border-t border-slate-200 dark:border-zinc-800 pt-4">
 <strong className="text-slate-900 dark:text-white md:w-48 tracking-widest uppercase">Hosting Provider</strong> 
 <span>For website hosting and content delivery</span>
 </li>
 <li className="text-slate-600 dark:text-zinc-400 flex flex-col md:flex-row md:items-center border-t border-slate-200 dark:border-zinc-800 pt-4">
 <strong className="text-slate-900 dark:text-white md:w-48 tracking-widest uppercase">Legal Requirements</strong> 
 <span>When required by law or to protect our rights</span>
 </li>
 </ul>
 </div>

 {/* Your Rights */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8">
 6. User Rights & Overrides
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800">
 {yourRights.map((right, index) => (
 <div key={index} className="flex flex-col p-6 bg-white dark:bg-[#050505]">
 <right.icon className="w-8 h-8 text-slate-900 dark:text-white mb-4" weight="bold" />
 <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{right.title}</h3>
 <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">{right.description}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Cookies */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8">
 7. Active State Trackers
 </h2>
 <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-6">
 We use cookies and similar technologies to improve your browsing experience. You can control 
 cookie settings through our cookie banner or your browser settings.
 </p>
 <div className="grid md:grid-cols-3 gap-px bg-slate-200 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800">
 <div className="bg-white dark:bg-[#050505] p-6 text-center">
 <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase">Essential</h3>
 <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">Required for functionality</p>
 </div>
 <div className="bg-white dark:bg-[#050505] p-6 text-center">
 <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase">Telemetry</h3>
 <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">Usage pattern recognition</p>
 </div>
 <div className="bg-white dark:bg-[#050505] p-6 text-center">
 <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase">Cache</h3>
 <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">System preference storage</p>
 </div>
 </div>
 </div>

 {/* Security */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8">
 8. Encryption & Defenses
 </h2>
 <ul className="space-y-4">
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <Shield className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 SSL/TLS encryption for data transmission
 </li>
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <Shield className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 Secure hosting with regular security updates
 </li>
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <Shield className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 Access controls and data minimization
 </li>
 <li className="flex items-center font-medium text-slate-600 dark:text-zinc-400">
 <Shield className="w-5 h-5 text-slate-900 dark:text-white mr-4" weight="bold" />
 Regular security monitoring and updates
 </li>
 </ul>
 </div>

 {/* Contact Information */}
 <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-zinc-800">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-6">
 9. Administrator Contact
 </h2>
 <div className="flex flex-col gap-4">
 <p className="text-slate-600 dark:text-zinc-400 font-medium">
 If you have any questions about this privacy policy or want to exercise your rights, you may ping the architect:
 </p>
 <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-4 border border-slate-900 dark:border-white p-4 w-fit hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors font-mono font-bold tracking-widest uppercase text-sm">
 <Envelope className="w-5 h-5" weight="bold" />
 {contactInfo.email}
 </a>
 <p className="text-[10px] tracking-widest uppercase text-slate-400 dark:text-zinc-500 font-mono mt-4">
 Note: GDPR compliancy dictates response SLA within 30 days.
 </p>
 </div>
 </div>

 {/* Changes to Policy */}
 <div className="p-8 lg:p-12">
 <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-4">
 10. Document Revisions
 </h2>
 <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
 We may update this privacy protocol. Significant logic changes will trigger a notification update on this node and an updated "Last updated" timestamp. Regular reviews of this protocol are recommended.
 </p>
 </div>

 </div>

 </div>
 </main>
 </>
 )
} 