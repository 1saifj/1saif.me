import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Rss, Search } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import SearchBox from './SearchBox'
import { publishedBlogs } from '../data/blogs'
import { downloadRSSFeed } from '../utils/rssGenerator'

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
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

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '/resume', label: 'Resume', isRoute: true },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#blog', label: 'Blog' },
    { href: '#research', label: 'Research' },
    { href: '#contact', label: 'Contact' }
  ]

  const handleNavigation = (link: { href: string; label: string; isRoute?: boolean }) => {
    if (link.isRoute) {
      // Navigate to route
      window.location.href = link.href
    } else if (isHomePage) {
      // Scroll to section on homepage
      const element = document.querySelector(link.href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Navigate to homepage with section hash
      window.location.href = `/${link.href}`
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogoClick = () => {
    if (isHomePage) {
      const element = document.querySelector('#home')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleRSSDownload = () => {
    downloadRSSFeed(publishedBlogs)
  }

  const linkClass = isScrolled || !isHomePage
    ? 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
    : 'text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80'

  const navBgClass = isScrolled || !isHomePage
    ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xl'
    : 'bg-white/10 dark:bg-slate-900/10 backdrop-blur-md'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}>
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
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`${linkClass} font-medium transition-colors`}
                >
                  {link.label}
                </Link>
              ) : isHomePage ? (
                <button
                  key={link.href}
                  onClick={() => handleNavigation(link)}
                  className={`${linkClass} font-medium transition-colors`}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={`/${link.href}`}
                  className={`${linkClass} font-medium transition-colors`}
                >
                  {link.label}
                </Link>
              )
            ))}
            
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Search (⌘K)"
            >
              <Search className="w-5 h-5" />
            </button>
            
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
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`${linkClass} transition-colors`}
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${linkClass} transition-colors`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={`md:hidden backdrop-blur-md border-t transition-colors duration-300 ${isScrolled || !isHomePage ? 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800' : 'bg-transparent border-transparent'}`}>
            <div className="py-4 space-y-2">
              {navLinks.map(link => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`block w-full text-left px-4 py-2 ${linkClass} hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : isHomePage ? (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link)}
                    className={`block w-full text-left px-4 py-2 ${linkClass} hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={`/${link.href}`}
                    className={`block w-full text-left px-4 py-2 ${linkClass} hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center space-x-2 w-full text-left px-4 py-2 ${linkClass} hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors`}
              >
                <Search className="w-4 h-4" />
                <span>Search (⌘K)</span>
              </button>
              
              <button
                onClick={handleRSSDownload}
                className={`flex items-center space-x-2 w-full text-left px-4 py-2 ${linkClass} hover:bg-white/10 dark:hover:bg-slate-800/50 transition-colors`}
              >
                <Rss className="w-4 h-4" />
                <span>RSS Feed</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Box */}
      <SearchBox 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </nav>
  )
}