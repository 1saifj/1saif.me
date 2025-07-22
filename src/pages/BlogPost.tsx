import React, { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Eye, Share2 } from 'lucide-react'
import { publishedBlogs } from '../data/blogs'
import { articles } from '../utils/contentLoader'
import { createSlugFromTitle } from '../utils/slugUtils'
import { RelatedPosts } from '../components/RelatedPosts'
import { GiscusComments } from '../components/GiscusComments'
import { ArticleStructuredData } from '../components/StructuredData'
import SEOHead from '../components/SEOHead'
import { generateSocialImageUrl } from '../components/SocialImageGenerator'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'
import { useBlogViews } from '../hooks/useBlogViews'
import { OptimizedImage } from '../utils/imageOptimization'

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [readingProgress, setReadingProgress] = useState(0)
  const { viewCount, isLoading: isLoadingViews } = useBlogViews(slug ?? null);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isLoadingContent, setIsLoadingContent] = useState(true)
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
  }, [blog, slug, articleContent])

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
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
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

      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-blue-600 z-50 transition-all duration-300"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Clean Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/blog"
              className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {Math.round(readingProgress)}% complete
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Container */}
      <main className="bg-white dark:bg-slate-950 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Article Header */}
          <header className="pt-12 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-3xl">
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-slate-600 dark:text-slate-400">
                <time 
                  dateTime={new Date(blog.createdAt).toISOString()}
                  className="font-medium"
                >
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <span>•</span>
                <span>{estimatedReadTime} min read</span>
                <span>•</span>
                <span className="inline-flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{isLoadingViews ? '...' : viewCount > 1000 ? `${(viewCount / 1000).toFixed(1)}k` : viewCount} views</span>
                </span>
              </div>
              
              {/* Title */}
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-6"
                itemProp="headline"
              >
                {blog.title}
              </h1>

              {/* Description */}
              <p 
                className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8"
                itemProp="description"
              >
                {blog.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {blog.tags.slice(0, 4).map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="py-8">
              <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <OptimizedImage 
                  src={blog.featuredImage}
                  preset="hero"
                  fallback="/sj_image.jpeg"
                  alt={blog.title}
                  className="w-full h-96 object-cover"
                  itemProp="image"
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <article 
            className="py-8"
            itemProp="articleBody"
          >
            {isLoadingContent ? (
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            ) : (
              <div 
                className="
                  prose prose-lg prose-slate dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
                  prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:leading-tight prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-700 prose-h2:pb-2
                  prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-6 prose-h3:leading-tight
                  prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-strong:font-semibold prose-strong:text-slate-900 dark:prose-strong:text-white
                  prose-code:text-sm prose-code:font-mono prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-slate-800 dark:prose-code:text-slate-200 prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:not-italic prose-blockquote:font-normal
                  prose-ul:my-6 prose-ol:my-6 prose-li:my-1
                  prose-img:rounded-lg prose-img:shadow-lg
                  prose-table:text-sm
                  prose-hr:border-slate-300 dark:prose-hr:border-slate-700
                "
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </article>

          {/* Author Section */}
          <div className="py-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-4">
              <OptimizedImage 
                src="/sj.png"
                preset="avatar"
                fallback="/sj_image.jpeg"
                alt="Saif Aljanahi" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Saif Aljanahi</h3>
                <p className="text-slate-600 dark:text-slate-400">Software Engineer & Tech Writer</p>
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
      </main>
    </>
  )
} 