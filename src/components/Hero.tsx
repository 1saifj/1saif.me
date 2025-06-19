import React, { useState, useEffect } from 'react'
import { ChevronDown, Github, Linkedin, Mail, Phone, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const titles = [
  "Full-Stack Engineer",
  "System Architect", 
  "Golang Developer",
  "Flutter Developer",
  "Python Developer"
]

export const Hero: React.FC = () => {
  const [currentTitle, setCurrentTitle] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentFullTitle = titles[currentTitle]
      
      if (!isDeleting) {
        setDisplayText(currentFullTitle.substring(0, displayText.length + 1))
        
        if (displayText === currentFullTitle) {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        setDisplayText(currentFullTitle.substring(0, displayText.length - 1))
        
        if (displayText === '') {
          setIsDeleting(false)
          setCurrentTitle((prev) => (prev + 1) % titles.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timer)
  }, [displayText, isDeleting, currentTitle])

  return (
    <section className="pt-16 md:pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 dark:opacity-10"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Profile Image */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mb-8 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/20 dark:ring-white/10 hover:ring-white/40 dark:hover:ring-white/20 transition-all duration-300">
            <img 
              src="/sj_image.jpeg" 
              alt="Saif Aljanahi - Full-Stack Software Engineer specializing in Golang, Python, and Flutter development"
              className="w-full h-full object-cover object-center"
              loading="eager"
              width="160"
              height="160"
            />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            Saif Aljanahi
          </h1>
          
          <div className="h-16 mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl text-blue-300 dark:text-blue-200 font-light">
              {displayText}
              <span className="animate-pulse">|</span>
            </h2>
          </div>
          
          <p className="text-lg sm:text-xl text-gray-300 dark:text-gray-200 mb-10 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            Transforming complex business requirements into scalable, secure software solutions using 
            <strong className="text-white"> Golang</strong>, <strong className="text-white">Python</strong>, 
            <strong className="text-white"> Flutter</strong>, and <strong className="text-white">Clean Architecture</strong> principles.
          </p>
          
          {/* Resume Button */}
          <div className="mb-10">
            <Link 
              to="/resume"
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
            >
              <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
              <span>View Resume</span>
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-300 dark:text-gray-200">
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>+964-7822084101</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-300 dark:text-gray-200">
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>saifalialjanahi@gmail.com</span>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-8 mb-16">
            <a 
              href="https://github.com/1saifj" 
              className="group flex items-center space-x-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              aria-label="Visit Saif Aljanahi's GitHub profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5 text-white group-hover:text-blue-300 dark:group-hover:text-blue-200 transition-colors" aria-hidden="true" />
              <span className="text-white font-medium">GitHub</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/1saifj" 
              className="group flex items-center space-x-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              aria-label="Connect with Saif Aljanahi on LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-5 h-5 text-white group-hover:text-blue-300 dark:group-hover:text-blue-200 transition-colors" aria-hidden="true" />
              <span className="text-white font-medium">LinkedIn</span>
            </a>
            <a 
              href="mailto:saifalialjanahi@gmail.com" 
              className="group flex items-center space-x-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              aria-label="Send email to Saif Aljanahi"
            >
              <Mail className="w-5 h-5 text-white group-hover:text-blue-300 dark:group-hover:text-blue-200 transition-colors" aria-hidden="true" />
              <span className="text-white font-medium">Email</span>
            </a>
          </div>
          
          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60 dark:text-white/40 mx-auto" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}