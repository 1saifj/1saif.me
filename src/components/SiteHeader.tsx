import React from 'react'
import { Link } from 'react-router-dom'
import { toggleTheme } from '../utils/theme'
import { useLanguage } from '../i18n/language'
import { InterfaceIcon } from './InterfaceIcon'
import { SearchButton } from './SearchButton'

const labels = {
  en: { light: 'Light', dark: 'Dark', work: 'Work', blog: 'Writing', resume: 'Résumé', contact: 'Contact', nav: 'Site navigation', switchTo: 'عربي', switchLabel: 'اقرأ بالعربية', home: 'saif.me home' },
  ar: { light: 'فاتح', dark: 'داكن', work: 'الأعمال', blog: 'المقالات', resume: 'السيرة الذاتية', contact: 'التواصل', nav: 'تنقّل الموقع', switchTo: 'EN', switchLabel: 'Read in English', home: 'الصفحة الرئيسية لـ saif.me' },
}

export const ThemeButton: React.FC = () => {
  const { language } = useLanguage()
  const l = labels[language]

  // Both states are in the markup and CSS shows the one that matches html.dark, so the prerendered
  // HTML and the first client render agree. The hidden one is display: none, so only one is announced.
  return (
    <button type="button" className="notebook-quiet-button notebook-theme-button" onClick={toggleTheme}>
      <span className="theme-when-light"><InterfaceIcon name="moon" /><span className="theme-text">{l.dark}</span></span>
      <span className="theme-when-dark"><InterfaceIcon name="sun" /><span className="theme-text">{l.light}</span></span>
    </button>
  )
}

export const LanguageButton: React.FC = () => {
  const { language, toggleLanguage } = useLanguage()
  const l = labels[language]

  // Visible text is the target language's own name; the title says what the button does.
  return <button type="button" className="notebook-quiet-button" onClick={toggleLanguage} lang={language === 'en' ? 'ar' : 'en'} title={l.switchLabel}>{l.switchTo}</button>
}

export const BrandLink: React.FC = () => {
  const { language } = useLanguage()

  return <Link to="/" className="notebook-brand" aria-label={labels[language].home} dir="ltr">saif<span className="notebook-brand-dot">.</span>me</Link>
}

type Section = 'work' | 'blog' | 'resume'

// Same header as the home page, for every other route. The home page keeps its own for scroll-spy and search.
export const SiteHeader: React.FC<{ current?: Section }> = ({ current }) => {
  const { language } = useLanguage()
  const l = labels[language]
  const links: { id: Section; to: string }[] = [{ id: 'work', to: '/#work' }, { id: 'blog', to: '/blog' }, { id: 'resume', to: '/resume' }]

  const renderNav = (className: string) => <nav className={className} aria-label={l.nav}>
    {links.map(link => <Link key={link.id} to={link.to} className={current === link.id ? 'is-active' : ''} aria-current={current === link.id ? 'page' : undefined}>{l[link.id]}</Link>)}
    <a href="mailto:saifalialjanahi@gmail.com">{l.contact}</a>
  </nav>

  return <div className="notebook-shell notebook-bar">
    <header className="notebook-header">
      <div className="notebook-header-inner">
        <BrandLink />
        {renderNav('notebook-desktop-nav')}
        <div className="notebook-header-actions"><SearchButton /><LanguageButton /><ThemeButton /></div>
      </div>
      {renderNav('notebook-mobile-nav')}
    </header>
  </div>
}
