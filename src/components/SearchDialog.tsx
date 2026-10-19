import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InterfaceIcon } from './InterfaceIcon'
import { postText, publishedBlogs } from '../data/blogs'
import { projects } from '../data/projects'
import { createSlugFromTitle } from '../utils/slugUtils'
import { dateLocale, Language, pick, SITE_TIME_ZONE, useLanguage } from '../i18n/language'
import './SearchDialog.css'

type Group = 'posts' | 'projects' | 'pages'

type Item = { id: string; group: Group; title: string; detail: string; to: string; lang: Language; haystack: string }

const copy = {
  en: {
    label: 'Search the site', placeholder: 'Search the site', posts: 'Posts', recent: 'Recent posts', projects: 'Projects', pages: 'Pages',
    empty: 'Nothing matches that. Try a tool or a topic, like Go, PostgreSQL or Flutter.', move: 'move', open: 'open', close: 'close', dismiss: 'Close',
    pageList: [['/', 'Home'], ['/#work', 'Experience and projects'], ['/blog', 'Writing'], ['/resume', 'Résumé'], ['/#about', 'About'], ['/#contact', 'Contact'], ['/privacy', 'Privacy']],
  },
  ar: {
    label: 'البحث في الموقع', placeholder: 'ابحث في الموقع', posts: 'المقالات', recent: 'أحدث المقالات', projects: 'المشاريع', pages: 'الصفحات',
    empty: 'لا توجد نتائج. جرّب اسم أداة أو موضوعاً، مثل Go أو PostgreSQL أو Flutter.', move: 'للتنقّل', open: 'للفتح', close: 'للإغلاق', dismiss: 'إغلاق',
    pageList: [['/', 'الصفحة الرئيسية'], ['/#work', 'الخبرة والمشاريع'], ['/blog', 'المقالات'], ['/resume', 'السيرة الذاتية'], ['/#about', 'عنّي'], ['/#contact', 'التواصل'], ['/privacy', 'الخصوصية']],
  },
}

const limits: Record<Group, number> = { posts: 8, projects: 6, pages: 7 }

const buildItems = (language: Language): Item[] => {
  const month = new Intl.DateTimeFormat(dateLocale(language), { month: 'short', year: 'numeric', timeZone: SITE_TIME_ZONE })

  const posts = publishedBlogs.map((post): Item => {
    const text = postText(post, language)

    return { id: `post-${post.file}`, group: 'posts', title: text.title, detail: month.format(post.createdAt), to: `/blog/${createSlugFromTitle(post.title)}`, lang: text.lang,
      haystack: [post.title, post.description, post.titleAr, post.descriptionAr, ...post.tags].join(' ').toLowerCase() }
  })

  const work = projects.map((project): Item => ({
    id: `project-${createSlugFromTitle(project.name)}`, group: 'projects', title: pick(language, project.name, project.ar?.name), detail: pick(language, project.role ?? '', project.ar?.role),
    to: `/project/${createSlugFromTitle(project.name)}`, lang: language,
    haystack: [project.name, project.description, project.role, project.language, project.ar?.name, project.ar?.description].join(' ').toLowerCase(),
  }))

  const pages = copy[language].pageList.map(([to, title]): Item => ({ id: `page-${to}`, group: 'pages', title, detail: '', to, lang: language, haystack: `${title} ${to}`.toLowerCase() }))

  return [...posts, ...work, ...pages]
}

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage()
  const t = copy[language]
  const navigate = useNavigate()
  const dialog = useRef<HTMLDialogElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const items = useMemo(() => buildItems(language), [language])

  const groups = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)

    // Nothing typed yet: the newest posts and the pages, as a starting point.
    const matches = terms.length
      ? items.filter(item => terms.every(term => item.haystack.includes(term)))
        .sort((a, b) => Number(b.title.toLowerCase().includes(terms[0])) - Number(a.title.toLowerCase().includes(terms[0])))
      : items.filter(item => item.group !== 'projects')

    return (['posts', 'projects', 'pages'] as const).flatMap(group => {
      const groupItems = matches.filter(item => item.group === group).slice(0, terms.length || group === 'pages' ? limits[group] : 5)

      return groupItems.length ? [{ group, items: groupItems }] : []
    })
  }, [items, query])

  const flat = groups.flatMap(entry => entry.items)

  useEffect(() => {
    const element = dialog.current

    element?.showModal()

    return () => element?.close()
  }, [])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (item: Item) => {
    dialog.current?.close()
    navigate(item.to)
    const hash = item.to.split('#')[1]

    // Already on the home page, the route doesn't remount, so scroll to the section here.
    if (hash) window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ block: 'start' }), 60)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()

      if (flat.length) setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length)
    } else if (event.key === 'Enter' && flat[active]) {
      event.preventDefault()
      go(flat[active])
    } else if (event.key === 'Escape') {
      // A search field clears itself on Esc; here Esc closes the dialog, as the hint says.
      event.preventDefault()
      dialog.current?.close()
    }
  }

  const href = (to: string) => language === 'ar' ? `/ar${to === '/' ? '' : to.startsWith('/#') ? to.slice(1) : to}` : to

  return (
    <dialog ref={dialog} className="search-dialog" aria-label={t.label} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}>
      <div className="search-field">
        <InterfaceIcon name="search" />
        <input type="search" autoFocus value={query} onChange={event => setQuery(event.target.value)} onKeyDown={onKeyDown} placeholder={t.placeholder} aria-label={t.label}
          role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list" aria-activedescendant={flat[active]?.id} />
        <kbd>Esc</kbd>
        <button type="button" className="search-close" onClick={() => dialog.current?.close()}>{t.dismiss}</button>
      </div>
      <div ref={list} id="search-results" className="search-results" role="listbox" aria-label={t.label}>
        {groups.map(({ group, items: entries }) => <div key={group} role="group" aria-labelledby={`search-${group}`}>
          <p id={`search-${group}`} className="search-group-title">{group === 'posts' && !query.trim() ? t.recent : t[group]}</p>
          {entries.map(item => {
            const index = flat.indexOf(item)

            return <a key={item.id} id={item.id} href={href(item.to)} role="option" aria-selected={index === active} className="search-item"
              onMouseMove={() => setActive(index)} onClick={event => { event.preventDefault(); go(item) }}>
              <span className="search-item-title" lang={item.lang} dir={item.lang === 'ar' ? 'rtl' : 'ltr'}>{item.title}</span>
              {item.detail && <span className="search-item-detail">{item.detail}</span>}
            </a>
          })}
        </div>)}
        {!flat.length && <p className="search-empty">{t.empty}</p>}
      </div>
      <p className="search-hints"><kbd>↑</kbd><kbd>↓</kbd> {t.move} · <kbd>↵</kbd> {t.open} · <kbd>Esc</kbd> {t.close}</p>
    </dialog>
  )
}
