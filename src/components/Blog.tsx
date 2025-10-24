import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Tag, BookOpen, ArrowRight } from 'lucide-react'
import { publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'

export const Blog: React.FC = () => {
  const postsToShow = 3

  const sortedBlogs = [...publishedBlogs].sort((a, b) => b.createdAt - a.createdAt)
  
  const featuredArticle = sortedBlogs.length > 0 ? sortedBlogs[0] : null
  const recentArticles = sortedBlogs.length > 1 ? sortedBlogs.slice(1, postsToShow + 1) : []

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


  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 id="blog-heading" className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Engineering Blog
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Technical articles on software architecture, system design, and engineering practices.
            </p>
          </div>

          <div className="space-y-8 mb-12">
            {sortedBlogs.slice(0, postsToShow + 1).map((blog, index) => {
              const slug = createSlugFromTitle(blog.title)
              return (
                <article key={`${blog.title}-${index}`} className="border-b border-slate-200 dark:border-slate-700 pb-8 last:border-0">
                  <Link to={`/blog/${slug}`} className="group">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {blog.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <time dateTime={new Date(blog.createdAt).toISOString()}>
                      {formatDate(blog.createdAt)}
                    </time>
                    <span>·</span>
                    <span>{estimateReadTime(blog.description)} min read</span>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {blog.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {blog.tags.slice(0, 5).map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>

          <div>
            <Link
              to="/blog"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all articles →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}