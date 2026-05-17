import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'
import { projects } from '../data/projects'
import { Language, SourceType } from '../schemas/projectSchema'
import { createSlugFromTitle } from '../utils/slugUtils'

type SortOption = 'featured' | 'newest' | 'popular' | 'language'

const languageLabels: Record<Language, string> = {
  typescript: 'TS',
  javascript: 'JS',
  rust: 'RS',
  haskell: 'HS',
  go: 'GO',
  ocaml: 'ML'
}

// Premium Custom generated raster language icons (v2 Digital UI)
export const LanguageIcon = ({ lang, className = "w-6 h-6" }: { lang: Language, className?: string }) => {
  const iconMap: Record<Language, string> = {
    typescript: '/lang-icons/ts_icon_v2_1775743435637.png',
    javascript: '/lang-icons/js_icon_v2_1775743450513.png',
    rust: '/lang-icons/rust_icon_v2_1775743462500.png',
    haskell: '/lang-icons/haskell_icon_v2_1775743474604.png',
    go: '/lang-icons/go_icon_v2_1775743485447.png',
    ocaml: '/lang-icons/ocaml_icon_v2_1775743498222.png'
  }

  const src = iconMap[lang];
  if (!src) return null;

  return (
    <div className={`overflow-hidden rounded-sm border border-slate-200 dark:border-zinc-800 ${className}`}>
      <img 
        src={src} 
        alt={`${lang} icon`} 
        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 contrast-125 bg-black"
      />
    </div>
  )
}

const SourceIcon = ({ type }: { type: SourceType }) => {
  const baseClass = "w-4 h-4 text-slate-400 dark:text-zinc-600"
  switch (type) {
    case 'open-source':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
          <circle cx="9" cy="12" r="5" />
          <circle cx="15" cy="12" r="5" />
        </svg>
      )
    case 'private':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
          <rect x="6" y="6" width="12" height="12" />
          <line x1="12" y1="10" x2="12" y2="14" />
        </svg>
      )
    case 'company':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={baseClass}>
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="16" cy="8" r="1.5" />
          <circle cx="8" cy="16" r="1.5" />
          <circle cx="16" cy="16" r="1.5" />
        </svg>
      )
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
}

export const Projects: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [currentPage, setCurrentPage] = useState(1)
  
  const projectsPerPage = 9
  
  const filteredProjects = projects.filter(project => {
    return selectedLanguage === 'all' || project.language === selectedLanguage
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'featured': return (a.order ?? -1) - (b.order ?? -1)
      case 'newest': return (b.order ?? -1) - (a.order ?? -1)
      case 'popular': return b.name.length - a.name.length
      case 'language': return a.language.localeCompare(b.language)
      default: return (a.order ?? -1) - (b.order ?? -1)
    }
  })

  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const paginatedProjects = sortedProjects.slice(startIndex, startIndex + projectsPerPage)

  const languages: Language[] = ['typescript', 'rust', 'haskell', 'go', 'ocaml']

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedLanguage, sortBy])

  return (
    <section id="projects" className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-100 dark:border-zinc-900">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500 dark:text-zinc-500 mb-6 flex items-center gap-3"
            >
              <span>§ 03 — Work</span>
              <span className="h-px w-12 bg-slate-300 dark:bg-zinc-700" />
              <span>{projects.length.toString().padStart(2,'0')} Entries</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-6"
            >
              Selected<br/>
              <span className="text-slate-400 dark:text-zinc-600">Work.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
              className="text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-[55ch] leading-relaxed mt-6"
            >
              Production-ready applications showcasing expertise in system architecture, backend development, and modern technologies.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex col-span-4 flex-col gap-3 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-zinc-500 pl-6 border-l border-slate-200 dark:border-zinc-800 pb-2"
          >
            <div className="flex justify-between"><span>Total</span><span className="text-slate-900 dark:text-white">{projects.length}</span></div>
            <div className="flex justify-between"><span>Stacks</span><span className="text-slate-900 dark:text-white">{languages.length}</span></div>
            <div className="flex justify-between"><span>Shipped</span><span className="text-slate-900 dark:text-white">{projects.filter(p => !p.wip).length}</span></div>
          </motion.div>
        </div>

        {/* Minimalist Filter Text Nav */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 border-b border-slate-200 dark:border-zinc-800 pb-8"
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <button 
              onClick={() => setSelectedLanguage('all')}
              className={`text-[11px] tracking-[0.2em] uppercase transition-colors ${selectedLanguage === 'all' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}
            >
              All
            </button>
            {languages.map(lang => (
              <button 
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`text-[11px] tracking-[0.2em] uppercase transition-colors ${selectedLanguage === lang ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}
              >
                {languageLabels[lang]}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            {(['featured', 'newest'] as SortOption[]).map(sort => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`text-[11px] tracking-[0.2em] uppercase transition-colors ${sortBy === sort ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}
              >
                {sort}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Brutalist Hairline Grid */}
        {paginatedProjects.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tighter">No projects found.</h3>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-zinc-800"
          >
            {paginatedProjects.map((project, index) => {
              const slug = createSlugFromTitle(project.name)
              const wip = project.wip
              
              return (
                <motion.article 
                  key={`${project.name}-${index}`}
                  variants={itemVariants}
                  className="group relative flex flex-col p-10 min-h-[360px] border-b border-r border-slate-200 dark:border-zinc-800 bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors duration-500 overflow-hidden"
                >
                  {/* Meta Label */}
                  <div className="flex items-center justify-between mb-8 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-3">
                      <LanguageIcon lang={project.language as Language} className="w-8 h-8 rounded-md" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
                        {languageLabels[project.language] || project.language}
                      </span>
                    </div>
                    <SourceIcon type={project.sourceType} />
                  </div>
                  
                  {/* Title & Desc */}
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight group-hover:-translate-y-1 transition-transform duration-300">
                      {project.name}
                      {wip && <span className="ml-3 text-[10px] align-top bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-sm tracking-widest uppercase font-bold">WIP</span>}
                    </h3>
                    <p className="text-slate-500 dark:text-zinc-500 text-sm leading-relaxed max-w-sm">
                      {project.description}
                    </p>
                  </div>

                  {/* Hidden action reveals on hover */}
                  <div className="mt-8 overflow-hidden h-6 flex items-center justify-between">
                     <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-zinc-600 transition-opacity group-hover:opacity-0">
                       {project.sourceType.replace('-', ' ')}
                     </span>
                     
                     <Link 
                       to={`/project/${slug}`}
                       className="absolute bottom-10 left-10 right-10 flex items-center justify-between text-slate-900 dark:text-white translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 font-bold text-xs tracking-widest uppercase"
                     >
                       <span>Explore Project</span>
                       <ArrowUpRight className="w-4 h-4" />
                     </Link>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        )}

        {/* Minimalism Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-4">
               {[...Array(totalPages)].map((_, i) => (
                 <button
                   key={i + 1}
                   onClick={() => setCurrentPage(i + 1)}
                   className={`w-2 h-2 rounded-full transition-all duration-300 ${
                     currentPage === i + 1
                       ? 'bg-slate-900 dark:bg-white scale-125'
                       : 'bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400 dark:hover:bg-zinc-600'
                   }`}
                   aria-label={`Page ${i + 1}`}
                 />
               ))}
          </div>
        )}

      </div>
    </section>
  )
}
