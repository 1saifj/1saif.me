import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { postText, publishedBlogs } from '../data/blogs'
import { loadArticle } from '../utils/contentLoader'
import { createSlugFromTitle } from '../utils/slugUtils'
import { ArticleStructuredData, BreadcrumbStructuredData } from '../components/StructuredData'
import SEOHead from '../components/SEOHead'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'
import { enhanceCodeBlocks } from '../utils/codeBlocks'
import { dateLocale, SITE_TIME_ZONE, useLanguage } from '../i18n/language'
import { ContentSkeleton } from '../components/ContentSkeleton'
import { SiteFooter } from '../components/SiteFooter'
import { NotFoundPage } from './NotFoundPage'
import { PostToc, postHeadings, tocFrom } from '../components/PostToc'

// Filled by entry-server before prerendering. In the browser, the prerendered body is read back
// from the page on first render, so the article shows at once instead of a skeleton.
export const prerenderedArticles = new Map<string, string>()

// Arabic counts: one minute, two minutes, 3 to 10 take the plural, 11 and up take the singular.
const arabicMinutes = (n: number) => n === 1 ? 'دقيقة واحدة' : n === 2 ? 'دقيقتان' : n <= 10 ? `${n} دقائق` : `${n} دقيقة`

const initialHtml = (slug?: string) => {
  if (!slug) return ''

  if (typeof document === 'undefined') return prerenderedArticles.get(slug) ?? ''

  return document.querySelector(`[data-article="${slug}"]`)?.innerHTML ?? ''
}

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const blog = publishedBlogs.find(post => createSlugFromTitle(post.title) === slug)
  // Keyed by slug so moving to another post never shows the previous body.
  const [article, setArticle] = useState(() => ({ slug, html: initialHtml(slug) }))
  const htmlContent = article.slug === slug ? article.html : ''
  // The prerendered body is already final, so the first visit skips loading the Markdown again.
  const prerendered = useRef(article.html ? slug : undefined)
  const body = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()
  const ar = language === 'ar'

  useEffect(() => {
    if (!blog?.file) return

    if (prerendered.current === slug) {
      prerendered.current = undefined

      return
    }

    let cancelled = false

    void loadArticle(blog.file).then(content => {
      if (content && !cancelled) setArticle({ slug, html: convertMarkdownToHtml(content) })
    })

    return () => {
      cancelled = true
    }
  }, [blog?.file, slug])

  useEffect(() => (body.current && htmlContent ? enhanceCodeBlocks(body.current) : undefined), [htmlContent])
  const headings = useMemo(() => postHeadings(htmlContent), [htmlContent])

  // A mistyped address gets the 404 page (it suggests the closest post), not a silent jump to the index.
  if (!blog?.file) return <NotFoundPage />

  const words = blog.words ?? 0
  const readTime = Math.max(1, Math.ceil(words / 200))
  const createdDate = new Date(blog.createdAt)
  const text = postText(blog, language)
  // Posts are newest first, so the next entry is older and the previous one newer.
  const index = publishedBlogs.indexOf(blog)
  const older = publishedBlogs[index + 1]
  const newer = index > 0 ? publishedBlogs[index - 1] : undefined
  const relatedPosts = publishedBlogs.filter(post => post !== blog && post !== older && post !== newer && post.tags.some(tag => blog.tags.includes(tag))).slice(0, 3)
  const pagerLink = (post: typeof blog, kind: 'older' | 'newer') => {
    const linked = postText(post, language)
    // The arrow points the way the link moves through time: back is left in English, right in Arabic.
    const arrow = (kind === 'older') === ar ? '→' : '←'

    return <Link to={`/blog/${createSlugFromTitle(post.title)}`} className={`post-pager-${kind}`}><span>{kind === 'older' ? (ar ? `${arrow} المقال الأقدم` : `${arrow} Older post`) : (ar ? `المقال الأحدث ${arrow}` : `Newer post ${arrow}`)}</span><strong lang={linked.lang} dir={linked.lang === 'ar' ? 'rtl' : 'ltr'}>{linked.title}</strong></Link>
  }

  const share = async () => {
    const url = window.location.href

    if (navigator.share) {
      await navigator.share({ title: text.title, text: text.description, url }).catch(() => undefined)

      return
    }

    await navigator.clipboard?.writeText(url)
  }

  return (
    <div className="site-shell site-article-page">
      <SEOHead title={`${text.title} | ${ar ? 'سيف الجناحي' : 'Saif Aljanahi'}`} description={text.description} image={blog.featuredImage || '/sj_image.jpeg'} url={`https://1saif.me/blog/${slug}`} type="article" tags={blog.tags} publishedTime={createdDate.toISOString()} modifiedTime={blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined} />
      <ArticleStructuredData title={blog.title} description={blog.description} publishedDate={createdDate.toISOString()} modifiedDate={blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined} tags={blog.tags} slug={slug!} image={blog.featuredImage} wordCount={words} />

      <BreadcrumbStructuredData items={[[ar ? 'الصفحة الرئيسية' : 'Home', ar ? '/ar' : '/'], [ar ? 'المقالات' : 'Writing', `${ar ? '/ar' : ''}/blog`], [text.title, `${ar ? '/ar' : ''}/blog/${slug}`]]} />
      <div className="reading-progress" aria-hidden="true" />
      <SiteHeader current="blog" />

      <main id="main-content">
        <article lang="en" dir="ltr">
          {/* On Arabic pages the head is Arabic, laid out in the same column as the English body below it. */}
          <header className="plain-page plain-article-head">
            {ar
              ? <div lang="ar" dir="rtl"><p className="plain-back"><Link to="/blog">→ كل المقالات</Link></p><h1>{text.title}</h1><p className="plain-lede">{text.description}</p><p className="plain-meta"><time dateTime={createdDate.toISOString()}>{createdDate.toLocaleDateString(dateLocale(language), { year: 'numeric', month: 'long', day: 'numeric', timeZone: SITE_TIME_ZONE })}</time> · {arabicMinutes(readTime)} للقراءة<span className="plain-share"> · <button type="button" className="plain-button" onClick={() => void share()}>مشاركة</button></span></p><p className="site-translation-note">المقال مكتوب بالإنجليزية، وعنوانه الأصلي: <bdi lang="en">{blog.title}</bdi></p></div>
              : <><p className="plain-back"><Link to="/blog">← All posts</Link></p><h1>{blog.title}</h1><p className="plain-lede">{blog.description}</p><p className="plain-meta"><time dateTime={createdDate.toISOString()}>{createdDate.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: SITE_TIME_ZONE })}</time> · {readTime} min read<span className="plain-share"> · <button type="button" className="plain-button" onClick={() => void share()}>Share</button></span></p></>}
          </header>
          <div className={headings.length >= tocFrom ? 'plain-article-body has-toc' : 'plain-article-body'}>{htmlContent ? <div ref={body} className="site-article-content article-content" data-article={slug} dangerouslySetInnerHTML={{ __html: htmlContent }} /> : <ContentSkeleton />}<PostToc headings={headings} label={ar ? 'في هذه الصفحة' : 'On this page'} language={language} /></div>
        </article>

        <section className="related-posts"><div>
          <nav className="post-pager" aria-label={ar ? 'مقالات أخرى' : 'More posts'}>{older && pagerLink(older, 'older')}{newer && pagerLink(newer, 'newer')}</nav>
          {relatedPosts.length > 0 && <><h2 id="related-title">{ar ? 'مقالات ذات صلة' : 'Related posts'}</h2><ul>{relatedPosts.map(post => {
          const related = postText(post, language)

          return <li key={post.title}><Link to={`/blog/${createSlugFromTitle(post.title)}`}><span lang={related.lang} dir={related.lang === 'ar' ? 'rtl' : 'ltr'}>{related.title}</span><time dateTime={new Date(post.createdAt).toISOString()}>{new Intl.DateTimeFormat(dateLocale(language), { month: 'short', year: 'numeric', timeZone: SITE_TIME_ZONE }).format(post.createdAt)}</time></Link></li>
        })}</ul></>}
        </div></section>
      </main>

      <SiteFooter />
    </div>
  )
}
