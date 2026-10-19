import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import SEOHead from '../components/SEOHead'
import { postText, publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'
import { useLanguage } from '../i18n/language'

// Shortcut keys stay left to right inside Arabic text.
const keys = (combo: string) => <kbd dir="ltr">{combo}</kbd>

const copy = {
  en: { title: 'Page not found', body: 'This page does not exist, or it has moved.', hint: <>Search the site with {keys('Ctrl K')} or {keys('⌘ K')}, or start from one of these.</>, meant: 'Did you mean', home: 'Home', work: 'Work', writing: 'Writing', resume: 'Résumé' },
  ar: { title: 'الصفحة غير موجودة', body: 'هذه الصفحة غير موجودة، أو نُقلت إلى مكان آخر.', hint: <>ابحث في الموقع بـ {keys('Ctrl K')} أو {keys('⌘ K')}، أو ابدأ من إحدى هذه الصفحات.</>, meant: 'هل تقصد', home: 'الصفحة الرئيسية', work: 'الأعمال', writing: 'المقالات', resume: 'السيرة الذاتية' },
}

// A mistyped or shortened post address: the post whose slug shares the most words with it, if any.
export const closestPost = (pathname: string) => {
  const match = pathname.match(/\/blog\/([^/]+)/)
  const words = new Set((match?.[1] ?? '').toLowerCase().split('-').filter(word => word.length > 2))

  if (!words.size) return undefined
  const scored = publishedBlogs.map(post => ({ post, score: createSlugFromTitle(post.title).split('-').filter(word => words.has(word)).length }))
  const best = scored.reduce((top, item) => (item.score > top.score ? item : top), { post: publishedBlogs[0], score: 0 })

  return best.score ? best.post : undefined
}

export const NotFoundPage: React.FC = () => {
  const { language } = useLanguage()
  const { pathname } = useLocation()
  const t = copy[language]
  const suggestion = closestPost(pathname)

  return (
    <div className="site-shell">
      <SEOHead title={t.title} description={t.body} url="https://1saif.me/404" noIndex />
      <SiteHeader />
      <main id="main-content" className="plain-page">
        <p className="plain-code">404</p>
        <h1>{t.title}</h1>
        <p className="plain-lede">{t.body} {t.hint}</p>
        {suggestion && <p className="plain-suggestion">{t.meant}: <Link to={`/blog/${createSlugFromTitle(suggestion.title)}`} lang={postText(suggestion, language).lang}>{postText(suggestion, language).title}</Link></p>}
        <p className="plain-ways">
          <Link to="/">{t.home}</Link>
          <Link to="/#work">{t.work}</Link>
          <Link to="/blog">{t.writing}</Link>
          <Link to="/resume">{t.resume}</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
