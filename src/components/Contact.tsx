import React from 'react'
import { Mail, MapPin, Phone, Github, Linkedin, MessageCircle, Calendar, Coffee, Video, Clock } from 'lucide-react'
import { ContactForm } from './ContactForm'
import { Newsletter } from './Newsletter'

export const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-16 lg:py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Get in Touch
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Let's discuss your project and how we can work together.
            </p>
          </div>

          {/* Quick Contact Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
            <a 
              href="mailto:saifalialjanahi@gmail.com"
              className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mb-4">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  saifalialjanahi@gmail.com
                </p>
              </div>
            </a>

            <a 
              href="tel:+96407822084101"
              className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mb-4">
                  <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Phone</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  +964 782 208 4101
                </p>
              </div>
            </a>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Location</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Al-Najaf District, Iraq
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mb-4">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 lg:p-8 border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Schedule a Meeting
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                      <Coffee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Free Consultation</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">30 min • Project discussion</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                      <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book a Meeting
                </a>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                  Available: Sunday - Thursday, 9 AM - 6 PM (GMT+3)
                </p>
              </div>

              {/* Social Links */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 lg:p-8 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Connect on Social
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="https://github.com/1saifj" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white dark:bg-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-4 transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <Github className="w-6 h-6 text-slate-700 dark:text-slate-300" />
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
                    className="flex-1 bg-white dark:bg-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-4 transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">LinkedIn</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Professional network</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Availability Status */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 lg:p-8 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Available for New Projects
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Currently accepting new projects and collaborations for full-stack development, backend architecture, and technical consultation.
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