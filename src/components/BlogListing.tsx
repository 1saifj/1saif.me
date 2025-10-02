import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Filter, TrendingUp, BookOpen, Search, Grid, List, ArrowRight, Star, ChevronDown, Award, Zap, Target, Tag } from 'lucide-react'
import { publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'popular' | 'trending'

export const BlogListing: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const postsPerPage = 9
  
  // Extract all unique tags
  const allTags = Array.from(new Set(publishedBlogs.flatMap(blog => blog.tags)))
  
  // Filter and search logic
  const filteredBlogs = publishedBlogs.filter(blog => {
    const matchesTag = selectedTag === 'all' || blog.tags.includes(selectedTag)
    const matchesSearch = searchQuery === '' || 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesTag && matchesSearch
  })

  // Sort logic
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt - a.createdAt
      case 'oldest':
        return a.createdAt - b.createdAt
      case 'popular':
        return b.title.length - a.title.length
      case 'trending':
        return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
      default:
        return b.createdAt - a.createdAt
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedBlogs.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedBlogs = sortedBlogs.slice(startIndex, startIndex + postsPerPage)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const estimateReadTime = (description: string) => {
    const words = description.split(' ').length
    const wordsPerMinute = 200
    return Math.ceil(words / wordsPerMinute)
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTag, searchQuery, sortBy])

  // Simulate loading for smooth UX
  const handleFilterChange = (newTag: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setSelectedTag(newTag)
      setIsLoading(false)
    }, 300)
  }

  // Get article badge based on position and content
  const getArticleBadge = (blog: any, index: number) => {
    if (index === 0) return { icon: Star, text: 'Featured', color: 'from-yellow-500 to-orange-600' }
    if (index < 3) return { icon: Award, text: 'Popular', color: 'from-blue-500 to-purple-600' }
    if (blog.tags.includes('golang')) return { icon: Zap, text: 'Technical', color: 'from-cyan-500 to-blue-600' }
    if (blog.tags.includes('research')) return { icon: Target, text: 'Research', color: 'from-emerald-500 to-green-600' }
    return { icon: BookOpen, text: 'Article', color: 'from-slate-500 to-slate-600' }
  }

  return (
    <div className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12 py-8 sm:py-12 lg:py-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-lg">
              <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4" />
              <span>Latest Technical Insights</span>
            </div>
            <h1 id="blog-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight transition-colors duration-300 px-4">
              Engineering Blog
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed transition-colors duration-300 px-4">
              Deep dives into software architecture, system design, and engineering best practices from real-world experience
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20 dark:border-slate-700/50 transition-colors duration-300">
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 sm:w-5 h-4 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between sm:justify-start">
                  {/* Tag Filter */}
                  <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 border border-slate-200 dark:border-slate-600 text-sm sm:text-base"
                    >
                      <Filter className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                      <span className="font-medium truncate">
                        {selectedTag === 'all' ? 'All Topics' : selectedTag}
                      </span>
                      <ChevronDown className={`w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilters && (
                      <div className="absolute top-full left-0 right-0 sm:left-0 sm:right-auto mt-2 w-full sm:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-64 overflow-y-auto">
                        <div className="p-2">
                          <button
                            onClick={() => {
                              handleFilterChange('all')
                              setShowFilters(false)
                            }}
                            className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                              selectedTag === 'all' 
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            All Topics ({publishedBlogs.length})
                          </button>
                          {allTags.map(tag => {
                            const count = publishedBlogs.filter(blog => blog.tags.includes(tag)).length
                            return (
                              <button
                                key={tag}
                                onClick={() => {
                                  handleFilterChange(tag)
                                  setShowFilters(false)
                                }}
                                className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                                  selectedTag === tag 
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {tag} ({count})
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort Options */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="flex-1 sm:flex-initial min-w-[120px] px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="trending">Trending</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-slate-200 dark:border-slate-600">
                    <button
                      onClick={() => {
                        console.log('Setting view to grid');
                        setViewMode('grid');
                      }}
                      className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                    <button
                      onClick={() => {
                        console.log('Setting view to list');
                        setViewMode('list');
                      }}
                      className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                        viewMode === 'list' 
                          ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 text-center">
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading articles...</span>
                </span>
              ) : (
                <>
                  Showing {paginatedBlogs.length} of {filteredBlogs.length} articles
                  {selectedTag !== 'all' && (
                    <span className="ml-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm">
                      {selectedTag}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Blog Posts Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : paginatedBlogs.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No articles found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSelectedTag('all')
                  setSearchQuery('')
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8' 
                : 'flex flex-col space-y-4 sm:space-y-6'
            }`}>
              {paginatedBlogs.map((blog, index) => {
                const badge = getArticleBadge(blog, index)
                const BadgeIcon = badge.icon

                return (
                  <article 
                    key={blog.title}
                    className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-slate-700/50 ${
                      viewMode === 'list' 
                        ? 'flex flex-col sm:flex-row hover:scale-[1.01]' 
                        : 'flex flex-col hover:scale-[1.02] sm:hover:scale-[1.03] lg:hover:scale-105 h-full'
                    }`}
                  >
                    {/* Featured Image */}
                    {blog.featuredImage && (
                      <div className={`relative overflow-hidden flex-shrink-0 ${
                        viewMode === 'list' 
                          ? 'w-full sm:w-48 md:w-64 lg:w-72 xl:w-80 h-48 sm:h-full sm:min-h-[200px]' 
                          : 'w-full h-40 sm:h-44 lg:h-48'
                      }`}>
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className={`absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 inline-flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 bg-gradient-to-r ${badge.color} text-white px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg`}>
                          <BadgeIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                          <span className="hidden xs:inline">{badge.text}</span>
                        </div>
                      </div>
                    )}

                    <div className={`flex flex-col flex-1 ${
                      viewMode === 'list' 
                        ? 'p-4 sm:p-6 lg:p-8' 
                        : 'p-4 sm:p-5 lg:p-6'
                    }`}>
                      {/* Badge for posts without featured image */}
                      {!blog.featuredImage && (
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className={`inline-flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 bg-gradient-to-r ${badge.color} text-white px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg`}>
                            <BadgeIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                            <span>{badge.text}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className={`font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                          viewMode === 'list' 
                            ? 'text-lg sm:text-xl lg:text-2xl line-clamp-2'
                            : 'text-base sm:text-lg lg:text-xl line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]'
                        }`}>
                          {blog.title}
                        </h3>
                        
                        <p className={`text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 leading-relaxed ${
                          viewMode === 'list'
                            ? 'text-sm sm:text-base lg:text-lg line-clamp-2 sm:line-clamp-3'
                            : 'text-xs sm:text-sm lg:text-base line-clamp-3'
                        }`}>
                          {blog.description || 'No description available.'}
                        </p>
                      </div>

                      <div className="mt-auto">
                        <div className={`flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 ${
                          viewMode === 'list' ? 'sm:gap-3' : ''
                        }`}>
                          {blog.tags.slice(0, viewMode === 'list' ? 5 : 3).map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleFilterChange(tag)}
                              className={`inline-flex items-center px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                                viewMode === 'list' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
                              }`}
                            >
                              <Tag className="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-0.5 sm:mr-1 lg:mr-1.5" />
                              <span>{tag}</span>
                            </button>
                          ))}
                          {blog.tags.length > (viewMode === 'list' ? 5 : 3) && (
                            <span className={`px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full ${
                              viewMode === 'list' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
                            }`}>
                              +{blog.tags.length - (viewMode === 'list' ? 5 : 3)} more
                            </span>
                          )}
                        </div>

                        <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
                          <div className={`flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 ${
                            viewMode === 'list' 
                              ? 'text-xs sm:text-sm lg:text-base' 
                              : 'text-[10px] sm:text-xs lg:text-sm'
                          }`}>
                            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                              <div className="flex items-center space-x-0.5 sm:space-x-1">
                                <Calendar className="w-3 sm:w-3.5 lg:w-4 h-3 sm:h-3.5 lg:h-4" />
                                <time dateTime={new Date(blog.createdAt).toISOString()} className="hidden sm:inline">
                                  {formatDate(blog.createdAt)}
                                </time>
                                <time dateTime={new Date(blog.createdAt).toISOString()} className="sm:hidden">
                                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </time>
                              </div>
                              <div className="flex items-center space-x-0.5 sm:space-x-1">
                                <Clock className="w-3 sm:w-3.5 lg:w-4 h-3 sm:h-3.5 lg:h-4" />
                                <span>{estimateReadTime(blog.description)} min</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            to={`/blog/${createSlugFromTitle(blog.title)}`}
                            className={`group/link inline-flex items-center justify-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium sm:font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] sm:hover:scale-105 ${
                              viewMode === 'list'
                                ? 'w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-sm sm:text-base'
                                : 'w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base'
                            }`}
                          >
                            <BookOpen className={`${
                              viewMode === 'list'
                                ? 'w-4 sm:w-5 h-4 sm:h-5'
                                : 'w-3.5 sm:w-4 lg:w-5 h-3.5 sm:h-4 lg:h-5'
                            }`} />
                            <span>Read Article</span>
                            <ArrowRight className={`group-hover/link:translate-x-0.5 sm:group-hover/link:translate-x-1 transition-transform ${
                              viewMode === 'list'
                                ? 'w-3.5 sm:w-4 h-3.5 sm:h-4'
                                : 'w-3 sm:w-3.5 lg:w-4 h-3 sm:h-3.5 lg:h-4'
                            }`} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 sm:mt-12 lg:mt-16 flex justify-center">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md sm:rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm lg:text-base"
                  aria-label="Previous page"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                
                {/* Mobile: Show limited page numbers */}
                <div className="flex items-center space-x-1 sm:hidden">
                  {currentPage > 2 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs"
                      >
                        1
                      </button>
                      {currentPage > 3 && <span className="px-1 text-slate-500">...</span>}
                    </>
                  )}
                  
                  {[...Array(totalPages)].slice(
                    Math.max(0, currentPage - 2),
                    Math.min(totalPages, currentPage + 1)
                  ).map((_, idx) => {
                    const pageNum = Math.max(1, currentPage - 1) + idx
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2 py-1.5 rounded-md transition-colors text-xs ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && <span className="px-1 text-slate-500">...</span>}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                {/* Desktop: Show all page numbers */}
                <div className="hidden sm:flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md sm:rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm lg:text-base"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 