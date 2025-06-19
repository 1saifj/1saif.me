import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Tag, TrendingUp, BookOpen, ArrowRight, Star, User, Award, Zap, Target } from 'lucide-react'
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

  const getArticleBadge = (blog: any, index: number) => {
    if (index === 0 && blog.title === featuredArticle?.title) return { icon: Star, text: 'Featured', color: 'from-yellow-500 to-orange-600' }
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
            <h2 id="blog-heading" className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight transition-colors duration-300">
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

          {/* Recent Articles */}
          {recentArticles.length > 0 && (
            <div className="mb-16">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentArticles.map((blog, index) => {
                  const slug = createSlugFromTitle(blog.title)
                  const badge = getArticleBadge(blog, index + 1) // +1 to offset featured
                  
                  return (
                    <article
                      key={`${blog.title}-${index}`}
                      className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 flex flex-col"
                    >
                      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-700 dark:via-blue-900/20 dark:to-purple-900/20 p-6 pb-4 transition-colors duration-300">
                        <div className={`absolute top-4 right-4 bg-gradient-to-r ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                          <badge.icon className="w-3 h-3 inline mr-1" />
                          {badge.text}
                        </div>

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
                        
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3.25rem]">
                          {blog.title}
                        </h3>
                        
                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed line-clamp-3 text-sm transition-colors duration-300 min-h-[4.5rem]">
                          {blog.description}
                        </p>
                      </div>

                      <div className="px-6 pb-6 mt-auto">
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
                        <Link 
                          to={`/blog/${slug}`}
                          className="group/link relative w-full inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white px-6 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 hover:scale-105 hover:shadow-xl overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></div>
                          
                          <BookOpen className="relative z-10 w-5 h-5" />
                          <span className="relative z-10">Read Article</span>
                          <ArrowRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                          
                          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                        </Link>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
          
          <div className="text-center">
            <Link
              to="/blog"
              className="group inline-flex items-center space-x-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-8 py-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 border border-slate-200 dark:border-slate-700"
            >
              <BookOpen className="w-5 h-5" />
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}