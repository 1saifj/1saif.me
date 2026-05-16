import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { List, X, Rss, MagnifyingGlass } from '@phosphor-icons/react'
import { ThemeToggle } from '../design-system'
import { SearchBox } from './SearchBox'
import { publishedBlogs } from '../data/blogs'
import { downloadRSSFeed } from '../utils/rssGenerator'
import { motion, AnimatePresence } from 'framer-motion'

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  ]

  const handleNavigation = (link: { href: string; isRoute?: boolean }) => {
    if (link.isRoute) {
      window.location.href = link.href
    } else if (isHomePage) {
      const element = document.querySelector(link.href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.location.href = `/${link.href}`
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogoClick = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-all duration-300"
      >
        <div className="container mx-auto px-6 max-w-7xl h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0 z-20">
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 group">
              <span className="font-mono font-bold text-sm tracking-tighter uppercase text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-zinc-400 transition-colors">
                [ SAIF ALJANAHI ]
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2 z-10">
            {navLinks.map(link => (
              link.isRoute ? (
                <Link key={link.href} to={link.href} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {link.label}
                </Link>
              ) : (
                <button key={link.href} onClick={() => handleNavigation(link)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {link.label}
                </button>
              )
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6 z-20">
            <button onClick={() => setIsSearchOpen(true)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white transition-colors flex items-center gap-2" title="Search (⌘K)">
              <MagnifyingGlass weight="bold" className="w-4 h-4" />
              SEARCH
            </button>
            <button onClick={() => downloadRSSFeed(publishedBlogs)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white transition-colors flex items-center gap-2" title="Download RSS Feed">
              <Rss weight="bold" className="w-4 h-4" />
              RSS
            </button>
            <div className="pl-6 border-l border-slate-200 dark:border-zinc-800 h-6 flex items-center">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center z-20 h-full border-l border-slate-200 dark:border-zinc-800 pl-4 ml-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-900 dark:text-white transition-colors" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X weight="bold" className="w-5 h-5" /> : <List weight="bold" className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Brutalist Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-16 left-0 right-0 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-zinc-800 overflow-hidden z-50 shadow-2xl"
            >
               <div className="flex flex-col">
                  {navLinks.map(link => (
                    link.isRoute ? (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        key={link.href}
                        onClick={() => handleNavigation(link)}
                        className="w-full text-left px-6 py-4 text-xs font-bold tracking-widest uppercase text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        {link.label}
                      </button>
                    )
                  ))}
                  <div className="px-6 py-6 flex items-center gap-6 bg-slate-50 dark:bg-zinc-900/40">
                     <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className="text-slate-600 dark:text-zinc-400">
                        <MagnifyingGlass weight="bold" className="w-5 h-5" />
                     </button>
                     <button onClick={() => downloadRSSFeed(publishedBlogs)} className="text-slate-600 dark:text-zinc-400">
                        <Rss weight="bold" className="w-5 h-5" />
                     </button>
                     <ThemeToggle />
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/50 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <SearchBox isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
