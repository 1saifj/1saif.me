import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Tag, Share2, BookOpen, User, ChevronRight, Home, Copy, Check, List, Eye, Star, MessageCircle, Menu, X, Twitter, Linkedin, Facebook, Link as LinkIcon, Download, Printer as Print, ChevronUp } from 'lucide-react'
import { articles } from '../utils/contentLoader'
import { blogSchema } from '../schemas/blogSchema'
import { findContentBySlug } from '../utils/slugUtils'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'
import ContentRecommendations from '../components/ContentRecommendations'
import AIContentEnhancer from '../components/AIContentEnhancer'
import { createSlugFromTitle } from '../utils/slugUtils'
import { RelatedPosts } from '../components/RelatedPosts'
import { GiscusComments } from '../components/GiscusComments'
import { ArticleStructuredData } from '../components/StructuredData'
import SEOHead from '../components/SEOHead'
import { blogViewsService, BlogViewStats } from '../services/blogViewsService'

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [copied, setCopied] = useState(false)
  const [tableOfContents, setTableOfContents] = useState<Array<{id: string, text: string, level: number}>>([])
  const [activeSection, setActiveSection] = useState<string>('')
  const [showToc, setShowToc] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [isLoadingViews, setIsLoadingViews] = useState(true)
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [viewStats, setViewStats] = useState<BlogViewStats | null>(null)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100)
      setShowScrollTop(scrollTop > 500)
      
      // Calculate reading progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setReadingProgress(Math.min(scrolled, 100))
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    // Enhanced custom styles for professional blog layout
    const style = document.createElement('style')
    style.textContent = `
      /* Professional blog layout styles */
      .blog-container {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
        min-height: 100vh;
      }
      
      .article-header {
        background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
        position: relative;
        overflow: hidden;
      }
      
      .article-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
        opacity: 0.5;
      }
      
      .article-content {
        background: #ffffff;
        box-shadow: 
          0 25px 50px -12px rgba(0, 0, 0, 0.08),
          0 0 0 1px rgba(255, 255, 255, 0.05);
        border-radius: 24px;
        position: relative;
        z-index: 10;
        margin-top: -60px;
      }
      
      .toc-sidebar {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid rgba(226, 232, 240, 0.6);
        box-shadow: 
          0 20px 25px -5px rgba(0, 0, 0, 0.04),
          0 10px 10px -5px rgba(0, 0, 0, 0.02);
        backdrop-filter: blur(20px);
        border-radius: 20px;
      }
      
      .toc-item {
        position: relative;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 12px;
        margin: 3px 0;
        overflow: hidden;
      }
      
      .toc-item:hover:not(.toc-active) {
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        transform: translateX(4px);
        box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.1);
      }
      
      .toc-active {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white !important;
        font-weight: 600;
        box-shadow: 
          0 8px 25px -8px rgba(59, 130, 246, 0.4),
          0 4px 12px -4px rgba(59, 130, 246, 0.3);
        transform: translateX(6px);
      }
      
      .toc-active::after {
        content: '';
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
      }
      
      .reading-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
        transform-origin: left;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      }
      
      .floating-actions {
        position: fixed;
        right: 24px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 40;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .floating-action {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 
          0 10px 25px -5px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
      }
      
      .floating-action:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 
          0 20px 25px -5px rgba(0, 0, 0, 0.15),
          0 10px 10px -5px rgba(0, 0, 0, 0.1);
      }
      
      .floating-action.active {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        box-shadow: 
          0 10px 25px -5px rgba(59, 130, 246, 0.4),
          0 4px 6px -2px rgba(59, 130, 246, 0.3);
      }
      
      .scroll-top-btn {
        position: fixed;
        bottom: 32px;
        right: 32px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border: none;
        box-shadow: 
          0 10px 25px -5px rgba(59, 130, 246, 0.4),
          0 4px 6px -2px rgba(59, 130, 246, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 50;
      }
      
      .scroll-top-btn:hover {
        transform: translateY(-4px) scale(1.1);
        box-shadow: 
          0 20px 25px -5px rgba(59, 130, 246, 0.5),
          0 10px 10px -5px rgba(59, 130, 246, 0.4);
      }
      
      .share-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(226, 232, 240, 0.8);
        border-radius: 16px;
        box-shadow: 
          0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
        padding: 16px;
        min-width: 200px;
        z-index: 60;
      }
      
      .share-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        transition: all 0.2s ease;
        cursor: pointer;
        text-decoration: none;
        color: #475569;
      }
      
      .share-option:hover {
        background: #f1f5f9;
        transform: translateX(4px);
      }
      
      /* Enhanced code block styling */
      .code-block-container {
        margin: 32px 0;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 
          0 25px 50px -12px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(71, 85, 105, 0.1);
        transition: all 0.3s ease;
      }
      
      .code-block-container:hover {
        box-shadow: 
          0 32px 64px -12px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(71, 85, 105, 0.15);
        transform: translateY(-2px);
      }
      
      .code-block-header {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(71, 85, 105, 0.3);
      }
      
      .code-block-content {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        padding: 24px;
        overflow-x: auto;
      }
      
      .code-block-content pre {
        margin: 0;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
        font-size: 14px;
        line-height: 1.6;
        color: #f1f5f9;
      }
      
      /* Enhanced typography */
      .article-prose h1,
      .article-prose h2,
      .article-prose h3,
      .article-prose h4 {
        scroll-margin-top: 120px;
        position: relative;
      }
      
      .article-prose h1 {
        font-size: 2.5rem;
        font-weight: 800;
        line-height: 1.2;
        margin: 48px 0 24px 0;
        color: #0f172a;
        border-bottom: 3px solid #e2e8f0;
        padding-bottom: 16px;
      }
      
      .article-prose h2 {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.3;
        margin: 40px 0 20px 0;
        color: #1e293b;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 12px;
      }
      
      .article-prose h3 {
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.4;
        margin: 32px 0 16px 0;
        color: #334155;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 8px;
      }
      
      .article-prose p {
        font-size: 1.125rem;
        line-height: 1.8;
        margin-bottom: 24px;
        color: #475569;
        font-weight: 400;
      }
      
      .article-prose strong {
        font-weight: 600;
        color: #1e293b;
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        padding: 2px 6px;
        border-radius: 4px;
      }
      
      .article-prose a {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }
      
      .article-prose a:hover {
        color: #2563eb;
        border-bottom-color: #3b82f6;
      }
      
      /* Mobile responsiveness */
      @media (max-width: 1024px) {
        .floating-actions {
          display: none;
        }
        
        .article-content {
          margin-top: -40px;
          border-radius: 20px 20px 0 0;
        }
      }
      
      @media (max-width: 768px) {
        .article-prose h1 {
          font-size: 2rem;
        }
        
        .article-prose h2 {
          font-size: 1.5rem;
        }
        
        .article-prose p {
          font-size: 1rem;
          line-height: 1.7;
        }
        
        .scroll-top-btn {
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    // Generate table of contents
    const headings = document.querySelectorAll('.article-prose h1, .article-prose h2, .article-prose h3, .article-prose h4')
    const toc = Array.from(headings).map((heading, index) => {
      const id = heading.id || `heading-${index}`
      if (!heading.id) heading.id = id
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      }
    })
    setTableOfContents(toc)

    // Set up intersection observer for active section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { 
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.5, 1]
      }
    )

    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [slug])
  
  if (!slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <BookOpen className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Invalid URL</h1>
          <p className="text-slate-600 mb-8 leading-relaxed text-lg">No article identifier was provided in the URL.</p>
          <Link 
            to="/"
            className="inline-flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    )
  }

  const article = findContentBySlug(articles, slug)
  
  // Track page view in Firebase with reliable updates
  useEffect(() => {
    if (!slug || !article) return

    const trackView = async () => {
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
    };

    trackView();
  }, [slug, article]);

  // Convert markdown to HTML when content changes
  useEffect(() => {
    if (article?.content) {
      convertMarkdownToHtml(article.content)
        .then(html => {
          setHtmlContent(html)
        })
        .catch(error => {
          console.error('Failed to convert markdown:', error)
          setHtmlContent('<p>Error loading content</p>')
        })
    }
  }, [article])
  
  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-yellow-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <BookOpen className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Article Not Found</h1>
          <p className="text-slate-600 mb-8 leading-relaxed text-lg">The article you're looking for doesn't exist or has been moved.</p>
          <div className="space-y-4">
            <Link 
              to="/#blog"
              className="block bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl"
            >
              Browse All Articles
            </Link>
            <Link 
              to="/"
              className="block bg-slate-200 text-slate-700 px-8 py-4 rounded-xl hover:bg-slate-300 transition-all duration-300 font-medium"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  let parsedArticle
  try {
    parsedArticle = blogSchema.parse({
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      createdAt: article.frontmatter.createdAt,
      updatedAt: article.frontmatter.updatedAt,
      draft: article.frontmatter.draft || false,
      tags: article.frontmatter.tags || []
    })
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <BookOpen className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Invalid Article Data</h1>
          <p className="text-slate-600 mb-8 leading-relaxed text-lg">This article has corrupted or invalid metadata.</p>
          <Link 
            to="/"
            className="inline-flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const estimateReadTime = (content: string) => {
    const words = content.split(' ').length
    const wordsPerMinute = 200
    return Math.ceil(words / wordsPerMinute)
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = parsedArticle.title
  const shareText = parsedArticle.description

  const handleShare = async (platform?: string) => {
    if (platform) {
      let url = ''
      switch (platform) {
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
          break
        case 'linkedin':
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
          break
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
          break
        case 'copy':
          navigator.clipboard.writeText(shareUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          setShowShareMenu(false)
          return
      }
      if (url) {
        window.open(url, '_blank', 'width=600,height=400')
        setShowShareMenu(false)
      }
    } else {
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          })
        } catch (err) {
          console.log('Error sharing:', err)
        }
      } else {
        setShowShareMenu(!showShareMenu)
      }
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setShowToc(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="blog-container">
      {/* Reading Progress Bar */}
      <div 
        className="reading-progress"
        style={{ transform: `scaleX(${readingProgress / 100})` }}
      />

      {/* Enhanced Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xl' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
              <Link 
                to="/"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors bg-white/80 rounded-full px-4 py-2 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <Link 
                to="/#blog"
                className="text-slate-600 hover:text-slate-900 transition-colors bg-white/80 rounded-full px-4 py-2 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                Blog
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 font-medium truncate max-w-xs bg-white/90 rounded-full px-4 py-2 backdrop-blur-sm shadow-sm">
                {parsedArticle.title.length > 30 ? parsedArticle.title.substring(0, 30) + '...' : parsedArticle.title}
              </span>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowToc(!showToc)}
                className="lg:hidden bg-white/80 hover:bg-white/90 text-slate-700 p-3 rounded-full transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl"
                aria-label="Toggle table of contents"
              >
                {showToc ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link 
                to="/"
                className="text-3xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
              >
                SA
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Article Header */}
      <section className="article-header pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-4xl relative z-20">
          <div className="text-center">
            {/* Article Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
              <Star className="w-4 h-4" />
              <span>Featured Article</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
              {parsedArticle.title}
            </h1>
            
            <p className="text-xl text-slate-200 mb-12 leading-relaxed max-w-3xl mx-auto">
              {parsedArticle.description}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300 mb-8">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <User className="w-4 h-4" />
                <span className="font-medium">Saif Aljanahi</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Calendar className="w-4 h-4" />
                <time dateTime={new Date(parsedArticle.createdAt).toISOString()}>
                  {formatDate(parsedArticle.createdAt)}
                </time>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Clock className="w-4 h-4" />
                <span>{estimateReadTime(article.content)} min read</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Eye className="w-4 h-4" />
                {isLoadingViews ? (
                  <span className="flex items-center space-x-1">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </span>
                ) : (
                  <span>{viewStats ? (
                    viewStats.totalViews > 1000 ? 
                      `${(viewStats.totalViews / 1000).toFixed(1)}k` : 
                      viewStats.totalViews
                  ) : viewCount} views</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {parsedArticle.tags.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Tag className="w-3 h-3 mr-2" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl relative">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Table of Contents Sidebar */}
          <aside className={`lg:col-span-1 ${showToc ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-32">
              <div className="toc-sidebar p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                    <BookOpen className="w-5 h-5 mr-3 text-blue-600" />
                    Contents
                  </h3>
                  <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
                
                <nav className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`toc-item block w-full text-left transition-all duration-200 py-3 px-4 rounded-lg ${
                        activeSection === item.id 
                          ? 'toc-active' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      style={{ 
                        paddingLeft: `${16 + (item.level - 1) * 12}px`,
                        fontSize: item.level === 1 ? '0.95rem' : item.level === 2 ? '0.9rem' : '0.85rem',
                        fontWeight: item.level <= 2 ? '600' : '500',
                        lineHeight: '1.4'
                      }}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
                
                {/* Reading Progress */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>{estimateReadTime(article.content)} min read</span>
                    </div>
                    <span className="font-semibold text-blue-600">{Math.round(readingProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-4">
            <article className="article-content p-8 md:p-12 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div 
                className="
                  article-prose max-w-none text-slate-700 dark:text-slate-300 leading-relaxed
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
            </article>

            {/* AI Content Enhancement */}
            <AIContentEnhancer 
              content={article.content}
              title={article.frontmatter.title || ''}
              existingTags={article.frontmatter.tags || []}
              className="mb-12"
            />

            {/* AI-Powered Content Recommendations */}
            <ContentRecommendations
              currentSlug={slug!}
              className="mb-12"
            />

            {/* Author Bio */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-3xl p-8 text-white shadow-2xl mb-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
              
              <div className="relative flex items-start space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-white/20 shadow-xl">
                  <img 
                    src="/sj_image.jpeg" 
                    alt="Saif Aljanahi - Full-Stack Software Engineer"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">About the Author</h3>
                  <h4 className="text-xl font-semibold mb-4 text-blue-300">Saif Aljanahi</h4>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    Full-Stack Software Engineer specializing in <strong className="text-white">Golang</strong>, <strong className="text-white">Python</strong>, <strong className="text-white">Flutter</strong>, and <strong className="text-white">Clean Architecture</strong>. 
                    Currently working as Software Engineer at <strong className="text-white">AlQaseh</strong> and Assistant Engineer at <strong className="text-white">University of Kufa</strong>, building scalable solutions for 
                    financial systems and healthcare technology.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="https://github.com/1saifj" 
                      className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>GitHub</span>
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/1saifj" 
                      className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>LinkedIn</span>
                    </a>
                    <a 
                      href="mailto:saifalialjanahi@gmail.com" 
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-200">
              <Link 
                to="/#blog"
                className="group inline-flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Blog</span>
              </Link>
              
              <div className="text-slate-500 text-center">
                <p className="text-lg">Found this helpful? 
                  <a href="mailto:saifalialjanahi@gmail.com" className="text-blue-600 hover:text-blue-500 font-medium ml-2 underline decoration-2 underline-offset-4">
                    Share your thoughts
                  </a>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Actions */}
      <div className="floating-actions">        
        <div className="relative">
          <button
            onClick={() => handleShare()}
            className="floating-action"
            title="Share article"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="floating-action"
            title="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}