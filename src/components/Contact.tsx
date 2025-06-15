import React from 'react'
import { Mail, MapPin, Phone, Github, Linkedin, MessageCircle } from 'lucide-react'
import { ContactForm } from './ContactForm'
import { CalendarBooking } from './CalendarBooking'
import { Newsletter } from './Newsletter'

export const Contact: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg">
              <MessageCircle className="w-4 h-4" />
              <span>Let's Connect</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
              Get In Touch
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Ready to bring your ideas to life? Let's discuss how we can work together 
              to build something amazing.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 mb-20">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-8">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="bg-blue-600 rounded-xl p-3">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Email</h4>
                      <a 
                        href="mailto:saifalialjanahi@gmail.com" 
                        className="text-slate-300 hover:text-blue-400 transition-colors"
                      >
                        saifalialjanahi@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="bg-green-600 rounded-xl p-3">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Phone</h4>
                      <a 
                        href="tel:+96407822084101" 
                        className="text-slate-300 hover:text-green-400 transition-colors"
                      >
                        +964 782 208 4101
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="bg-purple-600 rounded-xl p-3">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Location</h4>
                      <p className="text-slate-300">Al-Najaf District, Iraq</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6">Connect on Social</h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://github.com/1saifj" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-110 border border-white/20"
                  >
                    <Github className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/1saifj" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-110 border border-white/20"
                  >
                    <Linkedin className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" />
                  </a>
                </div>
              </div>

              {/* Availability */}
              <div className="p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl border border-green-500/30">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h4 className="font-semibold text-white">Available for Projects</h4>
                </div>
                <p className="text-green-100 text-sm">
                  Currently accepting new projects and collaborations. 
                  Let's build something great together!
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>

            {/* Calendar Booking */}
            <div>
              <CalendarBooking />
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mb-12">
            <Newsletter />
          </div>

          {/* Footer */}
          <div className="text-center pt-12 border-t border-white/20">
            <p className="text-slate-400">
              © 2025 Saif Aljanahi. Built with React, TypeScript, and Tailwind CSS.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}