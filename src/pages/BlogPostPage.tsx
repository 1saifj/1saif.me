import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, CalendarBlank, Clock, User, CaretRight, House, Copy, Check, 
  Eye, CaretUp, Link as LinkIcon, ShareNetwork
} from '@phosphor-icons/react'
import { articles } from '../utils/contentLoader'
import { blogSchema } from '../schemas/blogSchema'
import { findContentBySlug } from '../utils/slugUtils'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'
import { blogViewsService, BlogViewStats } from '../services/blogViewsService'

const ContentLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse p-8 border border-slate-200 dark:border-zinc-800">
      <div className="space-y-4">
        <div className="h-8 bg-slate-100 dark:bg-zinc-900 w-3/4"></div>
        <div className="h-4 bg-slate-100 dark:bg-zinc-900 w-1/2"></div>
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-slate-100 dark:bg-zinc-900 w-full"></div>
          <div className="h-4 bg-slate-100 dark:bg-zinc-900 w-5/6"></div>
          <div className="h-4 bg-slate-100 dark:bg-zinc-900 w-4/6"></div>
        </div>
      ))}
    </div>
  )
}

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [copied, setCopied] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [isLoadingViews, setIsLoadingViews] = useState(true)
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isContentLoading, setIsContentLoading] = useState(true)
  const [viewStats, setViewStats] = useState<BlogViewStats | null>(null)
  
  useEffect(() => {
    window.scrollTo(0, 0)
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 10)
      
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0
      setReadingProgress(Math.min(scrolled, 100))
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  if (!slug) return <ErrorView title="Invalid URL" desc="No article identifier was provided in the URL." />
  const article = findContentBySlug(articles, slug)
  
  useEffect(() => {
    if (!slug || !article) return
    const trackView = async () => {
      try {
        await blogViewsService.getQuickViewCount(slug)
        await blogViewsService.trackView(slug, { source: document.referrer ? 'referral' : 'direct' })
        const updatedStats = await blogViewsService.getBlogStats(slug)
        setViewStats(updatedStats)
        setViewCount(updatedStats.totalViews)
        setIsLoadingViews(false)
      } catch (error) {
        const views = localStorage.getItem(`blog-views-${slug}`) || '0'
        const newViews = parseInt(views) + 1
        localStorage.setItem(`blog-views-${slug}`, newViews.toString())
        setViewCount(newViews)
        setIsLoadingViews(false)
      }
    }
    trackView()
  }, [slug, article])

  useEffect(() => {
    if (article?.content) {
      setIsContentLoading(true)
      convertMarkdownToHtml(article.content)
        .then(html => {
          setHtmlContent(html)
          setIsContentLoading(false)
        })
        .catch(error => {
          setHtmlContent('<p>Error loading content</p>')
          setIsContentLoading(false)
        })
    }
  }, [article])
  
  if (!article) return <ErrorView title="Article Not Found" desc="The article you're looking for doesn't exist or has been moved." />

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
    return <ErrorView title="Invalid Article Data" desc="This article has corrupted or invalid metadata." />
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const estimateReadTime = (content: string) => {
    return Math.ceil(content.split(' ').length / 200)
  }

  const handleCopyLink = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#0a0a0a] border-x border-slate-200 dark:border-zinc-800 max-w-[100vw] overflow-x-hidden">
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-slate-900 dark:bg-white z-[60] transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all border-b border-slate-200 dark:border-zinc-800 ${
        isScrolled ? 'bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md' : 'bg-white dark:bg-[#0a0a0a]'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl h-14 flex items-center justify-between gap-2">
          <nav className="flex items-center text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 min-w-0">
            <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">Home</Link>
            <span className="mx-2 sm:mx-4 text-slate-300 dark:text-zinc-700 shrink-0">/</span>
            <Link to="/#blog" className="hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">Blog</Link>
            <span className="mx-2 sm:mx-4 text-slate-300 dark:text-zinc-700 shrink-0">/</span>
            <span className="text-slate-900 dark:text-white truncate max-w-[100px] sm:max-w-xs block">
              {parsedArticle.title}
            </span>
          </nav>
          <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">
            <button onClick={handleCopyLink} className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              {copied ? <Check weight="bold" className="w-4 h-4 text-slate-900 dark:text-white" /> : <LinkIcon weight="bold" className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY PERMALINK'}</span>
            </button>
            <Link to="/" className="hidden sm:block font-mono text-sm tracking-tighter uppercase text-slate-900 dark:text-white hover:opacity-70 transition-opacity">
              [ SA ]
            </Link>
          </div>
        </div>
      </header>

      {/* Article Header */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8 leading-[1.1] tracking-tighter">
            {parsedArticle.title}
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-8 sm:mb-10">
            {parsedArticle.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 border-y border-slate-200 dark:border-zinc-800 py-4 sm:py-6">
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-1">Author</span>
               <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-widest uppercase">Saif Aljanahi</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-zinc-800"></div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-1">Published</span>
               <time dateTime={new Date(parsedArticle.createdAt).toISOString()} className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-widest uppercase font-mono">
                 {formatDate(parsedArticle.createdAt)}
               </time>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-zinc-800 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col items-center">
               <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-1">Duration</span>
               <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-widest uppercase font-mono">{estimateReadTime(article.content)} MIN</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-zinc-800 hidden md:block"></div>
            <div className="hidden md:flex flex-col items-center">
               <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-1">Traffic</span>
               <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-widest uppercase font-mono">
                 {isLoadingViews ? '...' : (viewStats ? viewStats.totalViews : viewCount)}
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl pb-16 sm:pb-24">
        <main className="border-t border-slate-200 dark:border-zinc-800 pt-16">
          <article className="mb-16">
            {isContentLoading ? (
              <ContentLoadingSkeleton />
            ) : (
              <div
                className="article-prose max-w-none 
                  prose prose-base sm:prose-lg dark:prose-invert
                  prose-headings:font-bold prose-headings:tracking-tighter prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-h2:text-2xl sm:prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-12 sm:prose-h2:mt-16 prose-h2:mb-6 sm:prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-slate-900 dark:prose-h2:border-white
                  prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-10 sm:prose-h3:mt-12 prose-h3:mb-4 sm:prose-h3:mb-6
                  prose-p:text-slate-600 dark:prose-p:text-zinc-400 prose-p:font-medium prose-p:leading-relaxed prose-p:mb-5 sm:prose-p:mb-6
                  prose-a:text-slate-900 dark:prose-a:text-white prose-a:underline hover:prose-a:no-underline prose-a:font-bold prose-a:break-words
                  prose-strong:text-slate-900 dark:prose-strong:text-white
                  prose-code:text-slate-900 dark:prose-code:text-white prose-code:bg-slate-100 dark:prose-code:bg-zinc-900 prose-code:px-1.5 sm:prose-code:px-2 prose-code:py-0.5 sm:prose-code:py-1 prose-code:font-mono prose-code:text-xs sm:prose-code:text-sm prose-code:font-bold prose-code:break-all
                  prose-pre:bg-slate-50 dark:prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-zinc-800 prose-pre:rounded-none prose-pre:overflow-x-auto prose-pre:text-xs sm:prose-pre:text-sm
                  prose-ul:text-slate-600 dark:prose-ul:text-zinc-400 prose-ul:font-medium
                  prose-blockquote:border-l-4 prose-blockquote:border-slate-900 dark:prose-blockquote:border-white prose-blockquote:pl-4 sm:prose-blockquote:pl-6 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-zinc-900/50 prose-blockquote:py-3 sm:prose-blockquote:py-4 prose-blockquote:italic
                  prose-img:border prose-img:border-slate-200 dark:prose-img:border-zinc-800 prose-img:grayscale-[30%] hover:prose-img:grayscale-0 prose-img:transition-all prose-img:duration-500 prose-img:w-full"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </article>

          {/* Tags footer */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-8 sm:pt-12 border-t border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mr-1 sm:mr-2 w-full sm:w-auto mb-2 sm:mb-0">Indexing Tags:</span>
            {parsedArticle.tags.map(tag => (
              <span key={tag} className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-bold tracking-widest uppercase">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-slate-200 dark:border-zinc-800 flex justify-between">
             <Link 
               to="/#blog"
               className="group flex items-center gap-3 py-4 text-slate-900 dark:text-white transition-colors"
             >
               <ArrowLeft weight="bold" className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
               <span className="text-[10px] font-bold tracking-widest uppercase">Return to Feed</span>
             </Link>
          </div>
        </main>
      </div>

    </div>
  )
}

const ErrorView = ({ title, desc }: { title: string, desc: string }) => (
  <div className="min-h-[100dvh] bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 border-x border-slate-200 dark:border-zinc-800">
    <div className="text-center max-w-md mx-auto border border-slate-200 dark:border-zinc-800 p-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">{title}</h1>
      <p className="text-slate-500 dark:text-zinc-500 mb-12 font-medium">{desc}</p>
      <Link to="/#blog" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 font-bold text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
        <House weight="bold" className="w-4 h-4" />
        Back to Feed
      </Link>
    </div>
  </div>
)
