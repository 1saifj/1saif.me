import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Eye, Share2, BookOpen, Tag, User, Coffee, Award, Zap, TrendingUp } from 'lucide-react'
import { publishedBlogs } from '../data/blogs'
import { articles } from '../utils/contentLoader'
import { createSlugFromTitle } from '../utils/slugUtils'
import { RelatedPosts } from '../components/RelatedPosts'
import { GiscusComments } from '../components/GiscusComments'
import { ArticleStructuredData } from '../components/StructuredData'
import SEOHead from '../components/SEOHead'
import { SocialImageGenerator, generateSocialImageUrl } from '../components/SocialImageGenerator'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'
import { blogViewsService, BlogViewStats } from '../services/blogViewsService'
import { getOptimizedImageUrl, ImagePresets } from '../utils/imageOptimization'
import ProgressiveReading from '../components/ProgressiveReading'

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [readingProgress, setReadingProgress] = useState(0)
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [viewStats, setViewStats] = useState<BlogViewStats | null>(null)
  const [isLoadingViews, setIsLoadingViews] = useState(true)
  const [dynamicSocialImage, setDynamicSocialImage] = useState<string>('')

  // Find the blog post and its content
  const blog = publishedBlogs.find(b => createSlugFromTitle(b.title) === slug)
  const articleContent = articles.find(a => createSlugFromTitle(a.frontmatter.title) === slug)

  useEffect(() => {
    if (!blog || !articleContent) return

    // Calculate reading time
    const wordCount = articleContent.content.split(' ').length
    const readTime = Math.ceil(wordCount / 200) // Average reading speed
    setEstimatedReadTime(readTime)

    // Track page view in Firebase with proper sequencing
    const trackView = async () => {
      if (slug) {
        try {
          // First, get current view count
          const currentViewCount = await blogViewsService.getQuickViewCount(slug);
          
          // Track the new view in background
          await blogViewsService.trackView(slug, {
            source: document.referrer ? 'referral' : 'direct'
          });
          
          // Get the final updated stats and set the view count
          const updatedStats = await blogViewsService.getBlogStats(slug);
          setViewStats(updatedStats);
          setViewCount(updatedStats.totalViews);
          setIsLoadingViews(false);
          
        } catch (error) {
          console.error('Failed to track view:', error);
          // Fallback to localStorage
          const views = localStorage.getItem(`blog-views-${slug}`) || '0'
          const newViews = parseInt(views) + 1
          localStorage.setItem(`blog-views-${slug}`, newViews.toString())
          setViewCount(newViews);
          setIsLoadingViews(false);
        }
      }
    };

    trackView();

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

  // Generate dynamic social image if blog doesn't have a featured image
  useEffect(() => {
    if (blog && !blog.featuredImage) {
      generateSocialImageUrl(blog.title, 'Saif Aljanahi', {
        tags: blog.tags,
        publishedDate: new Date(blog.createdAt).toISOString(),
        readingTime: estimatedReadTime
      }).then(setDynamicSocialImage)
    }
  }, [blog, estimatedReadTime])

  // Convert markdown to HTML when content changes
  useEffect(() => {
    if (articleContent?.content) {
      setIsLoadingContent(true)
      convertMarkdownToHtml(articleContent.content)
        .then(html => {
          setHtmlContent(html)
          setIsLoadingContent(false)
          
          // Set up event delegation for copy buttons after content is loaded
          setTimeout(() => {
            const handleCopyClick = (event: Event) => {
              const button = event.target as HTMLButtonElement
              if (button?.classList.contains('copy-button')) {
                const codeId = button.getAttribute('data-copy-target')
                if (codeId) {
                  const codeElement = document.getElementById(codeId)
                  if (codeElement) {
                    const text = codeElement.textContent || ''
                    const originalText = button.innerHTML
                    navigator.clipboard.writeText(text).then(() => {
                      button.innerHTML = 'Copied!'
                      button.classList.add('bg-green-100', 'text-green-800')
                      button.classList.remove('bg-slate-100', 'text-slate-600')
                      setTimeout(() => {
                        button.innerHTML = originalText
                        button.classList.remove('bg-green-100', 'text-green-800')
                        button.classList.add('bg-slate-100', 'text-slate-600')
                      }, 2000)
                    }).catch(err => {
                      console.error('Failed to copy text:', err)
                      button.innerHTML = 'Failed'
                      setTimeout(() => {
                        button.innerHTML = originalText
                      }, 2000)
                    })
                  }
                }
              }
            }
            
            // Add event listener to document for event delegation
            document.removeEventListener('click', handleCopyClick) // Remove any existing listener
            document.addEventListener('click', handleCopyClick)
          }, 100) // Small delay to ensure DOM is ready
        })
        .catch(error => {
          console.error('Failed to convert markdown:', error)
          setHtmlContent('<p class="text-red-600">Error loading content. Please refresh the page.</p>')
          setIsLoadingContent(false)
        })
    } else {
      setIsLoadingContent(false)
    }
  }, [articleContent])

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
        title={blog.title}
        description={blog.description}
        image={blog.featuredImage || dynamicSocialImage || '/sj_image.jpeg'}
        url={`https://1saif.me/blog/${slug}`}
        type="article"
        tags={blog.tags}
        publishedTime={new Date(blog.createdAt).toISOString()}
        modifiedTime={blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined}
        author="Saif Aljanahi"
        section="Technology"
        readingTime={estimatedReadTime}
        wordCount={articleContent?.content.split(' ').length}
        canonicalUrl={`https://1saif.me/blog/${slug}`}
      />
      <ArticleStructuredData 
        title={blog.title}
        description={blog.description}
        publishedDate={new Date(blog.createdAt).toISOString()}
        modifiedDate={blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined}
        tags={blog.tags}
        slug={slug!}
      />

      {/* Progressive Reading System */}
      <ProgressiveReading 
        articleSlug={slug!}
        content={articleContent?.content || ''}
        showDetailedStats={false}
        showFloatingProgress={true}
        showReadingResume={true}
      />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-8 sm:pb-12 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Navigation */}
          <Link 
            to="/blog"
            className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Blog</span>
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <article 
              className="space-y-6"
              itemScope 
              itemType="https://schema.org/Article"
            >
              {/* Categories & Status */}
              <div className="flex flex-wrap items-center gap-3">
                {blog.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium border border-slate-200/50 dark:border-slate-600/50"
                    itemProp="keywords"
                  >
                    <Tag className="w-3 h-3 mr-1.5" />
                    {tag}
                  </span>
                ))}
                
                <span className="inline-flex items-center px-3 py-1 bg-green-100/80 dark:bg-green-900/30 backdrop-blur-sm text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-200/50 dark:border-green-600/50">
                  <Clock className="w-3 h-3 mr-1.5" />
                  5 min read
                </span>
              </div>

              {/* Title */}
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight"
                itemProp="headline"
              >
                {blog.title}
              </h1>

              {/* Description */}
              <p 
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl"
                itemProp="description"
              >
                {blog.description}
              </p>

              {/* Author & Date - Telegraph-style structure */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <img 
                  src={getOptimizedImageUrl('/sj.png', ImagePresets.avatar())} 
                  alt="Saif Aljanahi" 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <address 
                    className="font-medium text-slate-900 dark:text-white not-italic"
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Person"
                  >
                    <span itemProp="name">Saif Aljanahi</span>
                  </address>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <time 
                      dateTime={new Date(blog.createdAt).toISOString()}
                      itemProp="datePublished"
                    >
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </article>
          </header>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img 
                src={getOptimizedImageUrl(blog.featuredImage, ImagePresets.hero())} 
                alt={blog.title}
                className="w-full h-96 object-cover"
                itemProp="image"
                data-cover="true"
              />
            </div>
          )}
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <article 
            className="blog-content"
            itemProp="articleBody"
            data-telegram-content="true"
          >
            {isLoadingContent ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            ) : (
              <div 
                className="
                  text-slate-700 dark:text-slate-300 leading-relaxed
                  [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-slate-900 [&>h1]:dark:text-white [&>h1]:mb-6 [&>h1]:mt-8 [&>h1]:leading-tight
                  [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:dark:text-white [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:leading-tight [&>h2]:border-b [&>h2]:border-slate-200 [&>h2]:dark:border-slate-700 [&>h2]:pb-2
                  [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-slate-900 [&>h3]:dark:text-white [&>h3]:mb-4 [&>h3]:mt-6 [&>h3]:leading-tight
                  [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:text-slate-900 [&>h4]:dark:text-white [&>h4]:mb-3 [&>h4]:mt-4
                  [&>h5]:text-base [&>h5]:font-semibold [&>h5]:text-slate-900 [&>h5]:dark:text-white [&>h5]:mb-2 [&>h5]:mt-3
                  [&>h6]:text-sm [&>h6]:font-semibold [&>h6]:text-slate-600 [&>h6]:dark:text-slate-400 [&>h6]:mb-2 [&>h6]:mt-3
                  
                  [&>p]:mb-6 [&>p]:leading-relaxed [&>p]:text-slate-700 [&>p]:dark:text-slate-300
                  
                  [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-2 [&>ul]:text-slate-700 [&>ul]:dark:text-slate-300
                  [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:space-y-2 [&>ol]:text-slate-700 [&>ol]:dark:text-slate-300
                  [&>li]:leading-relaxed
                  
                  [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:bg-blue-50 [&>blockquote]:dark:bg-blue-900/20 [&>blockquote]:p-4 [&>blockquote]:my-6 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>blockquote]:dark:text-slate-400
                  
                  [&>pre]:bg-slate-900 [&>pre]:dark:bg-slate-800 [&>pre]:text-green-400 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:mb-6 [&>pre]:overflow-x-auto [&>pre]:text-sm [&>pre]:leading-relaxed [&>pre]:border [&>pre]:border-slate-200 [&>pre]:dark:border-slate-700
                  [&>code]:bg-slate-100 [&>code]:dark:bg-slate-800 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono [&>code]:text-red-600 [&>code]:dark:text-red-400
                  [&>pre_code]:bg-transparent [&>pre_code]:text-green-400 [&>pre_code]:p-0
                  
                  [&>table]:w-full [&>table]:mb-6 [&>table]:border-collapse [&>table]:border [&>table]:border-slate-300 [&>table]:dark:border-slate-600
                  [&>table_th]:bg-slate-100 [&>table_th]:dark:bg-slate-800 [&>table_th]:p-3 [&>table_th]:text-left [&>table_th]:font-semibold [&>table_th]:border [&>table_th]:border-slate-300 [&>table_th]:dark:border-slate-600
                  [&>table_td]:p-3 [&>table_td]:border [&>table_td]:border-slate-300 [&>table_td]:dark:border-slate-600
                  
                  [&>a]:text-blue-600 [&>a]:dark:text-blue-400 [&>a]:underline [&>a]:hover:text-blue-800 [&>a]:dark:hover:text-blue-300 [&>a]:transition-colors
                  
                  [&>strong]:font-bold [&>strong]:text-slate-900 [&>strong]:dark:text-white
                  [&>em]:italic [&>em]:text-slate-700 [&>em]:dark:text-slate-300
                  
                  [&>hr]:my-8 [&>hr]:border-slate-300 [&>hr]:dark:border-slate-600
                  
                  [&>img]:max-w-full [&>img]:h-auto [&>img]:rounded-lg [&>img]:my-6 [&>img]:shadow-lg [&>img]:mx-auto
                  
                  [&>.highlight]:bg-yellow-100 [&>.highlight]:dark:bg-yellow-900/30 [&>.highlight]:px-1 [&>.highlight]:rounded
                "
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </article>

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Saif Aljanahi</h4>
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