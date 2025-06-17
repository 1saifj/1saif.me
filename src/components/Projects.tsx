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
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg">
              <Star className="w-4 h-4" />
              <span>Featured Software Projects</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
              Project Portfolio
            </h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Production-ready applications showcasing expertise in <strong className="text-white">system architecture</strong>, 
              <strong className="text-white"> backend development</strong>, and <strong className="text-white">modern technologies</strong>
            </p>
          </div>

          {/* Featured Project Hero */}
          {featuredProject && (
            <div className="mb-20">
              <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-600">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                
                <div className="relative p-8 md:p-16">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <div className="flex items-center space-x-3 mb-6 flex-wrap">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          <Star className="w-4 h-4 inline mr-2" />
                          Featured Project
                        </div>
                        <div className={`flex items-center space-x-2 bg-gradient-to-r ${languageColors[featuredProject.language]} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                          {languageIcons[featuredProject.language]}
                          <span>{languageLabels[featuredProject.language]}</span>
                        </div>
                        <div className={`flex items-center space-x-2 bg-gradient-to-r ${sourceTypeConfig[featuredProject.sourceType].color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                          {sourceTypeConfig[featuredProject.sourceType].icon}
                          <span>{sourceTypeConfig[featuredProject.sourceType].label}</span>
                        </div>
                        {featuredProject.wip && (
                          <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/30">
                            <Wrench className="w-4 h-4 inline mr-1" />
                            WIP
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                        {featuredProject.name}
                      </h3>
                      
                      <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        {featuredProject.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        {(featuredProject.sourceType === 'open-source' && !featuredProject.isPrivate) ? (
                          <a
                            href={featuredProject.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center space-x-3 bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-slate-100 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:scale-105"
                          >
                            <Github className="w-5 h-5" />
                            <span>View Source</span>
                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </a>
                        ) : (
                          <div className="group inline-flex items-center space-x-3 bg-gray-400 text-gray-700 px-8 py-4 rounded-xl cursor-not-allowed opacity-75 font-bold shadow-xl">
                            <Lock className="w-5 h-5" />
                            <span>Source Unavailable</span>
                          </div>
                        )}
                        <Link
                          to={`/project/${createSlugFromTitle(featuredProject.name)}`}
                          className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                          <Eye className="w-5 h-5" />
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                        <h4 className="text-lg font-bold text-white mb-6">Project Highlights</h4>
                        
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Production Ready</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-slate-300">Clean Architecture</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-slate-300">Scalable Design</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            <span className="text-slate-300">Modern Tech Stack</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-white/80">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">3.2k views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Github className="w-4 h-4" />
                              <span className="text-sm">45 stars</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
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
          )}

          {/* Advanced Search and Filter Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-12 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects, technologies, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-slate-300 backdrop-blur-sm"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/10 rounded-xl p-1 backdrop-blur-sm border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white/20 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white/20 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
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
                  className="appearance-none bg-white/20 border border-white/30 rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white backdrop-blur-sm cursor-pointer"
                >
                  <option value="featured" className="text-slate-900">Featured First</option>
                  <option value="newest" className="text-slate-900">Newest First</option>
                  <option value="popular" className="text-slate-900">Most Popular</option>
                  <option value="language" className="text-slate-900">By Language</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-sm ${
                  showFilters 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Languages</span>
              </button>
            </div>

            {/* Expandable Language Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-sm ${
                      selectedLanguage === 'all'
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-sm'
                    }`}
                  >
                    All Projects ({projects.length})
                  </button>
                  {languages.map(lang => {
                    const count = projects.filter(project => project.language === lang).length
                    return (
                      <button
                        key={lang}
                        onClick={() => handleFilterChange(lang)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-sm ${
                          selectedLanguage === lang
                            ? `bg-gradient-to-r ${languageColors[lang]} text-white shadow-lg`
                            : 'bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-sm'
                        }`}
                      >
                        {languageIcons[lang]}
                        <span>{languageLabels[lang]} ({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-8 text-white">
            <div>
              <span className="font-semibold">{filteredProjects.length}</span> projects found
              {searchQuery && (
                <span> for "<span className="font-semibold">{searchQuery}</span>"</span>
              )}
            </div>
            <div className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          )}

          {/* Projects Grid/List */}
          {!isLoading && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {paginatedProjects.slice(1).map((project, index) => {
                    const slug = createSlugFromTitle(project.name)
                    
                    return (
                      <article 
                        key={`${project.name}-${index}`}
                        className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden border border-slate-700/50"
                      >
                        {/* Project Header */}
                        <div className="p-6 pb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <div className={`flex items-center space-x-2 bg-gradient-to-r ${languageColors[project.language]} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                {languageIcons[project.language]}
                                <span>{languageLabels[project.language]}</span>
                              </div>
                              <div className={`flex items-center space-x-2 bg-gradient-to-r ${sourceTypeConfig[project.sourceType].color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                {sourceTypeConfig[project.sourceType].icon}
                                <span>{sourceTypeConfig[project.sourceType].label}</span>
                              </div>
                              {project.wip && (
                                <div className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
                                  <Wrench className="w-3 h-3 inline mr-1" />
                                  WIP
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-slate-400">
                              <Eye className="w-4 h-4" />
                              <span className="text-xs">1.5k</span>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-blue-300 transition-colors">
                            {project.name}
                          </h3>
                          
                          <p className="text-slate-300 mb-6 leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                        </div>

                        {/* Project Footer */}
                        <div className="px-6 pb-6">
                          <div className="flex items-center justify-between">
                            {(project.sourceType === 'open-source' && !project.isPrivate) ? (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/link flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                              >
                                <Github className="w-4 h-4" />
                                <span>Source</span>
                                <ExternalLink className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                              </a>
                            ) : (
                              <div className="flex items-center space-x-2 text-slate-500 font-medium">
                                <Lock className="w-4 h-4" />
                                <span>Private</span>
                              </div>
                            )}
                            <Link
                              to={`/project/${slug}`}
                              className="group/link inline-flex items-center space-x-2 text-slate-300 hover:text-white font-medium transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Details</span>
                              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-6 mb-12">
                  {paginatedProjects.slice(1).map((project, index) => {
                    const slug = createSlugFromTitle(project.name)
                    
                    return (
                      <article 
                        key={`${project.name}-${index}`}
                        className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-700/50"
                      >
                        <div className="p-8">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-4 flex-wrap">
                                <div className={`flex items-center space-x-2 bg-gradient-to-r ${languageColors[project.language]} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                                  {languageIcons[project.language]}
                                  <span>{languageLabels[project.language]}</span>
                                </div>
                                <div className={`flex items-center space-x-2 bg-gradient-to-r ${sourceTypeConfig[project.sourceType].color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                                  {sourceTypeConfig[project.sourceType].icon}
                                  <span>{sourceTypeConfig[project.sourceType].label}</span>
                                </div>
                                {project.wip && (
                                  <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/30">
                                    <Wrench className="w-4 h-4 inline mr-1" />
                                    Work in Progress
                                  </div>
                                )}
                                <div className="flex items-center space-x-1 text-slate-400">
                                  <Eye className="w-4 h-4" />
                                  <span className="text-sm">1.5k views</span>
                                </div>
                              </div>
                              
                              <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors">
                                {project.name}
                              </h3>
                              
                              <p className="text-slate-300 mb-6 leading-relaxed text-lg">
                                {project.description}
                              </p>

                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3 text-slate-400">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-sm">Production Ready</span>
                                </div>
                                <div className="flex items-center space-x-3 text-slate-400">
                                  <div className={`w-2 h-2 rounded-full ${
                                    project.sourceType === 'open-source' && !project.isPrivate 
                                      ? 'bg-blue-400' 
                                      : project.sourceType === 'company' 
                                      ? 'bg-purple-400' 
                                      : 'bg-orange-400'
                                  }`}></div>
                                  <span className="text-sm">{sourceTypeConfig[project.sourceType].label}</span>
                                </div>
                              </div>
                            </div>

                            <div className="lg:w-48 flex flex-col items-end space-y-4">
                              <div className="flex items-center space-x-4 text-slate-400">
                                <button className="flex items-center space-x-1 hover:text-red-400 transition-colors">
                                  <Heart className="w-4 h-4" />
                                  <span className="text-sm">12</span>
                                </button>
                                <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                                {(project.sourceType === 'open-source' && !project.isPrivate) ? (
                                  <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/link inline-flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                                  >
                                    <Github className="w-4 h-4" />
                                    <span>Source</span>
                                    <ExternalLink className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                  </a>
                                ) : (
                                  <div className="inline-flex items-center space-x-2 bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg cursor-not-allowed border border-gray-500/30">
                                    <Lock className="w-4 h-4" />
                                    <span>Private</span>
                                  </div>
                                )}
                                <Link
                                  to={`/project/${slug}`}
                                  className="group/link inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Details</span>
                                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                              </div>
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
                    className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors backdrop-blur-sm"
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
                          : 'border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors backdrop-blur-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Results State */}
          {!isLoading && filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-slate-600">
                <Code className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No projects found</h3>
              <p className="text-slate-300 text-lg mb-8">
                {searchQuery 
                  ? `No projects match your search for "${searchQuery}"`
                  : `No projects found for the selected language`
                }
              </p>
              <button
                onClick={() => {
                  setSelectedLanguage('all')
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