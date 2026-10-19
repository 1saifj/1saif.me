import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { PostThumb } from './PostThumb'
import { InterfaceIcon } from './InterfaceIcon'
import { SiteFooter } from './SiteFooter'
import { postText, publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'
import { searchText } from '../utils/searchText'
import { ALL_TAGS, readListingQuery, readListingTag, withListingQuery, withListingTag } from '../utils/listingFilters'
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
  },
}

export const BlogListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const { language } = useLanguage()
  const t = copy[language]

  // The prerendered /blog HTML holds no query string, so the first client render must show every post.
  // The filters from the URL take over after mount, which keeps React from reporting a hydration mismatch.
  useEffect(() => setMounted(true), [])

  // The ten most used tags, so the filter row stays one or two lines.
  const topTags = useMemo(() => {
    const frequency = new Map<string, number>()
    publishedBlogs.forEach(blog => blog.tags.forEach(tag => frequency.set(tag, (frequency.get(tag) || 0) + 1)))

    return [...frequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag)
  }, [])

  // Every tag in the posts, so a link to a tag outside the filter row still filters the list.
  const allTags = useMemo(() => new Set(publishedBlogs.flatMap(blog => blog.tags)), [])

  const selectedTag = mounted ? readListingTag(searchParams, allTags) : ALL_TAGS
  const query = mounted ? readListingQuery(searchParams) : ''

  // A tag click is its own history entry, so Back returns to the filter before it.
  const selectTag = (tag: string) => setSearchParams(withListingTag(searchParams, tag))

  // Typing replaces the current entry: one history step for the whole search, not one per keystroke.
  const changeQuery = (value: string) => setSearchParams(withListingQuery(searchParams, value), { replace: true })

  // One URL change for the empty state's button, so it drops both filters at once.
  const clearFilters = () => setSearchParams(withListingQuery(withListingTag(searchParams, ALL_TAGS), ''))

  const posts = useMemo(() => {
    const normalizedQuery = searchText(query.trim())

    return publishedBlogs
      .filter(blog => selectedTag === ALL_TAGS || blog.tags.includes(selectedTag))
      .filter(blog => !normalizedQuery || searchText(`${blog.title} ${blog.description} ${blog.titleAr ?? ''} ${blog.descriptionAr ?? ''} ${blog.tags.join(' ')}`).includes(normalizedQuery))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [query, selectedTag])

  return (
    <div className="site-shell site-writing-page">
      <SiteHeader current="blog" />

      <main id="main-content" className="plain-page">
        <h1>{t.title}</h1>
        <p className="plain-lede">{t.intro}</p>

        <div className="plain-filters">
          <div className="plain-search">
            <label className="sr-only" htmlFor="post-search">{t.search}</label>
            <InterfaceIcon name="search" />
            <input id="post-search" value={query} onChange={event => changeQuery(event.target.value)} placeholder={t.placeholder} type="search" autoComplete="off" />
          </div>
          <p className="plain-tags" aria-label={t.filter}>
            <button type="button" aria-pressed={selectedTag === ALL_TAGS} onClick={() => selectTag(ALL_TAGS)}>{t.all}</button>
            {topTags.map(tag => <button type="button" key={tag} aria-pressed={selectedTag === tag} onClick={() => selectTag(tag)} lang="en">{tag}</button>)}
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
          : <p>{t.empty} <button type="button" className="plain-button" onClick={clearFilters}>{t.clear}</button></p>}
      </main>

      <SiteFooter />
    </div>
  )
}
