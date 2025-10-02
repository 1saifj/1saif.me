import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, FileText, User, Briefcase, Command, ArrowRight, Clock, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnalytics } from './Analytics'
import { algoliasearch } from 'algoliasearch'

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

// Initialize Algolia client
const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || 'RMUQSU88LT'
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || 'fbc4b382908b641acfcc3561bfb13e2a'
const ALGOLIA_INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'portfolio_content'

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)

export const AlgoliaSearchBox: React.FC<SearchBoxProps> = ({ isOpen, onClose }) => {
  const { trackEvent } = useAnalytics()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchAlgolia = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return []
    
    setIsLoading(true)
    try {
      const { hits } = await searchClient.initIndex(ALGOLIA_INDEX_NAME).search(searchQuery, {
        hitsPerPage: 10,
        attributesToRetrieve: ['*'],
        attributesToHighlight: []
      })

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
      console.error('Algolia search error:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const performSearch = useCallback(async (searchQuery: string) => {
    const searchResults = await searchAlgolia(searchQuery)
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
  }, [searchAlgolia, trackEvent])

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
            {isLoading && (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Searching...</p>
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">No results found</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                  Try searching for "React", "Golang", or "Projects"
                </p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
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
            {!isLoading && !query && (
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

export default AlgoliaSearchBox