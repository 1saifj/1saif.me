import React, { createContext, useCallback, useContext, useEffect } from 'react'

export type Language = 'en' | 'ar'

type LanguageState = { language: Language; toggleLanguage: () => void }

const LanguageContext = createContext<LanguageState | null>(null)

// Arabic pages live under /ar (prerendered like the English ones); everything else is English.
export const isArabicPath = (pathname: string) => pathname === '/ar' || pathname.startsWith('/ar/')

// The same page in the other language: /resume <-> /ar/resume. One leading slash only: '//host' would leave the site.
export const otherLanguagePath = (pathname: string) => {
  const rest = `/${(isArabicPath(pathname) ? pathname.slice(3) : pathname).replace(/^[/\\]+/, '')}`

  return isArabicPath(pathname) ? rest : `/ar${rest === '/' ? '' : rest}`
}

export const LanguageProvider: React.FC<{ language: Language; children: React.ReactNode }> = ({ language, children }) => {
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  // A full load, so the other language arrives prerendered.
  const toggleLanguage = useCallback(() => {
    window.location.assign(`${otherLanguagePath(window.location.pathname)}${window.location.hash}`)
  }, [])

  return <LanguageContext.Provider value={{ language, toggleLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageState {
  const state = useContext(LanguageContext)

  if (!state) throw new Error('useLanguage must be used inside LanguageProvider')

  return state
}

// Latin digits in both languages, so years and counts read the same everywhere.
export const dateLocale = (language: Language) => language === 'ar' ? 'ar-IQ-u-nu-latn' : 'en-GB'

export const pick = <T,>(language: Language, en: T, ar: T | undefined): T => language === 'ar' && ar !== undefined ? ar : en


// Arabic counted nouns change form by number: ‏مقال واحد، مقالان، 3 مقالات، 11 مقالاً.

// Comma that matches the script: ", " in English, "، " in Arabic.
export const comma = (language: Language) => language === 'ar' ? '، ' : ', '
