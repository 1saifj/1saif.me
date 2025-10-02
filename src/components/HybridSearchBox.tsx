import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, FileText, User, Briefcase, Command, ArrowRight, Clock, Tag, Wifi, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnalytics } from './Analytics'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import { publishedBlogs } from '../data/blogs'
import { projects } from '../data/projects'
import { createSlugFromTitle } from '../utils/slugUtils'

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

// Initialize Algolia client with fallback
const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || 'RMUQSU88LT'
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || 'fbc4b382908b641acfcc3561bfb13e2a'
const ALGOLIA_INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'portfolio_content'

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)

export const HybridSearchBox: React.FC<SearchBoxProps> = ({ isOpen, onClose }) => {
  const { trackEvent } = useAnalytics()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchMode, setSearchMode] = useState<'algolia' | 'local'>('algolia')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const inputRef = useRef<HTMLInputElement>(null)

  // Local search data
  const localSearchData: SearchResult[] = [
    ...publishedBlogs.map(blog => ({
      id: `blog_${createSlugFromTitle(blog.title)}`,
      title: blog.title,
      type: 'blog' as const,
      description: blog.description,
      url: `/blog/${createSlugFromTitle(blog.title)}`,
      tags: blog.tags,
      priority: 10
    })),
    ...projects.map(project => ({
      id: `project_${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      title: project.name,
      type: 'project' as const,
      description: project.description,
      url: `/projects#${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      tags: [project.language, project.sourceType].filter(Boolean),
      priority: 9
    })),
    {
      id: 'page_about',
      title: 'About Me',
      type: 'page',
      description: 'Learn about my background, experience, and journey as a software engineer',
      url: '/#about',
      tags: ['personal', 'experience', 'background'],
      priority: 8
    },
    {
      id: 'page_projects',
      title: 'Projects',
      type: 'page',
      description: 'View my portfolio of software projects and technical implementations',
      url: '/#projects',
      tags: ['portfolio', 'code', 'development'],
      priority: 7
    },
    {
      id: 'page_skills',
      title: 'Skills & Technologies',
      type: 'page',
      description: 'See my technical skills, programming languages, and expertise areas',
      url: '/#skills',
      tags: ['skills', 'technologies', 'programming'],
      priority: 6
    },
    {
      id: 'page_contact',
      title: 'Contact',
      type: 'page',
      description: 'Get in touch for collaborations, opportunities, or technical discussions',
      url: '/#contact',
      tags: ['contact', 'collaboration', 'hiring'],
      priority: 5
    }
  ]

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Algolia search function
  const searchAlgolia = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim() || !isOnline) return []
    
    try {
      const { results } = await searchClient.search({
        requests: [{
          indexName: ALGOLIA_INDEX_NAME,
          query: searchQuery,
          params: {
            hitsPerPage: 10
          }
        }]
      })
      
      const hits = results[0]?.hits || []

      return hits.map((hit: any) => ({
        id: hit.objectID || hit.id,
        title: hit.title || hit.name || 'Untitled',
        type: hit.type || 'page',
        description: hit.description || hit.summary || '',
        url: hit.url || hit.path || '/',
        tags: hit.tags || hit.categories || [],
        priority: hit.priority || 5
      }))
    } catch (error) {
      console.warn('Algolia search failed, falling back to local search:', error)
      setSearchMode('local')
      return []
    }
  }, [isOnline])

  // Local search function with fuzzy matching
  const searchLocal = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return []
    
    const queryLower = searchQuery.toLowerCase()
    
    return localSearchData
      .map(item => {
        let score = 0
        
        // Exact title match gets highest score
        if (item.title.toLowerCase() === queryLower) score += 1000
        
        // Title contains query
        if (item.title.toLowerCase().includes(queryLower)) score += 200
        
        // Description contains query
        if (item.description.toLowerCase().includes(queryLower)) score += 100
        
        // Tag matches
        if (item.tags?.some(tag => tag.toLowerCase().includes(queryLower))) score += 75
        
        // Fuzzy matching for typos
        const titleWords = item.title.toLowerCase().split(' ')
        const queryWords = queryLower.split(' ')
        
        queryWords.forEach(queryWord => {
          titleWords.forEach(titleWord => {
            // Simple fuzzy matching - words that start with the same letters
            if (titleWord.startsWith(queryWord.substring(0, Math.min(3, queryWord.length)))) {
              score += 25
            }
          })
        })
        
        score += item.priority
        
        return { ...item, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [])

  // Hybrid search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    setIsLoading(true)
    let searchResults: SearchResult[] = []

    // Try Algolia first if online and in Algolia mode
    if (searchMode === 'algolia' && isOnline) {
      searchResults = await searchAlgolia(searchQuery)
      
      // If Algolia fails or returns no results, fallback to local
      if (searchResults.length === 0) {
        searchResults = searchLocal(searchQuery)
        setSearchMode('local') // Switch mode for this session
      }
    } else {
      // Use local search directly
      searchResults = searchLocal(searchQuery)
    }

    setResults(searchResults)
    setSelectedIndex(0)
    setIsLoading(false)
    
    if (searchQuery.trim()) {
      trackEvent({
        action: 'search',
        category: 'navigation',
        label: searchQuery,
        value: searchResults.length
      })
    }
  }, [searchAlgolia, searchLocal, searchMode, isOnline, trackEvent])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    performSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
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
              {isLoading && (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
              )}
              
              {/* Search mode indicator */}
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className={`w-3 h-3 ${searchMode === 'algolia' ? 'text-green-500' : 'text-yellow-500'}`} />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs ${searchMode === 'algolia' && isOnline ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {!isOnline ? 'Offline' : searchMode === 'algolia' ? 'Cloud' : 'Local'}
                </span>
              </div>
              
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
            {query && results.length === 0 && !isLoading && (
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
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-start space-x-3 ${
                      index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className={`mt-1 ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-slate-900 dark:text-white truncate">
                          {result.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)} bg-current/10`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {result.description}
                      </p>
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
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
                
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">Recent searches:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {recentSearches.map(search => (
                        <button
                          key={search}
                          onClick={() => {
                            setQuery(search)
                            performSearch(search)
                          }}
                          className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-1"
                        >
                          <Clock className="w-3 h-3" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HybridSearchBox