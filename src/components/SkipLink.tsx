import React from 'react'
import { useLanguage } from '../i18n/language'

// Hidden until it has keyboard focus; .sr-only:focus-visible in index.html shows it.
export const SkipLink: React.FC = () => {
  const { language } = useLanguage()

  return <a href="#main-content" className="sr-only">{language === 'ar' ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'}</a>
}
