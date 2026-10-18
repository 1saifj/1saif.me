import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { PostThumb } from './PostThumb'
import { postText, publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'
import { dateLocale, Language, SITE_TIME_ZONE, useLanguage } from '../i18n/language'

const formatDate = (timestamp: number, language: Language) => new Intl.DateTimeFormat(dateLocale(language), { year: 'numeric', month: 'short', day: 'numeric', timeZone: SITE_TIME_ZONE }).format(timestamp)

const copy = {
  en: {
    title: 'Writing',
    intro: <>Notes on databases, Go, and the tools I use at work. There is also an <a href="/rss.xml">RSS feed</a>.</>,
    search: 'Search posts',
    placeholder: 'Search by title or topic',
    all: 'All topics',
    filter: 'Filter by topic',
    empty: 'No posts match that search.',
    clear: 'Clear search',
    footer: 'Written in Al-Najaf, Iraq.',
    email: 'Email',
  },
  ar: {
    title: 'المقالات',
    intro: <>ملاحظات عن قواعد البيانات وGo والأدوات التي أستخدمها في العمل. المقالات مكتوبة بالإنجليزية، وتتوفر أيضاً <a href="/rss.xml">خلاصة RSS</a>.</>,
    search: 'البحث في المقالات',
    placeholder: 'ابحث بالعنوان أو الموضوع',
    all: 'كل المواضيع',
    filter: 'التصفية حسب الموضوع',
    empty: 'لا توجد مقالات تطابق البحث.',
    clear: 'مسح البحث',
    footer: 'كُتبت في النجف، العراق.',
    email: 'البريد الإلكتروني',
  },
}

export const BlogListing: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState('all')
  const [query, setQuery] = useState('')
  const { language } = useLanguage()
  const t = copy[language]

  // The ten most used tags, so the filter row stays one or two lines.
  const topTags = useMemo(() => {
    const frequency = new Map<string, number>()
    publishedBlogs.forEach(blog => blog.tags.forEach(tag => frequency.set(tag, (frequency.get(tag) || 0) + 1)))

    return [...frequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag)
  }, [])

  const posts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return publishedBlogs
      .filter(blog => selectedTag === 'all' || blog.tags.includes(selectedTag))
      .filter(blog => !normalizedQuery || `${blog.title} ${blog.description} ${blog.titleAr ?? ''} ${blog.descriptionAr ?? ''} ${blog.tags.join(' ')}`.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [query, selectedTag])

  return (
    <div className="site-shell site-writing-page">
      <SiteHeader current="blog" />

      <main id="main-content" className="site-container plain-page">
        <h1>{t.title}</h1>
        <p className="plain-lede">{t.intro}</p>

        <div className="plain-filters">
          <label className="sr-only" htmlFor="post-search">{t.search}</label>
          <input id="post-search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t.placeholder} type="search" />
          <p className="plain-tags" aria-label={t.filter}>
            <button type="button" aria-pressed={selectedTag === 'all'} onClick={() => setSelectedTag('all')}>{t.all}</button>
            {topTags.map(tag => <button type="button" key={tag} aria-pressed={selectedTag === tag} onClick={() => setSelectedTag(tag)} lang="en">{tag}</button>)}
          </p>
        </div>

        {posts.length
          ? <div className="notebook-shell notebook-bar"><div className="notebook-post-list">
            {posts.map(blog => {
              const text = postText(blog, language)

              return <Link to={`/blog/${createSlugFromTitle(blog.title)}`} className="notebook-post-row" key={blog.title}>
              <time dateTime={new Date(blog.createdAt).toISOString()}>{formatDate(blog.createdAt, language)}</time>
              <div lang={text.lang} dir={text.lang === 'ar' ? 'rtl' : 'ltr'}><h2>{text.title}</h2><p>{text.description}</p></div>
              <PostThumb src={blog.featuredImage} />
            </Link>
            })}
          </div></div>
          : <p>{t.empty} <button type="button" className="plain-button" onClick={() => { setQuery(''); setSelectedTag('all') }}>{t.clear}</button></p>}
      </main>

      <footer className="site-container plain-footer">
        <span>{t.footer}</span>
        <span className="plain-links"><a href="https://github.com/1saifj" target="_blank" rel="noreferrer">GitHub</a><a href="mailto:saifalialjanahi@gmail.com">{t.email}</a><a href="/rss.xml">RSS</a></span>
      </footer>
    </div>
  )
}
