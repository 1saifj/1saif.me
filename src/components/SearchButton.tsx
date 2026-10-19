import React, { useEffect, useState } from 'react'
import { InterfaceIcon } from './InterfaceIcon'
import { useLanguage } from '../i18n/language'

const SearchDialog = React.lazy(() => import('./SearchDialog'))

// The header's search button, on every page. The dialog, with its styles, loads on first use.
export const SearchButton: React.FC = () => {
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)
  const label = language === 'ar' ? 'بحث' : 'Search'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))
      const slash = event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey

      // Ctrl K or ⌘ K anywhere; "/" too, unless the visitor is typing.
      if (slash || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return <>
    <button type="button" className="notebook-search-trigger" aria-label={label} aria-keyshortcuts="Meta+K Control+K /" onClick={() => setOpen(true)}><InterfaceIcon name="search" /><span>{label}</span></button>
    {open && <React.Suspense fallback={null}><SearchDialog onClose={() => setOpen(false)} /></React.Suspense>}
  </>
}
