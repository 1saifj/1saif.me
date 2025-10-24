import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Github, Filter, Wrench, Eye, Star, Code, Search, Grid, List, ArrowRight, Calendar, Users, Zap, ChevronDown, Share2, Lock, Building2, Globe } from 'lucide-react'
import { projects } from '../data/projects'
import { Language, SourceType } from '../schemas/projectSchema'
import { createSlugFromTitle } from '../utils/slugUtils'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'featured' | 'popular' | 'language'

const languageColors: Record<Language, string> = {
  typescript: 'from-blue-500 to-blue-600',
  rust: 'from-orange-500 to-red-600',
  haskell: 'from-purple-500 to-purple-600',
  go: 'from-cyan-500 to-blue-600',
  ocaml: 'from-emerald-500 to-green-600'
}

const languageLabels: Record<Language, string> = {
  typescript: 'TypeScript',
  rust: 'Rust',
  haskell: 'Haskell',
  go: 'Go',
  ocaml: 'OCaml'
}

const languageIcons: Record<Language, React.ReactNode> = {
  typescript: <Code className="w-4 h-4" />,
  rust: <Zap className="w-4 h-4" />,
  haskell: <Star className="w-4 h-4" />,
  go: <Code className="w-4 h-4" />,
  ocaml: <Code className="w-4 h-4" />
}

// Source type configuration
const sourceTypeConfig: Record<SourceType, { icon: React.ReactNode, label: string, color: string }> = {
  'open-source': { icon: <Globe className="w-4 h-4" />, label: 'Open Source', color: 'from-green-500 to-emerald-600' },
  'private': { icon: <Lock className="w-4 h-4" />, label: 'Private', color: 'from-orange-500 to-red-600' },
  'company': { icon: <Building2 className="w-4 h-4" />, label: 'Company', color: 'from-purple-500 to-indigo-600' }
}

// Helper function to get source action button
const getSourceActionButton = (project: any) => {
  if (project.isPrivate || project.sourceType === 'private' || project.sourceType === 'company') {
    return {
      label: 'View Details',
      icon: <Eye className="w-5 h-5" />,
      isExternal: false
    }
  }
  return {
    label: 'View Source',
    icon: <Github className="w-5 h-5" />,
    isExternal: true
  }
}

