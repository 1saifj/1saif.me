import React, { useEffect, useState } from 'react'
import { SiteHeader } from '../components/SiteHeader'
import SEOHead from '../components/SEOHead'
import { SiteFooter } from '../components/SiteFooter'
import { publishedBlogs } from '../data/blogs'
import { dateLocale, useLanguage, type Language } from '../i18n/language'
import { createSlugFromTitle } from '../utils/slugUtils'

// The owner's page-view, like and comment counts, from /api/insights (README, Insights). Anyone else gets a 404 there.
interface Count {
  name: string
  visitors: number
}

interface Insights {
  from: string
  daily: { day: string; views: number; visitors: number }[]
  pages: { page: string; views: number; visitors: number }[]
  referrers: Count[]
  countries: Count[]
  devices: Count[]
  languages: Count[]
  likes: { slug: string; count: number }[]
  comments: { slug: string; count: number }[]
}

interface Row {
  page: string
  title: string
  views: number
  visitors: number
  likes: number
  comments: number
}

type Status = 'loading' | 'private' | 'failed' | 'ready'

const RANGES = [7, 30, 90]

const DAY = 24 * 60 * 60 * 1000

const copy = {
  en: {
    title: 'Insights',
    description: 'Page views, unique visitors, likes and comments on 1saif.me.',
    note: 'A visitor counts once a day for each page. Your own visits are not counted. Days are Baghdad time.',
    range: 'Time range',
    days: (days: number) => `${days} days`,
    loading: 'Loading the numbers…',
    private: 'This page opens only for the site owner.',
    signIn: 'Sign in with GitHub',
    failed: 'The numbers did not load.',
    retry: 'Try again',
    totals: ['Unique visitors', 'Page views', 'Likes', 'Comments'],
    daily: 'Visitors a day',
    dayReadout: (day: string, visitors: string, views: string) => `${day}: ${visitors} visitors, ${views} views`,
    rangeReadout: (visitors: string, views: string) => `${visitors} visitors and ${views} views in this range. Point at a day for its numbers.`,
    posts: 'Posts',
    pages: 'Other pages',
    columns: ['Page', 'Visitors', 'Views', 'Likes', 'Comments'],
    none: 'Nothing yet in this range.',
    splits: ['Referrers', 'Countries', 'Devices', 'Languages'],
    devices: new Map([['mobile', 'Phone'], ['tablet', 'Tablet'], ['desktop', 'Desktop']]),
  },
  ar: {
    title: 'الإحصاءات',
    description: 'زيارات الصفحات والزوار الفريدون والإعجابات والتعليقات على 1saif.me.',
    note: 'يُحسب الزائر مرة واحدة في اليوم لكل صفحة. ولا تُحسب زياراتك أنت. والأيام بتوقيت بغداد.',
    range: 'المدة',
    days: (days: number) => `${days} يوماً`,
    loading: 'جارٍ تحميل الأرقام…',
    private: 'هذه الصفحة لصاحب الموقع فقط.',
    signIn: 'سجّل الدخول عبر GitHub',
    failed: 'لم تُحمَّل الأرقام.',
    retry: 'أعد المحاولة',
    totals: ['الزوار الفريدون', 'زيارات الصفحات', 'الإعجابات', 'التعليقات'],
    daily: 'الزوار في اليوم',
    dayReadout: (day: string, visitors: string, views: string) => `${day}: ${visitors} زائراً، ${views} زيارة`,
    rangeReadout: (visitors: string, views: string) => `${visitors} زائراً و${views} زيارة في هذه المدة. أشر إلى يوم لترى أرقامه.`,
    posts: 'المقالات',
    pages: 'صفحات أخرى',
    columns: ['الصفحة', 'الزوار', 'الزيارات', 'الإعجابات', 'التعليقات'],
    none: 'لا شيء بعد في هذه المدة.',
    splits: ['المواقع المُحيلة', 'البلدان', 'الأجهزة', 'اللغات'],
    devices: new Map([['mobile', 'هاتف'], ['tablet', 'جهاز لوحي'], ['desktop', 'حاسوب']]),
  },
}

const posts = new Map(publishedBlogs.map(post => [`/blog/${createSlugFromTitle(post.title)}`, post]))

