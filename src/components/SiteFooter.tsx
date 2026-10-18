import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/language'

const copy = {
  en: { name: 'Saif Aljanahi', note: 'Built with React and hosted on Cloudflare Pages.', resume: 'Résumé', privacy: 'Privacy' },
  ar: { name: 'سيف الجناحي', note: 'بُني باستخدام React ومستضاف على Cloudflare Pages.', resume: 'السيرة الذاتية', privacy: 'الخصوصية' },
}

// One footer for every page.
export const SiteFooter: React.FC = () => {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <footer className="notebook-footer">
      {/* The prerendered year can lag the visitor's clock on New Year's Eve; that one text node may differ. */}
      <p>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> {t.name}. {t.note}</p>
      <p className="notebook-footer-links">
        <a href="https://github.com/1saifj" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/1saifj" target="_blank" rel="noreferrer">LinkedIn</a>
        <Link to="/resume">{t.resume}</Link>
        <a href="/rss.xml">RSS</a>
        <Link to="/privacy">{t.privacy}</Link>
      </p>
    </footer>
  )
}
