import React, { useState, useEffect } from 'react'
import { Sparkles, Tag, Clock, Key, Target, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { useAIContent } from '../services/aiContentService'

interface AIContentEnhancerProps {
  content: string
  title: string
  existingTags?: string[]
  onEnhancementComplete?: (enhancement: any) => void
  className?: string
}

export const AIContentEnhancer: React.FC<AIContentEnhancerProps> = ({
  content,
  title,
  existingTags = [],
  onEnhancementComplete,
  className = ''
}) => {
  const { generateSummary, generateTags, calculateReadingTime } = useAIContent()
  const [enhancement, setEnhancement] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enhanceContent = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Generate AI-powered enhancements
      const [aiAnalysis, smartTags] = await Promise.all([
        generateSummary(content, title),
        generateTags(content, existingTags)
      ])

      const readingTime = calculateReadingTime(content)

      const enhancedContent = {
        ...aiAnalysis,
        smartTags,
        readingTime,
        wordCount: content.split(/\s+/).length,
        originalTags: existingTags
      }

      setEnhancement(enhancedContent)
      onEnhancementComplete?.(enhancedContent)

    } catch (err) {
      setError('Failed to enhance content. Please try again.')
      console.error('Content enhancement error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (content && title) {
      enhanceContent()
    }
  }, [content, title])

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            ✨ AI Enhancing Content...
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
          <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse w-1/2" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800 ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Enhancement Failed
          </h3>
        </div>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={enhanceContent}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    )
  }

  if (!enhancement) return null

  return (
    <div className={`bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
          <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
            ✨ AI-Enhanced Content Analysis
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Powered by Llama 3.3-70B
          </p>
        </div>
        <div className="ml-auto">
          <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{enhancement.wordCount}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Words</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{enhancement.readingTime}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Min Read</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{enhancement.smartTags?.length || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Smart Tags</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{enhancement.keyPoints?.length || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Key Points</div>
        </div>
      </div>

      {/* AI-Generated Summary */}
      {enhancement.summary && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">AI Summary</h4>
          </div>
          <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            {enhancement.summary}
          </p>
        </div>
      )}

      {/* Smart Tags */}
      {enhancement.smartTags && enhancement.smartTags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Smart Tags</h4>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
              {enhancement.smartTags.length} generated
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {enhancement.smartTags.map((tag: string, index: number) => {
              const isNew = !existingTags.includes(tag)
              return (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isNew
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  } border`}
                >
                  {isNew && <Sparkles className="w-3 h-3 mr-1" />}
                  {tag}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Key Points */}
      {enhancement.keyPoints && enhancement.keyPoints.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Key Points</h4>
          </div>
          <ul className="space-y-2">
            {enhancement.keyPoints.map((point: string, index: number) => (
              <li
                key={index}
                className="flex items-start space-x-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SEO Enhancement */}
      {(enhancement.seoTitle !== title || enhancement.metaDescription) && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">SEO Optimization</h4>
          </div>
          <div className="space-y-3">
            {enhancement.seoTitle !== title && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Optimized Title:</div>
                <div className="text-slate-900 dark:text-white">{enhancement.seoTitle}</div>
              </div>
            )}
            {enhancement.metaDescription && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Meta Description:</div>
                <div className="text-slate-900 dark:text-white">{enhancement.metaDescription}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {enhancement.metaDescription.length}/160 characters
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIContentEnhancer 