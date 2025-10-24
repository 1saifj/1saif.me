import React, { useState, useEffect } from 'react'
import { Github, Linkedin, Mail, Phone, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OptimizedImage } from '../utils/imageOptimization'

export const Hero: React.FC = () => {
  const titles = [
    'Full-Stack Engineer',
    'Backend Developer',
    'Golang Specialist',
    'System Architect',
    'Tech Lead'
  ]
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentTitleIndex((prev) => (prev + 1) % titles.length)
        setIsAnimating(false)
      }, 500)
    }, 3000)

    return () => clearInterval(interval)
  }, [])
  return (
    <section className="relative pt-16 md:pt-20 min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Profile Image with animated border */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow blur-sm"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-900">
              <OptimizedImage 
                src="/sj_image.jpeg" 
                alt="Saif Aljanahi - Full-Stack Software Engineer specializing in Golang, Python, and Flutter development"
                className="w-full h-full object-cover object-center"
                preset="avatar"
                customOptions={{ width: 160, height: 160, quality: 95 }}
                width={160}
                height={160}
              />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Saif Aljanahi
          </h1>
          
          {/* Animated title with gradient */}
          <div className="mb-8 min-h-[3.5rem] flex items-center justify-center">
            <span className={`text-2xl sm:text-3xl md:text-4xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {titles[currentTitleIndex]}
            </span>
          </div>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Building scalable, secure software solutions with Golang, Python, Flutter, and Clean Architecture.
          </p>
          
          {/* CTA */}
          <div className="mb-12">
            <Link 
              to="/resume"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <FileText className="w-5 h-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
              <span>View Resume</span>
            </Link>
          </div>
          
          {/* Contact */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10">
            <a href="tel:+9647822084101" className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
              <Phone className="w-4 h-4 transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="font-medium">+964-7822084101</span>
            </a>
            <span className="hidden sm:block text-slate-300 dark:text-slate-700">•</span>
            <a href="mailto:saifalialjanahi@gmail.com" className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
              <Mail className="w-4 h-4 transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="font-medium">saifalialjanahi@gmail.com</span>
            </a>
          </div>
          
          {/* Social */}
          <div className="flex justify-center gap-6">
            <a 
              href="https://github.com/1saifj" 
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105"
              aria-label="Visit Saif Aljanahi's GitHub profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
              <span className="font-medium">GitHub</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/1saifj" 
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105"
              aria-label="Connect with Saif Aljanahi on LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-5 h-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
              <span className="font-medium">LinkedIn</span>
            </a>
            <a 
              href="mailto:saifalialjanahi@gmail.com" 
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105"
              aria-label="Send email to Saif Aljanahi"
            >
              <Mail className="w-5 h-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
              <span className="font-medium">Email</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