// One row per post or page, with the likes and comments of posts that had no views in the range too.
function rowsOf(data: Insights, language: Language): Row[] {
  const rows = new Map<string, Row>()

  const row = (page: string) => {
    const post = posts.get(page)
    const found = rows.get(page) ?? { page, title: post ? (language === 'ar' && post.titleAr) || post.title : page, views: 0, visitors: 0, likes: 0, comments: 0 }

    rows.set(page, found)

    return found
  }

  for (const { page, views, visitors } of data.pages) Object.assign(row(page), { views, visitors })

  for (const { slug, count } of data.likes) row(`/blog/${slug}`).likes = count

  for (const { slug, count } of data.comments) row(`/blog/${slug}`).comments = count

  return [...rows.values()].sort((a, b) => b.visitors - a.visitors || b.views - a.views)
}

// Every day of the range, with the days that had no views as zero.
function daysOf(data: Insights, days: number) {
  const counted = new Map(data.daily.map(item => [item.day, item]))

  return Array.from({ length: days }, (_, index) => {
    const day = new Date(Date.parse(`${data.from}T00:00:00Z`) + index * DAY).toISOString().slice(0, 10)

    return counted.get(day) ?? { day, views: 0, visitors: 0 }
  })
}

// SAFETY: React passes custom properties through to the style attribute; its CSSProperties type only lists standard ones.
const cssVariable = (name: string, value: number) => ({ [name]: value }) as React.CSSProperties

const sum = <Item,>(items: Item[], value: (item: Item) => number) => items.reduce((total, item) => total + value(item), 0)

// Cloudflare also reports codes that name no region, such as T1 for Tor, and DisplayNames throws on those.
function nameOf(names: Intl.DisplayNames, code: string) {
  try {
    return names.of(code) ?? code
  } catch {
    return code
  }
}

export const InsightsPage: React.FC = () => {
  const { language } = useLanguage()
  const t = copy[language]
  const [range, setRange] = useState(30)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  // The range travels with its data, so a new range shows the old numbers whole until its own arrive.
  const [loaded, setLoaded] = useState<{ range: number; data: Insights }>()
  const [active, setActive] = useState<number>()
  const number = new Intl.NumberFormat(dateLocale(language))
  const dayName = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString(dateLocale(language), { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const readout = (item: { day: string; visitors: number; views: number }) => t.dayReadout(dayName(item.day), number.format(item.visitors), number.format(item.views))

  useEffect(() => {
    const controller = new AbortController()

    setStatus(current => current === 'ready' ? current : 'loading')
    fetch(`/api/insights?days=${range}`, { signal: controller.signal })
      .then(async response => {
        if (response.status === 404) return setStatus('private')

        if (!response.ok) throw new Error(String(response.status))

        setLoaded({ range, data: await response.json() })
        setActive(undefined)
        setStatus('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('failed')
      })

    return () => controller.abort()
  }, [range, attempt])

  const data = loaded?.data
  const rows = data ? rowsOf(data, language) : []
  const days = loaded ? daysOf(loaded.data, loaded.range) : []
  const peak = Math.max(1, ...days.map(item => item.visitors))
  const totals = [sum(days, item => item.visitors), sum(days, item => item.views), sum(rows, item => item.likes), sum(rows, item => item.comments)]
  const shown = active === undefined ? undefined : days[active]
  const regions = new Intl.DisplayNames([dateLocale(language)], { type: 'region' })
  const languages = new Intl.DisplayNames([dateLocale(language)], { type: 'language' })

  const splits = data ? [
    data.referrers.map(item => ({ ...item, label: item.name })),
    data.countries.map(item => ({ ...item, label: nameOf(regions, item.name) })),
    data.devices.map(item => ({ ...item, label: t.devices.get(item.name) ?? item.name })),
    data.languages.map(item => ({ ...item, label: nameOf(languages, item.name) })),
  ] : []

  const signInHref = `/api/auth/github?return=${encodeURIComponent(`${language === 'ar' ? '/ar' : ''}/insights`)}`

  const table = (items: Row[], caption: string) => {
    const most = Math.max(1, ...items.map(item => item.visitors))

    return (
      <section className="insights-section" aria-label={caption}>
        <h2>{caption}</h2>
        {items.length === 0 ? <p>{t.none}</p> : (
          <div className="insights-table-wrap">
            <table className="insights-table">
              <thead><tr>{t.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.page}>
                    <th scope="row">{posts.has(item.page) ? <a href={`${language === 'ar' ? '/ar' : ''}${item.page}`}>{item.title}</a> : <span dir="ltr">{item.title}</span>}</th>
                    <td>
                      <span className="insights-cell-bar" style={cssVariable('--share', item.visitors / most)} aria-hidden />
                      {number.format(item.visitors)}
                    </td>
                    <td>{number.format(item.views)}</td>
                    <td>{number.format(item.likes)}</td>
                    <td>{number.format(item.comments)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    )
  }

  return (
    <>
      <SEOHead title={t.title} description={t.description} url="https://1saif.me/insights" noIndex />
      <div className="site-shell">
        <SiteHeader />

        <main id="main-content">
          <article className="plain-page insights-page">
            <header className="insights-head">
              <div>
                <h1>{t.title}</h1>
                <p className="plain-meta">{t.note}</p>
              </div>
              {status !== 'private' && (
                <div className="insights-range" role="group" aria-label={t.range}>
                  {RANGES.map(days => <button key={days} type="button" aria-pressed={days === range} onClick={() => setRange(days)}>{t.days(days)}</button>)}
                </div>
              )}
            </header>

            {status === 'loading' && <p className="insights-message" role="status">{t.loading}</p>}
            {status === 'private' && <p className="insights-message">{t.private} <a href={signInHref}>{t.signIn}</a></p>}
            {status === 'failed' && <p className="insights-message" role="alert">{t.failed} <button type="button" className="insights-retry" onClick={() => setAttempt(value => value + 1)}>{t.retry}</button></p>}

            {status === 'ready' && data && (
              <>
                <dl className="insights-totals">
                  {t.totals.map((label, index) => <div key={label}><dt>{label}</dt><dd>{number.format(totals[index])}</dd></div>)}
                </dl>

                <section className="insights-section" aria-label={t.daily}>
                  <h2>{t.daily}</h2>
                  <p className="insights-readout" aria-live="polite">
                    {shown ? readout(shown) : t.rangeReadout(number.format(totals[0]), number.format(totals[1]))}
                  </p>
                  <div className="insights-chart" dir="ltr" onMouseLeave={() => setActive(undefined)}>
                    <span className="insights-peak">{number.format(peak)}</span>
                    <div className="insights-bars" style={cssVariable('--days', days.length)}>
                      {days.map((item, index) => (
                        <button
                          key={item.day}
                          type="button"
                          className="insights-bar"
                          data-active={index === active || undefined}
                          aria-label={readout(item)}
                          onMouseEnter={() => setActive(index)}
                          onFocus={() => setActive(index)}
                          onBlur={() => setActive(undefined)}
                        >
                          <span style={{ height: `${(item.visitors / peak) * 100}%` }} />
                        </button>
                      ))}
                    </div>
                    <div className="insights-axis"><span>{dayName(days[0].day)}</span><span>{dayName(days[days.length - 1].day)}</span></div>
                  </div>
                </section>

                {table(rows.filter(item => posts.has(item.page)), t.posts)}
                {table(rows.filter(item => !posts.has(item.page)), t.pages)}

                <div className="insights-splits">
                  {splits.map((items, index) => {
                    const most = Math.max(1, ...items.map(item => item.visitors))

                    return (
                      <section key={t.splits[index]} className="insights-section" aria-label={t.splits[index]}>
                        <h2>{t.splits[index]}</h2>
                        {items.length === 0 ? <p>{t.none}</p> : (
                          <ul className="insights-split">
                            {items.map(item => (
                              <li key={item.name}>
                                <span className="insights-split-label" dir="auto">{item.label}</span>
                                <span className="insights-split-value">{number.format(item.visitors)}</span>
                                <span className="insights-split-bar" style={cssVariable('--share', item.visitors / most)} aria-hidden />
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    )
                  })}
                </div>
              </>
            )}
          </article>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
