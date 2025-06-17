import React, { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Eye, Share2, BookOpen, Tag, User, Coffee, Award, Zap, TrendingUp } from 'lucide-react'
import { publishedBlogs } from '../data/blogs'
import { articles } from '../utils/contentLoader'
import { createSlugFromTitle } from '../utils/slugUtils'
import { RelatedPosts } from '../components/RelatedPosts'
import { GiscusComments } from '../components/GiscusComments'
import { ArticleStructuredData } from '../components/StructuredData'
import SEOHead from '../components/SEOHead'

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [readingProgress, setReadingProgress] = useState(0)
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [viewCount, setViewCount] = useState(0)

  // Find the blog post and its content
  const blog = publishedBlogs.find(b => createSlugFromTitle(b.title) === slug)
  const articleContent = articles.find(a => createSlugFromTitle(a.frontmatter.title) === slug)

  useEffect(() => {
    if (!blog || !articleContent) return

    // Calculate reading time
    const wordCount = articleContent.content.split(' ').length
    const readTime = Math.ceil(wordCount / 200) // Average reading speed
    setEstimatedReadTime(readTime)

    // Track page view
    const views = localStorage.getItem(`blog-views-${slug}`) || '0'
    const newViews = parseInt(views) + 1
    localStorage.setItem(`blog-views-${slug}`, newViews.toString())
    setViewCount(newViews)

    // Reading progress tracker
    const handleScroll = () => {
      const article = document.querySelector('article')
      if (!article) return

      const scrollTop = window.scrollY
      const articleTop = article.offsetTop
      const articleHeight = article.scrollHeight
      const windowHeight = window.innerHeight

      const progress = Math.min(
        Math.max(
          ((scrollTop - articleTop + windowHeight) / articleHeight) * 100,
          0
        ),
        100
      )

      setReadingProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [blog, slug])

  if (!blog) {
    return <Navigate to="/blog" replace />
  }

  const handleShare = async () => {
    const shareData = {
      title: blog.title,
      text: blog.description,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <SEOHead 
        title={`${blog.title} | Saif Alqaseh`}
        description={blog.description}
        tags={blog.tags}
        type="article"
        publishedTime={new Date(blog.createdAt).toISOString()}
        author="Saif Alqaseh"
      />
      <ArticleStructuredData 
        title={blog.title}
        description={blog.description}
        publishedDate={new Date(blog.createdAt).toISOString()}
        modifiedDate={blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined}
        tags={blog.tags}
        slug={slug!}
      />

      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50 transition-all duration-300"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6">
          {/* Back Navigation */}
          <Link 
            to="/blog"
            className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Blog</span>
          </Link>

          {/* Article Header */}
          <article className="space-y-6">
            {/* Categories & Status */}
            <div className="flex flex-wrap items-center gap-3">
              {blog.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium border border-slate-200/50 dark:border-slate-600/50"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
              
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              {blog.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {blog.description}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Saif Alqaseh</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={new Date(blog.createdAt).toISOString()}>
                  {formatDate(blog.createdAt)}
                </time>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{estimatedReadTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{viewCount.toLocaleString()} views</span>
              </div>
            </div>

            {/* Engagement Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all border border-slate-200/50 dark:border-slate-600/50"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="font-medium">Share</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <Coffee className="w-4 h-4" />
                <span>Grab a coffee and enjoy!</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <article className="prose prose-lg dark:prose-invert prose-blue max-w-none">
                         <div 
               className="text-slate-700 dark:text-slate-300 leading-relaxed"
               dangerouslySetInnerHTML={{ __html: articleContent?.content || '' }}
             />
          </article>

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Saif Alqaseh</h4>
                  <p className="text-slate-600 dark:text-slate-400">Software Engineer & Tech Enthusiast</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-slate-500 hover:text-blue-500 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <RelatedPosts 
            currentPostTitle={blog.title}
            currentPostTags={blog.tags}
            maxPosts={3}
          />

          {/* Giscus Comments */}
          <GiscusComments 
            postSlug={slug!}
            postTitle={blog.title}
          />
        </div>
      </section>
    </>
  )
} 