export const Projects: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const projectsPerPage = 6
  
  // Filter and search logic
  const filteredProjects = projects.filter(project => {
    const matchesLanguage = selectedLanguage === 'all' || project.language === selectedLanguage
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesLanguage && matchesSearch
  })

  // Sort logic
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return (a.order ?? -1) - (b.order ?? -1)
      case 'newest':
        return (b.order ?? -1) - (a.order ?? -1)
      case 'popular':
        // Simulate popularity based on name length
        return b.name.length - a.name.length
      case 'language':
        return a.language.localeCompare(b.language)
      default:
        return (a.order ?? -1) - (b.order ?? -1)
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const paginatedProjects = sortedProjects.slice(startIndex, startIndex + projectsPerPage)

  const languages: Language[] = ['typescript', 'rust', 'haskell', 'go', 'ocaml']

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedLanguage, searchQuery, sortBy])

  // Simulate loading for smooth UX
  const handleFilterChange = (newLanguage: Language | 'all') => {
    setIsLoading(true)
    setTimeout(() => {
      setSelectedLanguage(newLanguage)
      setIsLoading(false)
    }, 300)
  }

  // Get featured project (first one)
  const featuredProject = projects[0]

  return (
    <div className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12 py-8 sm:py-12 lg:py-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-lg">
              <Star className="w-3 sm:w-4 h-3 sm:h-4" />
              <span>Featured Software Projects</span>
            </div>
            <h2 id="projects-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight transition-colors duration-300 px-4">
              Project Portfolio
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed transition-colors duration-300 px-4">
              Production-ready applications showcasing expertise in system architecture, backend development, and modern technologies
            </p>
          </div>

          {/* Remove Featured Project - keeping it simple like blog listing */}

          {/* Search and Filter Controls */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20 dark:border-slate-700/50 transition-colors duration-300">
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 sm:w-5 h-4 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between sm:justify-start">
                  {/* Language Filter */}
                  <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 border border-slate-200 dark:border-slate-600 text-sm sm:text-base"
                    >
                      <Filter className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                      <span className="font-medium truncate">
                        {selectedLanguage === 'all' ? 'All Languages' : languageLabels[selectedLanguage]}
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
                              selectedLanguage === 'all' 
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            All Projects ({projects.length})
                          </button>
                          {languages.map(lang => {
                            const count = projects.filter(project => project.language === lang).length
                            return (
                              <button
                                key={lang}
                                onClick={() => {
                                  handleFilterChange(lang)
                                  setShowFilters(false)
                                }}
                                className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                                  selectedLanguage === lang 
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {languageLabels[lang]} ({count})
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
                    <option value="featured">Featured First</option>
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="language">By Language</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-slate-200 dark:border-slate-600">
                    <button
                      onClick={() => setViewMode('grid')}
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
                      onClick={() => setViewMode('list')}
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
                  <span>Loading projects...</span>
                </span>
              ) : (
                <>
                  Showing {paginatedProjects.length} of {filteredProjects.length} projects
                  {selectedLanguage !== 'all' && (
                    <span className="ml-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm">
                      {languageLabels[selectedLanguage]}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>


          {/* Projects Grid/List */}
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
          ) : paginatedProjects.length === 0 ? (
            <div className="text-center py-16">
              <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No projects found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSelectedLanguage('all')
                  setSearchQuery('')
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {paginatedProjects.map((project, index) => {
                    const slug = createSlugFromTitle(project.name)
                    
                    return (
                      <article 
                        key={`${project.name}-${index}`}
                        className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-slate-700/50 hover:scale-[1.02] sm:hover:scale-[1.03] lg:hover:scale-105 flex flex-col h-full"
                      >
                        <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <div className={`inline-flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r ${languageColors[project.language]} text-white px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg`}>
                                {languageIcons[project.language]}
                                <span>{languageLabels[project.language]}</span>
                              </div>
                              <div className={`flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r ${sourceTypeConfig[project.sourceType].color} text-white px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg`}>
                                {sourceTypeConfig[project.sourceType].icon}
                                <span className="hidden xs:inline">{sourceTypeConfig[project.sourceType].label}</span>
                              </div>
                              {project.wip && (
                                <div className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-yellow-500/30">
                                  <Wrench className="w-2.5 sm:w-3 h-2.5 sm:h-3 inline mr-1" />
                                  <span className="hidden xs:inline">WIP</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                              {project.name}
                            </h3>
                            
                            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                              {project.description}
                            </p>
                          </div>

                          <div className="mt-auto">
                            <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
                              <div className="flex items-center gap-2 sm:gap-3">
                                {(project.sourceType === 'open-source' && !project.isPrivate) ? (
                                  <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/link inline-flex items-center justify-center space-x-1.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg sm:rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 shadow-md hover:shadow-lg flex-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm"
                                  >
                                    <Github className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                    <span className="hidden sm:inline">Source</span>
                                    <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                                  </a>
                                ) : (
                                  <div className="inline-flex items-center justify-center space-x-1.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg sm:rounded-xl font-medium cursor-not-allowed opacity-75 flex-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm">
                                    <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                    <span className="hidden sm:inline">Private</span>
                                  </div>
                                )}
                                <Link
                                  to={`/project/${slug}`}
                                  className="group/link inline-flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm"
                                >
                                  <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                  <span>Details</span>
                                  <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col space-y-4 sm:space-y-6">
                  {paginatedProjects.map((project, index) => {
                    const slug = createSlugFromTitle(project.name)
                    
                    return (
                      <article 
                        key={`${project.name}-${index}`}
                        className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-slate-700/50 flex flex-col sm:flex-row hover:scale-[1.01]"
                      >
                        <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                              <div className={`inline-flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 bg-gradient-to-r ${languageColors[project.language]} text-white px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg`}>
                                {languageIcons[project.language]}
                                <span>{languageLabels[project.language]}</span>
                              </div>
                              <div className={`flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 bg-gradient-to-r ${sourceTypeConfig[project.sourceType].color} text-white px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg`}>
                                {sourceTypeConfig[project.sourceType].icon}
                                <span>{sourceTypeConfig[project.sourceType].label}</span>
                              </div>
                              {project.wip && (
                                <div className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-yellow-500/30">
                                  <Wrench className="w-2.5 sm:w-3 h-2.5 sm:h-3 inline mr-1" />
                                  <span>WIP</span>
                                </div>
                              )}
                            </div>
                            
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                              {project.name}
                            </h3>
                            
                            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-3">
                              {project.description}
                            </p>
                          </div>

                          <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {(project.sourceType === 'open-source' && !project.isPrivate) ? (
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/link inline-flex items-center justify-center space-x-1.5 sm:space-x-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg sm:rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 shadow-md hover:shadow-lg flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base"
                                >
                                  <Github className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                  <span>Source</span>
                                  <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                                </a>
                              ) : (
                                <div className="inline-flex items-center justify-center space-x-1.5 sm:space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg sm:rounded-xl font-medium cursor-not-allowed opacity-75 flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base">
                                  <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                  <span>Private</span>
                                </div>
                              )}
                              <Link
                                to={`/project/${slug}`}
                                className="group/link inline-flex items-center justify-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base"
                              >
                                <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                <span>Details</span>
                                <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
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
            </>
          )}

        </div>
      </div>
    </div>
  )
}