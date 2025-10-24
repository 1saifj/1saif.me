import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Rss, Search } from 'lucide-react'
import { ThemeToggle } from '../design-system'
import { SearchBox } from './SearchBox'
import { publishedBlogs } from '../data/blogs'
import { downloadRSSFeed } from '../utils/rssGenerator'
import { OptimizedImage } from '../utils/imageOptimization'

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    } else {
      setIsScrolled(true)
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
        setIsMobileMenuOpen(false)
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
    { href: '#contact', label: 'Contact' },
  ]

  const handleNavigation = (link: { href: string; isRoute?: boolean }) => {
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
      document.body.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleRSSDownload = () => {
    downloadRSSFeed(publishedBlogs)
  }

  const onHero = !isScrolled && isHomePage

  const linkClass = `relative font-medium transition-colors after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:transition-all after:duration-300 after:ease-in-out hover:after:w-full text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 after:bg-blue-500`
  
  const iconButtonClass = `p-2 rounded-full transition-all duration-200 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800`

  const titleClass = `font-bold text-lg transition-colors text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400`

  const navBgClass = isScrolled
    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800/80 shadow-md'
    : 'bg-transparent'

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 group">
                <OptimizedImage 
                  src="/sj.png" 
                  alt="Saif Aljanahi Logo" 
                  className="w-9 h-9 rounded-full object-cover"
                  preset="logo"
                  customOptions={{ width: 36, height: 36, quality: 95 }}
                  width={36}
                  height={36}
                />
                <span className={titleClass}>Saif Aljanahi</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map(link => (
                link.isRoute ? (
                  <Link key={link.href} to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                ) : (
                  <button key={link.href} onClick={() => handleNavigation(link)} className={linkClass}>
                    {link.label}
                  </button>
                )
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <button onClick={() => setIsSearchOpen(true)} className={iconButtonClass} title="Search (⌘K)">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={handleRSSDownload} className={iconButtonClass} title="Download RSS Feed">
                <Rss className="w-5 h-5" />
              </button>
              <ThemeToggle />
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={iconButtonClass} aria-label="Toggle menu">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg
          transition-all duration-300 ease-in-out overflow-hidden
          ${isMobileMenuOpen ? 'max-h-[80vh] border-t border-slate-200 dark:border-slate-800' : 'max-h-0 border-t-0'}
        `}>
          <div className="py-4 px-2 space-y-1">
            {navLinks.map(link => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-left px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => handleNavigation(link)}
                  className="w-full text-left block px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              )
            ))}
            <div className="border-t border-slate-200 dark:border-slate-700 mx-4 my-2"></div>
            <div className="flex justify-around items-center pt-2">
                <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className={`${iconButtonClass} flex-1 flex justify-center`} title="Search (⌘K)">
                  <Search className="w-5 h-5" />
                </button>
                <button onClick={handleRSSDownload} className={`${iconButtonClass} flex-1 flex justify-center`} title="Download RSS Feed">
                  <Rss className="w-5 h-5" />
                </button>
                <div className="flex-1 flex justify-center">
                  <ThemeToggle />
                </div>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <SearchBox 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  )
}