import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Rss } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { publishedBlogs } from '../data/blogs'
import { downloadRSSFeed } from '../utils/rssGenerator'

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isHomePage])

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#resume', label: 'Resume' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#blog', label: 'Blog' },
    { href: '#research', label: 'Research' },
    { href: '#contact', label: 'Contact' }
  ]

  const scrollToSection = (href: string) => {
    if (isHomePage) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.location.href = `/${href}`
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogoClick = () => {
    if (isHomePage) {
      scrollToSection('#home')
    }
  }

  const handleRSSDownload = () => {
    downloadRSSFeed(publishedBlogs)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHomePage
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xl' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {isHomePage ? (
            <button 
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="/sj.png" 
                alt="Saif Aljanahi Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
          ) : (
            <Link 
              to="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="/sj.png" 
                alt="Saif Aljanahi Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              isHomePage ? (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={`/${link.href}`}
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
            
            {/* RSS Feed Button */}
            <button
              onClick={handleRSSDownload}
              className="text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              title="Download RSS Feed"
            >
              <Rss className="w-5 h-5" />
            </button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
            <div className="py-4 space-y-2">
              {navLinks.map(link => (
                isHomePage ? (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={`/${link.href}`}
                    className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              ))}
              
              <button
                onClick={handleRSSDownload}
                className="flex items-center space-x-2 w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <Rss className="w-4 h-4" />
                <span>RSS Feed</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}