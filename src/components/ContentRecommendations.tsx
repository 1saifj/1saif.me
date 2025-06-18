import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Tag, Sparkles, TrendingUp } from 'lucide-react'
import { useAIContent } from '../services/aiContentService'
import { publishedBlogs } from '../data/blogs'
import { articles } from '../utils/contentLoader'

interface ContentRecommendation {
  slug: string
  title: string
  reason: string
  relevanceScore: number
  tags: string[]
}

interface ContentRecommendationsProps {
  currentSlug: string
  className?: string
}

export const ContentRecommendations: React.FC<ContentRecommendationsProps> = ({ 
  currentSlug, 
  className = '' 
}) => {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const { getRecommendations, trackReading } = useAIContent()

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const currentArticle = articles.find(article => article.slug === currentSlug)
        if (!currentArticle) return

        // Convert article format to AI service format
        const currentPostForAI = {
          slug: currentArticle.slug,
          title: currentArticle.frontmatter.title || '',
          description: currentArticle.frontmatter.description || '',
          content: currentArticle.content || '',
          tags: currentArticle.frontmatter.tags || [],
          createdAt: String(currentArticle.frontmatter.createdAt || Date.now()),
          readingTime: Math.ceil(currentArticle.content.split(' ').length / 200)
        }

        const allPostsForAI = articles.map(article => ({
          slug: article.slug,
          title: article.frontmatter.title || '',
          description: article.frontmatter.description || '',
          content: article.content || '',
          tags: article.frontmatter.tags || [],
          createdAt: String(article.frontmatter.createdAt || Date.now()),
          readingTime: Math.ceil(article.content.split(' ').length / 200)
        }))

        const recs = await getRecommendations(currentPostForAI, allPostsForAI)
        setRecommendations(recs)
      } catch (error) {
        console.warn('Failed to load AI recommendations:', error)
        // Fallback to simple tag-based recommendations
        const fallbackRecs = generateFallbackRecommendations()
        setRecommendations(fallbackRecs)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [currentSlug, getRecommendations])

  const generateFallbackRecommendations = (): ContentRecommendation[] => {
    const currentArticle = articles.find(article => article.slug === currentSlug)
    if (!currentArticle || !currentArticle.frontmatter.tags) return []

    return articles
      .filter(article => article.slug !== currentSlug)
      .map(article => {
        const currentTags = currentArticle.frontmatter.tags || []
        const articleTags = article.frontmatter.tags || []
        const commonTags = currentTags.filter((tag: string) => articleTags.includes(tag))
        const relevanceScore = commonTags.length / Math.max(currentTags.length, 1)
        
        return {
          slug: article.slug,
          title: article.frontmatter.title || '',
          reason: commonTags.length > 0 
            ? `Related ${commonTags[0]} content`
            : 'You might also like',
          relevanceScore,
          tags: articleTags
        }
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 4)
  }

  const handleRecommendationClick = (slug: string) => {
    trackReading(slug)
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              AI is analyzing related content...
            </h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-slate-700">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            AI-Recommended Reading
          </h3>
          <div className="flex items-center space-x-1 ml-auto">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Smart Suggestions
            </span>
          </div>
        </div>

                 <div className="grid gap-4">
          {recommendations.map((rec, index) => {
            const article = articles.find(a => a.slug === rec.slug)
            if (!article) return null

            const readingTime = Math.ceil(article.content.split(' ').length / 200)

            return (
              <Link
                key={rec.slug}
                to={`/blog/${rec.slug}`}
                onClick={() => handleRecommendationClick(rec.slug)}
                className="group block p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                        {Math.round(rec.relevanceScore * 100)}% match
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                      {rec.title}
                    </h4>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {article.frontmatter.description || ''}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{readingTime} min read</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{rec.tags.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        💡 {rec.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-slate-700/50 rounded-xl border border-blue-200 dark:border-slate-600">
          <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Powered by AI</span>
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Recommendations improve as you read more content</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentRecommendations 