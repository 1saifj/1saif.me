import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, FileText, User, Briefcase, Command, ArrowRight, Clock, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnalytics } from './Analytics'

interface SearchResult {
  id: string
  title: string
  type: 'blog' | 'project' | 'page' | 'skill'
  description: string
  url: string
  tags?: string[]
  priority: number
}

interface SearchBoxProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchBox: React.FC<SearchBoxProps> = ({ isOpen, onClose }) => {
  const { trackEvent } = useAnalytics()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Sample search data - this would typically come from your CMS or API
  const searchData: SearchResult[] = [
    {
      id: 'golang-backend',
      title: 'Scaling Golang Backend Architecture',
      type: 'blog',
      description: 'Building scalable microservices with Go, Docker, and Kubernetes',
      url: '/blog/golang_backend_architecture',
      tags: ['golang', 'microservices', 'docker'],
      priority: 10
    },
    {
      id: 'flutter-guide',
      title: 'Flutter Mobile Development Guide',
      type: 'blog',
      description: 'Complete guide to building cross-platform mobile apps',
      url: '/blog/flutter_mobile_development',
      tags: ['flutter', 'mobile', 'dart'],
      priority: 9
    },
    {
      id: 'about',
      title: 'About Me',
      type: 'page',
      description: 'Learn about my background and experience',
      url: '/about',
      tags: ['personal', 'experience'],
      priority: 7
    },
    {
      id: 'projects',
      title: 'Projects',
      type: 'page',
      description: 'View my portfolio of software projects',
      url: '/projects',
      tags: ['portfolio', 'code'],
      priority: 8
    },
    {
      id: 'contact',
      title: 'Contact',
      type: 'page',
      description: 'Get in touch for collaborations',
      url: '/contact',
      tags: ['contact', 'collaboration'],
      priority: 6
    }
  ]

  const searchFunction = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return []

    const queryLower = searchQuery.toLowerCase()
    
    return searchData
      .map(item => {
        let score = 0
        const titleLower = item.title.toLowerCase()
        const descLower = item.description.toLowerCase()
        
        if (titleLower.includes(queryLower)) score += 100
        if (descLower.includes(queryLower)) score += 50
        if (item.tags?.some(tag => tag.toLowerCase().includes(queryLower))) score += 75
        
        score += item.priority
        
        return { ...item, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [])

  const performSearch = useCallback((searchQuery: string) => {
    const searchResults = searchFunction(searchQuery)
    setResults(searchResults)
    setSelectedIndex(0)
    
    if (searchQuery.trim()) {
      trackEvent({
        action: 'search',
        category: 'navigation',
        label: searchQuery,
        value: searchResults.length
      })
    }
  }, [searchFunction, trackEvent])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    performSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    if (query.trim()) {
      const newRecentSearches = [
        query,
        ...recentSearches.filter(s => s !== query)
      ].slice(0, 5)
      setRecentSearches(newRecentSearches)
      localStorage.setItem('portfolio-recent-searches', JSON.stringify(newRecentSearches))
    }
    
    trackEvent({
      action: 'search_result_click',
      category: 'navigation',
      label: `${result.type}:${result.title}`
    })
    
    navigate(result.url)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex])
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="w-4 h-4" />
      case 'project': return <Briefcase className="w-4 h-4" />
      case 'page': return <User className="w-4 h-4" />
      case 'skill': return <Tag className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'text-blue-600 dark:text-blue-400'
      case 'project': return 'text-green-600 dark:text-green-400'
      case 'page': return 'text-purple-600 dark:text-purple-400'
      case 'skill': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent searches:', e)
      }
    }
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-20 px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, articles, skills..."
              className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none text-lg"
            />
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400">
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                  <Command className="w-3 h-3" />
                </div>
                <span>+</span>
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">K</div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">No results found</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                  Try searching for "React", "Golang", or "Projects"
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left ${
                      index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <div className={`${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">
                        {result.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {result.description}
                      </p>
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {result.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!query && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">Start typing to search</p>
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-500">
                  <p>Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['React', 'Golang', 'Projects', 'Flutter', 'About'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setQuery(suggestion)
                          performSearch(suggestion)
                        }}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchBox 