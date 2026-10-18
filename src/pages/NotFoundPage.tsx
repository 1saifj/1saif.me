import React from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import SEOHead from '../components/SEOHead'
import { useLanguage } from '../i18n/language'

const copy = {
  en: { title: 'Page not found', body: 'This page does not exist, or it has moved.', home: 'Go to the home page' },
  ar: { title: 'الصفحة غير موجودة', body: 'هذه الصفحة غير موجودة، أو نُقلت إلى مكان آخر.', home: 'العودة إلى الصفحة الرئيسية' },
}

export const NotFoundPage: React.FC = () => {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <div className="site-shell">
      <SEOHead title={t.title} description={t.body} url="https://1saif.me/404" noIndex />
      <SiteHeader />
      <main id="main-content" className="site-container plain-page">
        <h1>{t.title}</h1>
        <p className="plain-lede">{t.body}</p>
        <p><Link to="/">{t.home}</Link></p>
      </main>
    </div>
  )
}
