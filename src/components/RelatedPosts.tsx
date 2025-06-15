import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Calendar, ArrowRight, Tag, TrendingUp, Eye } from 'lucide-react'
import { publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'

interface RelatedPostsProps {
  currentPostTitle: string
  currentPostTags: string[]
  maxPosts?: number
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({ 
  currentPostTitle, 
  currentPostTags, 
  maxPosts = 3 
}) => {
  // Find related posts based on shared tags
  const getRelatedPosts = () => {
    // Filter out current post and calculate relevance score
    const otherPosts = publishedBlogs.filter(post => post.title !== currentPostTitle)
    
    // Calculate relevance score based on shared tags
    const postsWithScore = otherPosts.map(post => {
      const sharedTags = post.tags.filter(tag => currentPostTags.includes(tag))
      const relevanceScore = sharedTags.length
      return { ...post, relevanceScore, sharedTags }
    })
    
    // Sort by relevance score, then by date
    const sortedPosts = postsWithScore
      .filter(post => post.relevanceScore > 0) // Only include posts with shared tags
      .sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore // Higher score first
        }
        return b.createdAt - a.createdAt // More recent first for same score
      })
    
    // If we don't have enough related posts, fill with recent posts
    if (sortedPosts.length < maxPosts) {
      const recentPosts = otherPosts
        .filter(post => !sortedPosts.find(sp => sp.title === post.title))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, maxPosts - sortedPosts.length)
        .map(post => ({ ...post, relevanceScore: 0, sharedTags: [] }))
      
      return [...sortedPosts, ...recentPosts].slice(0, maxPosts)
    }
    
    return sortedPosts.slice(0, maxPosts)
  }

  const relatedPosts = getRelatedPosts()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const estimateReadTime = (description: string) => {
    const words = description.split(' ').length
    const wordsPerMinute = 200
    return Math.ceil(words / wordsPerMinute)
  }

  const getEngagementMetrics = () => ({
    views: Math.floor(Math.random() * 3000) + 200,
    trending: Math.random() > 0.7
  })

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 rounded-2xl p-8 transition-colors duration-300">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          Related Articles
        </h3>
      </div>

      <div className="grid gap-6">
        {relatedPosts.map((post, index) => {
          const metrics = getEngagementMetrics()
          
          return (
            <Link
              key={`${post.title}-${index}`}
              to={`/blog/${createSlugFromTitle(post.title)}`}
              className="group block"
            >
              <article className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    
                    <p className="text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 text-sm leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors duration-200">
                      <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <time dateTime={new Date(post.createdAt).toISOString()}>
                        {formatDate(post.createdAt)}
                      </time>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{estimateReadTime(post.description)} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{metrics.views}</span>
                    </div>
                  </div>
                  
                  {metrics.trending && (
                    <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-medium">Trending</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map(tag => {
                      const isShared = 'sharedTags' in post && post.sharedTags.includes(tag)
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                            isShared
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{tag}</span>
                        </span>
                      )
                    })}
                  </div>
                  
                  {post.relevanceScore > 0 && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {post.relevanceScore} shared {post.relevanceScore === 1 ? 'tag' : 'tags'}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/#blog"
          className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-200"
        >
          <span>View all articles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
} 