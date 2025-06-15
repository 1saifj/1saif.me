import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Tag, Filter, TrendingUp, BookOpen, Search, Grid, List, ArrowRight, Star, Eye, Heart, Share2, User, ChevronDown, SortAsc, SortDesc, Bookmark, MessageCircle, Award, Zap, Target } from 'lucide-react'
import { publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'popular' | 'trending'

export const Blog: React.FC = () => {
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
        // Simulate popularity based on title length (in real app, use actual metrics)
        return b.title.length - a.title.length
      case 'trending':
        // Simulate trending based on recent updates
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

  // Get featured article (most recent)
  const featuredArticle = publishedBlogs[0]

  // Simulate engagement metrics
  const getEngagementMetrics = (index: number) => ({
    views: Math.floor(Math.random() * 5000) + 500,
    likes: Math.floor(Math.random() * 200) + 10,
    comments: Math.floor(Math.random() * 50) + 2,
    bookmarks: Math.floor(Math.random() * 100) + 5
  })

  // Determine if article is featured (only first 3 articles)
  const isFeatured = (index: number) => index < 3

  // Get article badge based on position and content
  const getArticleBadge = (blog: any, index: number) => {
    if (index === 0) return { icon: Star, text: 'Featured', color: 'from-yellow-500 to-orange-600' }
    if (index < 3) return { icon: Award, text: 'Popular', color: 'from-blue-500 to-purple-600' }
    if (blog.tags.includes('golang')) return { icon: Zap, text: 'Technical', color: 'from-cyan-500 to-blue-600' }
    if (blog.tags.includes('research')) return { icon: Target, text: 'Research', color: 'from-emerald-500 to-green-600' }
    return { icon: BookOpen, text: 'Article', color: 'from-slate-500 to-slate-600' }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg">
              <TrendingUp className="w-4 h-4" />
              <span>Latest Technical Insights</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight transition-colors duration-300">
              Engineering Blog
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
              Deep dives into <strong className="text-slate-900 dark:text-white">software architecture</strong>, <strong className="text-slate-900 dark:text-white">system design</strong>, 
              and <strong className="text-slate-900 dark:text-white">engineering best practices</strong> from real-world experience
            </p>
          </div>

          {/* Featured Article Hero */}
          {featuredArticle && (
            <div className="mb-20">
              <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                
                <div className="relative p-8 md:p-16">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          <Star className="w-4 h-4 inline mr-2" />
                          Featured Article
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                          Latest
                        </div>
                      </div>
                      
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                        {featuredArticle.title}
                      </h3>
                      
                      <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                        {featuredArticle.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100 mb-8">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Saif Aljanahi</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <time dateTime={new Date(featuredArticle.createdAt).toISOString()}>
                            {formatDate(featuredArticle.createdAt)}
                          </time>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{estimateReadTime(featuredArticle.description)} min read</span>
                        </div>
                      </div>

                      <Link 
                        to={`/blog/${createSlugFromTitle(featuredArticle.title)}`}
                        className="group inline-flex items-center space-x-3 bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-slate-100 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:scale-105"
                      >
                        <BookOpen className="w-5 h-5" />
                        <span>Read Full Article</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    <div className="relative">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                        <div className="flex flex-wrap gap-3 mb-6">
                          {featuredArticle.tags.slice(0, 4).map(tag => (
                            <span 
                              key={tag}
                              className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm border border-white/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-white/80">
                            <div className="flex items-center space-x-2">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">2.4k views</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 hover:text-white transition-colors">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm">124</span>
                              </button>
                              <button className="flex items-center space-x-1 hover:text-white transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm">Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Search and Filter Bar */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-12 border border-white/50 dark:border-slate-700/50 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or technologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1 shadow-inner transition-colors duration-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-md' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-md' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-sm ${
                  showFilters 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Expandable Tag Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-sm ${
                      selectedTag === 'all'
                        ? 'bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-700 dark:to-slate-600 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    All Articles ({publishedBlogs.length})
                  </button>
                  {allTags.map(tag => {
                    const count = publishedBlogs.filter(blog => blog.tags.includes(tag)).length
                    return (
                      <button
                        key={tag}
                        onClick={() => handleFilterChange(tag)}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-200 capitalize shadow-sm ${
                          selectedTag === tag
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
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

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-slate-600 dark:text-slate-300 transition-colors duration-300">
              <span className="font-semibold text-slate-900 dark:text-white">{filteredBlogs.length}</span> articles found
              {searchQuery && (
                <span> for "<span className="font-semibold text-slate-900 dark:text-white">{searchQuery}</span>"</span>
              )}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Enhanced Blog Posts Grid/List */}
          {!isLoading && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {paginatedBlogs.map((blog, index) => {
                    const slug = createSlugFromTitle(blog.title)
                    const metrics = getEngagementMetrics(index)
                    const badge = getArticleBadge(blog, index)
                    
                    return (
                      <article 
                        key={`${blog.title}-${index}`}
                        className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                      >
                        {/* Enhanced Card Header with Gradient */}
                        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-700 dark:via-blue-900/20 dark:to-purple-900/20 p-6 pb-4 transition-colors duration-300">
                          {/* Dynamic Badge */}
                          <div className={`absolute top-4 right-4 bg-gradient-to-r ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                            <badge.icon className="w-3 h-3 inline mr-1" />
                            {badge.text}
                          </div>

                          {/* Article Meta */}
                          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors duration-300">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1 bg-white/70 dark:bg-slate-600/70 backdrop-blur-sm rounded-full px-3 py-1 border border-white/50 dark:border-slate-500/50">
                                <Calendar className="w-3 h-3" />
                                <time dateTime={new Date(blog.createdAt).toISOString()}>
                                  {formatDate(blog.createdAt)}
                                </time>
                              </div>
                              <div className="flex items-center space-x-1 bg-white/70 dark:bg-slate-600/70 backdrop-blur-sm rounded-full px-3 py-1 border border-white/50 dark:border-slate-500/50">
                                <Clock className="w-3 h-3" />
                                <span>{estimateReadTime(blog.description)} min</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Title */}
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {blog.title}
                          </h3>
                          
                          {/* Enhanced Description */}
                          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed line-clamp-3 text-sm transition-colors duration-300">
                            {blog.description}
                          </p>
                        </div>

                        {/* Enhanced Card Body */}
                        <div className="px-6 pb-6">
                          {/* Enhanced Tags */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {blog.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag}
                                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-600 dark:to-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-medium hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 cursor-pointer border border-slate-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-700"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {blog.tags.length > 3 && (
                              <span className="text-slate-400 dark:text-slate-500 text-xs self-center font-medium transition-colors duration-300">
                                +{blog.tags.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Enhanced Engagement Metrics */}
                          <div className="flex items-center justify-between mb-6 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 transition-colors duration-300">
                            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{metrics.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{metrics.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{metrics.comments}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors group/btn">
                                <Bookmark className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover/btn:text-blue-500 transition-colors" />
                              </button>
                              <button className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors group/btn">
                                <Share2 className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover/btn:text-blue-500 transition-colors" />
                              </button>
                            </div>
                          </div>

                          {/* Fixed Width CTA Button */}
                          <Link 
                            to={`/blog/${slug}`}
                            className="group/link relative w-full inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white px-6 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 hover:scale-105 hover:shadow-xl overflow-hidden"
                          >
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Content */}
                            <BookOpen className="relative z-10 w-5 h-5" />
                            <span className="relative z-10">Read Article</span>
                            <ArrowRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                            
                            {/* Shine effect */}
                            <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                          </Link>
                        </div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-6 mb-12">
                  {paginatedBlogs.map((blog, index) => {
                    const slug = createSlugFromTitle(blog.title)
                    const metrics = getEngagementMetrics(index)
                    
                    return (
                      <article 
                        key={`${blog.title}-${index}`}
                        className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50 dark:border-slate-700/50"
                      >
                        <div className="p-8">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors duration-300">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <time dateTime={new Date(blog.createdAt).toISOString()}>
                                    {formatDate(blog.createdAt)}
                                  </time>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{estimateReadTime(blog.description)} min read</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{metrics.views.toLocaleString()} views</span>
                                </div>
                              </div>
                              
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {blog.title}
                              </h3>
                              
                              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-lg transition-colors duration-300">
                                {blog.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                  {blog.tags.slice(0, 3).map(tag => (
                                    <span 
                                      key={tag}
                                      className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                    >
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                  {blog.tags.length > 3 && (
                                    <span className="text-slate-400 dark:text-slate-500 text-sm self-center transition-colors duration-300">
                                      +{blog.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="lg:w-48 flex flex-col items-end space-y-4">
                              <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400 transition-colors duration-300">
                                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                                  <Heart className="w-4 h-4" />
                                  <span className="text-sm">{metrics.likes}</span>
                                </button>
                                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <Link 
                                to={`/blog/${slug}`}
                                className="group/link relative inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl overflow-hidden"
                              >
                                {/* Animated background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></div>
                                
                                {/* Content */}
                                <span className="relative z-10">Read Article</span>
                                <ArrowRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                                
                                {/* Shine effect */}
                                <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
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
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Results State */}
          {!isLoading && filteredBlogs.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 transition-colors duration-300">
                <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">No articles found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 transition-colors duration-300">
                {searchQuery 
                  ? `No articles match your search for "${searchQuery}"`
                  : `No articles found for the selected filters`
                }
              </p>
              <button
                onClick={() => {
                  setSelectedTag('all')
                  setSearchQuery('')
                }}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}