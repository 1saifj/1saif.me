import React from 'react'
import { Mail, MapPin, Phone, Github, Linkedin, MessageCircle, Calendar, Coffee, Video, Clock } from 'lucide-react'
import { ContactForm } from './ContactForm'
import { Newsletter } from './Newsletter'

export const Contact: React.FC = () => {
  return (
    <section id="contact" className="relative py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
          <defs>
            <pattern id="contact-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contact-pattern)"/>
        </svg>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <MessageCircle className="w-4 h-4" />
              <span>Let's Connect</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Ready to Build 
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Something Amazing?
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Let's connect and discuss how we can transform your ideas into scalable, innovative solutions.
            </p>
          </div>

          {/* Quick Contact Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
            <a 
              href="mailto:saifalialjanahi@gmail.com"
              className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-3 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  saifalialjanahi@gmail.com
                </p>
              </div>
            </a>

            <a 
              href="tel:+96407822084101"
              className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-3 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Phone</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  +964 782 208 4101
                </p>
              </div>
            </a>

            <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-3 mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Location</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Al-Najaf District, Iraq
                </p>
              </div>
            </div>

            <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-3 mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Availability</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  9 AM - 5 PM (GMT+3)
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
            
            {/* Left Column - Contact Form */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Send a Message
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Tell me about your project and let's discuss how we can work together.
                </p>
                <ContactForm />
              </div>
            </div>

            {/* Right Column - Meeting Options & Social */}
            <div className="space-y-8">
              {/* Meeting Options */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 lg:p-8 border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Schedule a Meeting
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-2">
                      <Coffee className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Free Consultation</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">30 min • Project discussion</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-2">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Technical Deep Dive</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">45 min • Architecture & planning</p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://calendly.com/saifalialjanahi/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book a 30-Min Meeting
                </a>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                  Available: Sunday - Thursday, 9 AM - 6 PM (GMT+3)
                </p>
              </div>

              {/* Social Links */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 lg:p-8 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Connect on Social
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="https://github.com/1saifj" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 group bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 rounded-xl p-4 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Github className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">GitHub</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">View my code</div>
                      </div>
                    </div>
                  </a>

                  <a 
                    href="https://www.linkedin.com/in/1saifj" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 group bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/20 dark:hover:to-blue-700/20 rounded-xl p-4 transition-all duration-300 hover:shadow-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">LinkedIn</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Professional network</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Availability Status */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 lg:p-8 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    Available for New Projects
                  </h3>
                </div>
                <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                  I'm currently accepting new projects and collaborations. Whether you need a full-stack solution, 
                  backend architecture, or technical consultation, I'm here to help bring your vision to life.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mb-8 lg:mb-12">
            <Newsletter />
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © 2025 Saif Aljanahi. Built with React, TypeScript, and Tailwind CSS.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}