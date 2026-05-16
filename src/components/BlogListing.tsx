import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Funnel, BookOpen, MagnifyingGlass, ArrowRight, Tag } from '@phosphor-icons/react';
import { publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'

type SortOption = 'newest' | 'oldest' | 'popular' | 'trending'

export const BlogListing: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const postsPerPage = 10
  
  // Extract all unique tags
  const allTags = Array.from(new Set(publishedBlogs.flatMap(blog => blog.tags)))
  
  // Funnel and search logic
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
      case 'newest': return b.createdAt - a.createdAt
      case 'oldest': return a.createdAt - b.createdAt
      case 'popular': return b.title.length - a.title.length
      case 'trending': return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
      default: return b.createdAt - a.createdAt
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedBlogs.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedBlogs = sortedBlogs.slice(startIndex, startIndex + postsPerPage)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const estimateReadTime = (description: string) => {
    const words = description.split(' ').length
    const wordsPerMinute = 200
    return Math.ceil(words / wordsPerMinute)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTag, searchQuery, sortBy])

  const handleFilterChange = (newTag: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setSelectedTag(newTag)
      setIsLoading(false)
    }, 200)
  }

  return (
    <div className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] min-h-[100dvh] relative border-b border-slate-200 dark:border-zinc-800">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-bold text-slate-900 dark:text-white mb-6 tracking-tighter leading-none border-b-8 border-slate-900 dark:border-white pb-6 inline-block">
            Engineering<br />
            Feed.
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed mt-4 font-medium">
            Deep technical specifications, architecture blueprints, and engineering methodologies.
          </p>
        </div>

        {/* Brutalist Controls Area */}
        <div className="border-t border-l border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row mb-16">
          
          {/* Search Box */}
          <div className="flex-1 flex items-center border-b border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/10">
            <MagnifyingGlass weight="bold" className="w-5 h-5 ml-6 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-4 py-8 text-slate-900 dark:text-white font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex-1 md:max-w-xs border-b border-r border-slate-200 dark:border-zinc-800 flex items-center shrink-0">
             <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-[10px] tracking-widest uppercase focus:outline-none px-6 py-8 appearance-none cursor-pointer"
              >
                <option value="newest">Sort: Chronological (Newest)</option>
                <option value="oldest">Sort: Chronological (Oldest)</option>
                <option value="popular">Sort: Matrix Volume</option>
                <option value="trending">Sort: Highest Signal</option>
              </select>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-3 mb-16 pb-8 border-b border-slate-200 dark:border-zinc-800">
           <button
             onClick={() => handleFilterChange('all')}
             className={`px-4 py-2 font-bold text-[10px] tracking-widest uppercase transition-colors ${
               selectedTag === 'all' 
               ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
               : 'bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white'
             }`}
           >
             Global Feed
           </button>
           {allTags.map(tag => (
             <button
               key={tag}
               onClick={() => handleFilterChange(tag)}
               className={`px-4 py-2 font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center gap-2 ${
                 selectedTag === tag 
                 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                 : 'bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white'
               }`}
             >
               <Tag weight="bold" className="w-3 h-3" />
               {tag}
             </button>
           ))}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-600 mb-10">
           <span>Total Specifications: {filteredBlogs.length}</span>
           <span>Status: Indexed</span>
        </div>

        {/* Main Feed Container */}
        {isLoading ? (
          <div className="border-t border-l border-slate-200 dark:border-zinc-800">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-12 border-b border-r border-slate-200 dark:border-zinc-800 animate-pulse bg-slate-50/50 dark:bg-zinc-900/10 h-40"></div>
            ))}
          </div>
        ) : paginatedBlogs.length === 0 ? (
          <div className="text-center py-32 border border-slate-200 dark:border-zinc-800">
            <BookOpen weight="duotone" className="w-16 h-16 text-slate-400 dark:text-zinc-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">No Logs Found</h3>
            <p className="text-slate-500 dark:text-zinc-500 font-medium mb-8">
              Adjust your query parameters.
            </p>
            <button
              onClick={() => { setSelectedTag('all'); setSearchQuery('') }}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 font-bold text-[10px] tracking-widest uppercase transition-colors hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              Reset Matrix
            </button>
          </div>
        ) : (
          <div className="border-t border-l border-slate-200 dark:border-zinc-800 flex flex-col">
            {paginatedBlogs.map((blog) => (
              <article 
                key={blog.title}
                className="group border-b border-r border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors flex flex-col md:flex-row"
              >
                {/* Meta Block */}
                <div className="md:w-64 shrink-0 p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 flex flex-col gap-6 justify-start font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
                   <div className="flex items-center gap-2">
                     <Calendar weight="bold" className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                     {formatDate(blog.createdAt)}
                   </div>
                   <div className="flex items-center gap-2">
                     <Clock weight="bold" className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                     {estimateReadTime(blog.description)} MIN
                   </div>
                </div>

                {/* Content Block */}
                <div className="flex-1 p-8 lg:p-12 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-8 max-w-3xl">
                    {blog.description}
                  </p>
                  
                  {/* Action Row */}
                  <div className="mt-auto flex items-end justify-between">
                     <div className="flex flex-wrap gap-2">
                       {blog.tags.map(tag => (
                         <span key={tag} className="px-2 py-1 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
                           {tag}
                         </span>
                       ))}
                     </div>
                     <Link
                       to={`/blog/${createSlugFromTitle(blog.title)}`}
                       className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 font-bold text-[10px] tracking-widest uppercase transition-colors hover:bg-slate-800 dark:hover:bg-slate-200 group-hover:translate-x-2 shrink-0"
                     >
                       Read Data
                       <ArrowRight weight="bold" className="w-3 h-3" />
                     </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Console */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-between border-y border-slate-200 dark:border-zinc-800 py-4">
             <button
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white hover:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
             >
               &lt; Previous Sector
             </button>
             
             <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest uppercase">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`${currentPage === i + 1 ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white' : 'text-slate-400 dark:text-zinc-600 hover:text-slate-600'}`}
                  >
                    0{i + 1}
                  </button>
                ))}
             </div>
             
             <button
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white hover:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
             >
               Next Sector &gt;
             </button>
          </div>
        )}

      </div>
    </div>
  )
} 