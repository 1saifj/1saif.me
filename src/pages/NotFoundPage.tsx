import React from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import SEOHead from '../components/SEOHead'
import { useLanguage } from '../i18n/language'

// Shortcut keys stay left to right inside Arabic text.
const keys = (combo: string) => <kbd dir="ltr">{combo}</kbd>

const copy = {
  en: { title: 'Page not found', body: 'This page does not exist, or it has moved.', hint: <>Search the site with {keys('Ctrl K')} or {keys('⌘ K')}, or start from one of these.</>, home: 'Home', work: 'Work', writing: 'Writing', resume: 'Résumé' },
  ar: { title: 'الصفحة غير موجودة', body: 'هذه الصفحة غير موجودة، أو نُقلت إلى مكان آخر.', hint: <>ابحث في الموقع بـ {keys('Ctrl K')} أو {keys('⌘ K')}، أو ابدأ من إحدى هذه الصفحات.</>, home: 'الصفحة الرئيسية', work: 'الأعمال', writing: 'المقالات', resume: 'السيرة الذاتية' },
}

export const NotFoundPage: React.FC = () => {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <div className="site-shell">
      <SEOHead title={t.title} description={t.body} url="https://1saif.me/404" noIndex />
      <SiteHeader />
      <main id="main-content" className="plain-page">
        <p className="plain-code">404</p>
        <h1>{t.title}</h1>
        <p className="plain-lede">{t.body} {t.hint}</p>
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
