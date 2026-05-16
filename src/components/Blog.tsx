import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'
import { publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'

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

export const Blog: React.FC = () => {
  const postsToShow = 3

  const sortedBlogs = [...publishedBlogs].sort((a, b) => b.createdAt - a.createdAt)
  const recentArticles = sortedBlogs.slice(0, postsToShow)

  const estimateReadTime = (description: string) => {
    const words = description.split(' ').length
    const wordsPerMinute = 200
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <section id="blog" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-100 dark:border-zinc-900">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="text-6xl md:text-8xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none mb-6"
            >
              Engineering<br/>
              <span className="text-slate-400 dark:text-zinc-600 border-b border-transparent">Writing.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
              className="text-lg text-slate-600 dark:text-zinc-400 max-w-[50ch] leading-relaxed mt-10"
            >
              Technical articles on software architecture, system design, and the engineering practices that scale.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              to="/blog" 
              className="group flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
            >
              <span>Explore Archive</span>
              <ArrowUpRight strokeWidth="2" className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </motion.div>
        </div>

        {/* Article Stack (Brutalist Rows) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col border-t border-slate-200 dark:border-zinc-800"
        >
          {recentArticles.map((blog, index) => {
            const slug = createSlugFromTitle(blog.title)
            return (
              <motion.article 
                key={`${slug}-${index}`}
                variants={itemVariants}
                className="group relative flex flex-col md:flex-row items-stretch border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors duration-500"
              >
                {/* Index Column */}
                <div className="hidden md:flex items-center justify-center w-24 border-r border-slate-200 dark:border-zinc-800 text-slate-300 dark:text-zinc-800 font-mono text-3xl font-bold tracking-tighter">
                  {(index + 1).toString().padStart(2, '0')}
                </div>

                <div className="p-8 lg:p-12 flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">
                      {new Date(blog.createdAt).getFullYear()}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">
                      /{Math.max(1, estimateReadTime(blog.description))} MIN READ
                    </span>
                  </div>
                  
                  <Link to={`/blog/${slug}`} className="block w-fit mb-6">
                    <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tighter leading-tight group-hover:translate-x-2 transition-transform duration-300">
                      {blog.title}
                    </h3>
                  </Link>

                  <p className="text-slate-500 dark:text-zinc-500 leading-relaxed text-sm max-w-3xl mb-10">
                    {blog.description}
                  </p>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-auto">
                    {blog.tags.slice(0, 4).map(tag => (
                      <span 
                        key={tag}
                        className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action Area */}
                <div className="hidden md:flex items-center justify-center px-12 border-l border-slate-200 dark:border-zinc-800">
                  <Link 
                    to={`/blog/${slug}`}
                    className="flex text-slate-400 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                  >
                    <ArrowUpRight className="w-8 h-8 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}
