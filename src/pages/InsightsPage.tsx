import React, { useEffect, useRef, useState } from 'react'
import { SiteHeader } from '../components/SiteHeader'
import SEOHead from '../components/SEOHead'
import { SiteFooter } from '../components/SiteFooter'
import { publishedBlogs } from '../data/blogs'
import { dateLocale, useLanguage, type Language } from '../i18n/language'
import { createSlugFromTitle } from '../utils/slugUtils'

// The owner's numbers, from /api/insights (README, Insights). Anyone else gets a 404 there.
type Metric = 'lcp' | 'inp' | 'cls' | 'ttfb'

type SpeedRow = { device: string } & { [Key in `${Metric}${'' | 'Good' | 'Poor'}`]: number | null }

interface DayCount {
  day: string
  count: number
}

interface Insights {
  from: string
  before: string
  // The first day with recorded views, or null before the first one.
  first: string | null
  read: number
  daily: { day: string; views: number; visitors: number; seconds: number; engaged: number }[]
  pages: { page: string; day: string; views: number; visitors: number; entries: number; seconds: number; scroll: number | null; scrolled: number; arabic: number }[]
  acquisition: { channel: string; source: string; medium: string; campaign: string; content: string; visitors: number; engaged: number }[]
  audience: { device: string; browser: string; os: string; country: string; visitors: number; engaged: number }[]
  hours: { weekday: number; hour: number; visitors: number }[]
  speed: SpeedRow[]
  likes: { slug: string; count: number }[]
  comments: { slug: string; count: number }[]
  likesDaily: DayCount[]
  commentsDaily: DayCount[]
}

interface Day {
  day: string
  views: number
  visitors: number
  seconds: number
  engaged: number
  likes: number
  comments: number
}

interface Row {
  page: string
  title: string
  post: boolean
  visitors: number
  before: number
  views: number
  entries: number
  seconds: number
  scroll: number
  scrolled: number
  arabic: number
  likes: number
  comments: number
  trend: number[]
}

interface Count {
  name: string
  label: string
  visitors: number
  engaged: number
}

type Status = 'loading' | 'private' | 'failed' | 'ready'

type Rating = 'good' | 'ni' | 'poor'

const RANGES = [7, 30, 90, 365]

const DAY = 24 * 60 * 60 * 1000

// D1's free plan reads five million rows a day.
const FREE_READS = 5_000_000

// Core Web Vitals limits (web.dev), as the Worker counts them. CLS has no unit; the others are milliseconds.
const SPEED: [Metric, number, number][] = [['lcp', 2500, 4000], ['inp', 200, 500], ['cls', 0.1, 0.25], ['ttfb', 800, 1800]]

const DEVICES = ['mobile', 'tablet', 'desktop']

const RATING_ICONS = new Map<Rating, string>([['good', '✓'], ['ni', '!'], ['poor', '✕']])

const copy = {
  en: {
    title: 'Insights',
    description: 'Visits, sources, audience, reading and speed on 1saif.me.',
    note: 'No cookies and no stored IP addresses. A visitor ID changes every day, so a visitor counts once a day. Your own visits are not counted. Days are Baghdad time.',
    range: 'Time range',
    days: (days: number) => `${days} days`,
    period: (from: string, to: string, before: string, end: string) => `${from} – ${to}, compared with ${before} – ${end}`,
    since: (from: string, to: string, first: string) => `${from} – ${to}. Views are recorded from ${first}, so changes show once a full period before is recorded.`,
    unrecorded: (from: string, to: string) => `${from} – ${to}. No views are recorded yet.`,
    exportCsv: 'Export CSV',
    loading: 'Loading the numbers…',
    private: 'This page opens only for the site owner.',
    signIn: 'Sign in with GitHub',
    failed: 'The numbers did not load.',
    retry: 'Try again',
    kpis: ['Visitors', 'Page views', 'Time per visitor', 'Engaged visits', 'Likes', 'Comments'],
    kpiNotes: ['One a day each', 'All pages', 'Time the page was visible', 'Two pages, or ten seconds', 'Posts', 'Posts'],
    fresh: 'New',
    same: 'No change',
    change: (text: string, days: number) => `${text} against the ${days} days before`,
    traffic: 'Traffic',
    legend: ['Visitors', 'Previous period'],
    dayReadout: (day: string, visitors: string, views: string, likes: string, comments: string) => `${day}: ${visitors} visitors, ${views} views, ${likes} likes, ${comments} comments.`,
    earlier: (visitors: string) => ` Same place in the period before: ${visitors}.`,
    rangeReadout: (visitors: string, views: string) => `${visitors} visitors and ${views} views in this range. Point at a bar for its numbers.`,
    highlights: 'Highlights',
    bestDay: (day: string, visitors: string) => [`Best day: `, day, `, with ${visitors} visitors.`],
    topPost: (title: string, visitors: string) => [`Most read: `, title, `, by ${visitors} visitors.`],
    topChannel: (channel: string, share: string) => [`${channel} started `, share, ` of visits.`],
    aiVisits: (visits: string) => ['Visits from AI assistants: ', visits, '.'],
    phones: (share: string) => [`Phones made `, share, ` of visits.`],
    arabic: (share: string) => [`Arabic pages had `, share, ` of readers.`],
    reading: (share: string) => [`Readers reached `, share, ` of a post on average.`],
    speedPass: ['Every device passes ', 'Core Web Vitals', '.'],
    speedFail: (device: string, metrics: string) => [`${device} needs work on `, metrics, '.'],
    channels: 'Where visits start',
    splitHead: ['Visits', 'Engaged'],
    sources: 'Sources',
    campaigns: 'Campaigns',
    campaignColumns: ['Source', 'Medium', 'Campaign', 'Link', 'Visits'],
    noCampaigns: 'No tagged links in this range. Add utm_source, utm_medium and utm_campaign to the links you share, and utm_content to tell two links of one campaign apart.',
    channelNames: new Map([['ai', 'AI assistants'], ['search', 'Search'], ['social', 'Social'], ['referral', 'Other sites'], ['email', 'Email'], ['paid', 'Ads'], ['direct', 'Direct']]),
    devices: 'Devices',
    browsers: 'Browsers',
    systems: 'Systems',
    countries: 'Countries',
    deviceNames: new Map([['mobile', 'Phone'], ['tablet', 'Tablet'], ['desktop', 'Desktop']]),
    inApp: 'In-app browser',
    hours: 'When readers come',
    hoursNote: 'Visits by weekday and hour, Baghdad time.',
    hourReadout: (day: string, hour: string, visits: string) => `${day}, ${hour}: ${visits} visits`,
    busiest: (day: string, hour: string) => `Busiest: ${day}, ${hour}. Point at a cell for its visits.`,
    posts: 'Posts',
    pages: 'Other pages',
    columns: ['#', 'Page', 'Trend', 'Visitors', 'Change', 'Views', 'Entries', 'Time', 'Read', 'Likes', 'Comments'],
    speed: 'Speed for real visitors',
    speedNote: 'The share of page loads within Google’s Core Web Vitals limits. A device passes a metric when 75% of its loads are good, which is Google’s p75 test.',
    metricNames: new Map<Metric, string>([['lcp', 'Loading (LCP)'], ['inp', 'Response (INP)'], ['cls', 'Stability (CLS)'], ['ttfb', 'Server (TTFB)']]),
    ratings: new Map<Rating, string>([['good', 'Good'], ['ni', 'Needs work'], ['poor', 'Poor']]),
    good: (share: string) => `${share} good`,
    loads: (count: string) => `${count} loads`,
    noSpeed: 'No measured loads yet.',
    passes: 'Passes Core Web Vitals',
    fails: (metrics: string) => `Needs work: ${metrics}`,
    cost: (rows: string, share: string) => `This report read ${rows} database rows, ${share} of the free daily limit.`,
    none: 'Nothing yet in this range.',
    minutes: (minutes: string, seconds: string) => `${minutes}m ${seconds}s`,
  },
  ar: {
    title: 'الإحصاءات',
    description: 'الزيارات والمصادر والجمهور والقراءة والسرعة على 1saif.me.',
    note: 'لا ملفات تعريف ارتباط ولا عناوين IP محفوظة. يتغيّر مُعرّف الزائر كل يوم، فيُحسب الزائر مرة واحدة في اليوم. ولا تُحسب زياراتك أنت. والأيام بتوقيت بغداد.',
    range: 'المدة',
    days: (days: number) => `${days} يوماً`,
    period: (from: string, to: string, before: string, end: string) => `${from} – ${to}، مقارنةً بـ ${before} – ${end}`,
    since: (from: string, to: string, first: string) => `${from} – ${to}. تُسجَّل الزيارات منذ ${first}، فتظهر التغيّرات حين تُسجَّل مدة سابقة كاملة.`,
    unrecorded: (from: string, to: string) => `${from} – ${to}. لم تُسجَّل أي زيارة بعد.`,
    exportCsv: 'تصدير CSV',
    loading: 'جارٍ تحميل الأرقام…',
    private: 'هذه الصفحة لصاحب الموقع فقط.',
    signIn: 'سجّل الدخول عبر GitHub',
    failed: 'لم تُحمَّل الأرقام.',
    retry: 'أعد المحاولة',
    kpis: ['الزوار', 'زيارات الصفحات', 'الوقت لكل زائر', 'الزيارات المتفاعلة', 'الإعجابات', 'التعليقات'],
    kpiNotes: ['مرة في اليوم لكل زائر', 'كل الصفحات', 'مدة ظهور الصفحة', 'صفحتان أو عشر ثوانٍ', 'المقالات', 'المقالات'],
    fresh: 'جديد',
    same: 'بلا تغيير',
    change: (text: string, days: number) => `${text} مقارنةً بالـ ${days} يوماً السابقة`,
    traffic: 'الزيارات',
    legend: ['الزوار', 'المدة السابقة'],
    dayReadout: (day: string, visitors: string, views: string, likes: string, comments: string) => `${day}: ${visitors} زائراً، ${views} زيارة، ${likes} إعجاباً، ${comments} تعليقاً.`,
    earlier: (visitors: string) => ` الموضع المقابل في المدة السابقة: ${visitors}.`,
    rangeReadout: (visitors: string, views: string) => `${visitors} زائراً و${views} زيارة في هذه المدة. أشر إلى عمود لترى أرقامه.`,
    highlights: 'أبرز ما في المدة',
    bestDay: (day: string, visitors: string) => ['أفضل يوم: ', day, `، بـ ${visitors} زائراً.`],
    topPost: (title: string, visitors: string) => ['الأكثر قراءة: ', title, `، قرأه ${visitors} زائراً.`],
    topChannel: (channel: string, share: string) => ['بدأ ', share, ` من الزيارات من ${channel}.`],
    aiVisits: (visits: string) => ['الزيارات من مساعدات الذكاء الاصطناعي: ', visits, '.'],
    phones: (share: string) => ['جاءت ', share, ' من الزيارات من الهواتف.'],
    arabic: (share: string) => ['قرأ الصفحات العربية ', share, ' من القرّاء.'],
    reading: (share: string) => ['وصل القرّاء في المتوسط إلى ', share, ' من المقال.'],
    speedPass: ['كل الأجهزة تجتاز ', 'مؤشرات أداء الويب الأساسية', '.'],
    speedFail: (device: string, metrics: string) => [`يحتاج ${device} إلى تحسين في `, metrics, '.'],
    channels: 'من أين تبدأ الزيارات',
    splitHead: ['الزيارات', 'المتفاعلة'],
    sources: 'المصادر',
    campaigns: 'الحملات',
    campaignColumns: ['المصدر', 'الوسيط', 'الحملة', 'الرابط', 'الزيارات'],
    noCampaigns: 'لا روابط موسومة في هذه المدة. أضف utm_source وutm_medium وutm_campaign إلى الروابط التي تشاركها، وutm_content لتميّز بين رابطين في حملة واحدة.',
    channelNames: new Map([['ai', 'مساعدات الذكاء الاصطناعي'], ['search', 'البحث'], ['social', 'التواصل الاجتماعي'], ['referral', 'مواقع أخرى'], ['email', 'البريد'], ['paid', 'الإعلانات'], ['direct', 'مباشر']]),
    devices: 'الأجهزة',
    browsers: 'المتصفحات',
    systems: 'الأنظمة',
    countries: 'البلدان',
    deviceNames: new Map([['mobile', 'الهاتف'], ['tablet', 'الجهاز اللوحي'], ['desktop', 'الحاسوب']]),
    inApp: 'متصفح داخل تطبيق',
    hours: 'متى يأتي القرّاء',
    hoursNote: 'الزيارات حسب اليوم والساعة، بتوقيت بغداد.',
    hourReadout: (day: string, hour: string, visits: string) => `${day}، ${hour}: ${visits} زيارة`,
    busiest: (day: string, hour: string) => `الأكثر ازدحاماً: ${day}، ${hour}. أشر إلى خانة لترى زياراتها.`,
    posts: 'المقالات',
    pages: 'صفحات أخرى',
    columns: ['#', 'الصفحة', 'الاتجاه', 'الزوار', 'التغيّر', 'الزيارات', 'الدخول', 'الوقت', 'القراءة', 'الإعجابات', 'التعليقات'],
    speed: 'السرعة لدى الزوار الحقيقيين',
    speedNote: 'نسبة مرات التحميل ضمن حدود مؤشرات أداء الويب الأساسية من Google. يجتاز الجهاز المؤشر حين تكون 75% من مرات تحميله جيدة، وهو اختبار p75 من Google.',
    metricNames: new Map<Metric, string>([['lcp', 'التحميل (LCP)'], ['inp', 'الاستجابة (INP)'], ['cls', 'الثبات (CLS)'], ['ttfb', 'الخادم (TTFB)']]),
    ratings: new Map<Rating, string>([['good', 'جيد'], ['ni', 'يحتاج تحسيناً'], ['poor', 'ضعيف']]),
    good: (share: string) => `${share} جيدة`,
    loads: (count: string) => `${count} تحميلاً`,
    noSpeed: 'لا تحميلات مقيسة بعد.',
    passes: 'يجتاز مؤشرات أداء الويب الأساسية',
    fails: (metrics: string) => `يحتاج تحسيناً: ${metrics}`,
    cost: (rows: string, share: string) => `قرأ هذا التقرير ${rows} صفاً من قاعدة البيانات، أي ${share} من الحد اليومي المجاني.`,
    none: 'لا شيء بعد في هذه المدة.',
    minutes: (minutes: string, seconds: string) => `${minutes} د ${seconds} ث`,
  },
}

const posts = new Map(publishedBlogs.map(post => [`/blog/${createSlugFromTitle(post.title)}`, post]))

const sum = <Item,>(items: Item[], value: (item: Item) => number) => items.reduce((total, item) => total + value(item), 0)

const dayAfter = (day: string, offset: number) => new Date(Date.parse(`${day}T00:00:00Z`) + offset * DAY).toISOString().slice(0, 10)

// The range and the period before it, every day filled, with likes and comments by day.
function daysOf(data: Insights, range: number) {
  const visits = new Map(data.daily.map(item => [item.day, item]))
  const likes = new Map(data.likesDaily.map(item => [item.day, item.count]))
  const comments = new Map(data.commentsDaily.map(item => [item.day, item.count]))

  const fill = (start: string) => Array.from({ length: range }, (_, index): Day => {
    const day = dayAfter(start, index)
    const counted = visits.get(day)

    return { day, views: counted?.views ?? 0, visitors: counted?.visitors ?? 0, seconds: counted?.seconds ?? 0, engaged: counted?.engaged ?? 0, likes: likes.get(day) ?? 0, comments: comments.get(day) ?? 0 }
  })

  return { current: fill(data.from), previous: fill(data.before) }
}

// One row per post or page, with the likes and comments of posts that had no views in the range too.
function rowsOf(data: Insights, range: number, language: Language): Row[] {
  const rows = new Map<string, Row>()

  const row = (page: string) => {
    const post = posts.get(page)
    const found = rows.get(page) ?? { page, title: post ? (language === 'ar' && post.titleAr) || post.title : page, post: Boolean(post), visitors: 0, before: 0, views: 0, entries: 0, seconds: 0, scroll: 0, scrolled: 0, arabic: 0, likes: 0, comments: 0, trend: Array.from({ length: range }, () => 0) }

    rows.set(page, found)

    return found
  }

  for (const item of data.pages) {
    const found = row(item.page)

    if (item.day < data.from) {
      found.before += item.visitors
      continue
    }

    found.trend[Math.round((Date.parse(item.day) - Date.parse(data.from)) / DAY)] = item.visitors
    found.visitors += item.visitors
    found.views += item.views
    found.entries += item.entries
    found.seconds += item.seconds
    found.scroll += item.scroll ?? 0
    found.scrolled += item.scrolled
    found.arabic += item.arabic
  }

  for (const { slug, count } of data.likes) row(`/blog/${slug}`).likes = count

  for (const { slug, count } of data.comments) row(`/blog/${slug}`).comments = count

  return [...rows.values()].filter(item => item.visitors || item.likes || item.comments).sort((a, b) => b.visitors - a.visitors || b.views - a.views)
}

// The visits and engaged visits of each name, most visits first, without empty names.
function countsOf<Item extends { visitors: number; engaged: number }>(items: Item[], name: (item: Item) => string) {
  const counts = new Map<string, { visitors: number; engaged: number }>()

  for (const item of items) {
    const found = counts.get(name(item)) ?? { visitors: 0, engaged: 0 }

    if (name(item)) counts.set(name(item), { visitors: found.visitors + item.visitors, engaged: found.engaged + item.engaged })
  }

  return [...counts].sort((a, b) => b[1].visitors - a[1].visitors)
}

// Good, needs-work and poor shares of a device's loads, and the rating at Google's p75 test.
function ratingOf(row: SpeedRow | undefined, metric: Metric) {
  const count = row?.[metric] ?? 0
  const good = row?.[`${metric}Good`] ?? 0
  const poor = row?.[`${metric}Poor`] ?? 0
  const rating: Rating = good >= 0.75 * count ? 'good' : poor > 0.25 * count ? 'poor' : 'ni'

  return { count, good: count && good / count, poor: count && poor / count, rating }
}

// Change against the period before, as a fraction; undefined when there was nothing before.
const changeOf = (now: number, before: number) => before ? (now - before) / before : undefined

// 1, 2, 2.5 or 5 times a power of ten: round numbers for the axis.
function niceCeil(value: number) {
  const step = 10 ** Math.floor(Math.log10(Math.max(1, value)))

  return [1, 2, 2.5, 5, 10].map(factor => factor * step).find(candidate => candidate >= value) ?? value
}

// Cloudflare also reports codes that name no region, such as T1 for Tor, and DisplayNames throws on those.
function nameOf(names: Intl.DisplayNames, code: string) {
  try {
    return names.of(code) ?? code
  } catch {
    return code
  }
}

// A flag from two regional-indicator letters; none for codes that are not a country.
const flagOf = (code: string) => /^[A-Z]{2}$/.test(code) && !['T1', 'XX'].includes(code) ? String.fromCodePoint(...[...code].map(letter => 0x1f1a5 + letter.charCodeAt(0))) : ''

// SAFETY: React passes custom properties through to the style attribute; its CSSProperties type only lists standard ones.
const cssVariable = (name: string, value: number | string) => ({ [name]: value }) as React.CSSProperties

const csvCell = (value: string | number) => /[",\n]/.test(String(value)) ? `"${String(value).replace(/"/g, '""')}"` : String(value)

interface SparklineProps {
  values: number[]
}

// A trend line on its own scale, for a tile or a table row. It shows shape, not size.
function Sparkline({ values }: SparklineProps) {
  const peak = Math.max(1, ...values)
  const step = values.length > 1 ? 100 / (values.length - 1) : 0

  return (
    <svg className="insights-sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden>
      <polyline points={values.map((value, index) => `${index * step},${30 - (value / peak) * 28}`).join(' ')} />
    </svg>
  )
}

interface DeltaProps {
  change: number | undefined
  label: string
  labels: { fresh: string; same: string }
  percent: Intl.NumberFormat
}

// The arrow and the words carry the direction; the color only repeats it.
function Delta({ change, label, labels, percent }: DeltaProps) {
  const trend = change === undefined ? 'new' : Math.abs(change) < 0.005 ? 'flat' : change > 0 ? 'up' : 'down'
  const text = change === undefined ? labels.fresh : trend === 'flat' ? labels.same : `${change > 0 ? '▲' : '▼'} ${percent.format(Math.abs(change))}`

  return <span className="insights-delta" data-trend={trend} title={label}>{text}</span>
}

interface BarListProps {
  items: Count[]
  title: string
  head: string[]
  none: string
  number: Intl.NumberFormat
  percent: Intl.NumberFormat
}

// Each row: its visits and their share, and the share of them that was engaged, which tells a source that brings
// readers from one that brings a glance. The dark part of the bar is the engaged visits.
function BarList({ items, title, head, none, number, percent }: BarListProps) {
  const total = Math.max(1, sum(items, item => item.visitors))
  const most = Math.max(1, ...items.map(item => item.visitors))

  return (
    <section className="insights-card" aria-label={title}>
      <h2>{title}</h2>
      {items.length === 0 ? <p className="insights-empty">{none}</p> : (
        <>
          <p className="insights-split-head" aria-hidden><span>{head[0]}</span><span>{head[1]}</span></p>
          <ul className="insights-split">
            {items.map(item => (
              <li key={item.name}>
                <span className="insights-split-label" dir="auto">{item.label}</span>
                <span className="insights-split-value">{number.format(item.visitors)}<small>{percent.format(item.visitors / total)}</small></span>
                <span className="insights-split-engaged" title={head[1]}>{percent.format(item.engaged / Math.max(1, item.visitors))}<span className="insights-hidden"> {head[1]}</span></span>
                <span className="insights-split-bar" style={cssVariable('--share', item.visitors / most)} aria-hidden>
                  <i style={cssVariable('--share', item.engaged / Math.max(1, item.visitors))} />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

interface FrameProps {
  title: string
  note?: string
  wide?: boolean
  children: React.ReactNode
}

function Frame({ title, note, wide, children }: FrameProps) {
  return (
    <section className="insights-card" data-wide={wide || undefined} aria-label={title}>
      <h2>{title}</h2>
      {note && <p className="insights-card-note">{note}</p>}
      {children}
    </section>
  )
}

export const InsightsPage: React.FC = () => {
  const { language } = useLanguage()
  const t = copy[language]
  const locale = dateLocale(language)
  const [range, setRange] = useState(30)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  // The range travels with its data, so a new range shows the old numbers whole until its own arrive.
  const [loaded, setLoaded] = useState<{ range: number; data: Insights }>()
  const [active, setActive] = useState<number>()
  const [cell, setCell] = useState<[number, number]>()
  // Ranges already read this visit open again without a request: each report reads D1 rows.
  const cache = useRef(new Map<number, Insights>())
  const number = new Intl.NumberFormat(locale)
  const decimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
  const fine = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 })
  const dayName = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const datedName = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  // 4 January 2026 is a Sunday, weekday 0 as SQLite's strftime('%w') counts.
  const weekdayName = (weekday: number, width: 'long' | 'short' = 'long') => new Date(Date.UTC(2026, 0, 4 + weekday)).toLocaleDateString(locale, { weekday: width, timeZone: 'UTC' })
  const hourName = (hour: number) => new Date(Date.UTC(2026, 0, 4, hour)).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
  const duration = (seconds: number) => t.minutes(number.format(Math.floor(seconds / 60)), String(Math.round(seconds % 60)).padStart(2, '0'))

  useEffect(() => {
    const cached = attempt === 0 ? cache.current.get(range) : undefined

    if (cached) {
      setLoaded({ range, data: cached })
      setActive(undefined)

      return
    }

    const controller = new AbortController()

    setStatus(current => current === 'ready' ? current : 'loading')
    fetch(`/api/insights?days=${range}`, { signal: controller.signal })
      .then(async response => {
        if (response.status === 404) return setStatus('private')

        if (!response.ok) throw new Error(String(response.status))

        const data: Insights = await response.json()

        cache.current.set(range, data)
        setLoaded({ range, data })
        setActive(undefined)
        setStatus('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('failed')
      })

    return () => controller.abort()
  }, [range, attempt])

  const signInHref = `/api/auth/github?return=${encodeURIComponent(`${language === 'ar' ? '/ar' : ''}/insights`)}`
  const data = loaded?.data
  const days = loaded ? loaded.range : range
  // A year starts and ends on the same date, so its period names the years.
  const periodName = days > 90 ? datedName : dayName
  // Views are compared only when the whole period before was recorded; a partly recorded one would inflate every change.
  const compared = Boolean(data?.first && data.first <= data.before)

  const head = (
    <header className="insights-head">
      <div>
        <h1>{t.title}</h1>
        {data && <p className="insights-period">{compared ? t.period(periodName(data.from), periodName(dayAfter(data.from, days - 1)), periodName(data.before), periodName(dayAfter(data.before, days - 1))) : data.first ? t.since(periodName(data.from), periodName(dayAfter(data.from, days - 1)), periodName(data.first)) : t.unrecorded(periodName(data.from), periodName(dayAfter(data.from, days - 1)))}</p>}
      </div>
      {status !== 'private' && (
        <div className="insights-controls">
          <div className="insights-range" role="group" aria-label={t.range}>
            {RANGES.map(option => <button key={option} type="button" aria-pressed={option === range} onClick={() => { setAttempt(0); setRange(option) }}>{t.days(option)}</button>)}
          </div>
          {data && <button type="button" className="insights-export" onClick={() => download()}>{t.exportCsv}</button>}
        </div>
      )}
    </header>
  )

  const { current, previous } = data ? daysOf(data, days) : { current: [], previous: [] }
  const rows = data ? rowsOf(data, days, language) : []

  function download() {
    if (!data) return

    const lines = [['page', 'title', 'visitors', 'visitors_before', 'views', 'entries', 'seconds_per_visitor', 'read_percent', 'likes', 'comments']]

    for (const item of rows) lines.push([item.page, item.title, item.visitors, item.before, item.views, item.entries, item.visitors && Math.round(item.seconds / item.visitors), item.scrolled && Math.round(item.scroll / item.scrolled), item.likes, item.comments].map(String))

    const link = document.createElement('a')

    link.href = URL.createObjectURL(new Blob([lines.map(line => line.map(csvCell).join(',')).join('\n')], { type: 'text/csv' }))
    link.download = `insights-${data.from}-${days}d.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (status !== 'ready' || !data) {
    return (
      <>
        <SEOHead title={t.title} description={t.description} url="https://1saif.me/insights" noIndex />
        <div className="site-shell">
          <SiteHeader />
          <main id="main-content">
            <article className="plain-page insights-page">
              {head}
              {status === 'loading' && <p className="insights-message" role="status">{t.loading}</p>}
              {status === 'private' && <p className="insights-message">{t.private} <a href={signInHref}>{t.signIn}</a></p>}
              {status === 'failed' && <p className="insights-message" role="alert">{t.failed} <button type="button" className="insights-retry" onClick={() => setAttempt(value => value + 1)}>{t.retry}</button></p>}
            </article>
          </main>
          <SiteFooter />
        </div>
      </>
    )
  }

  const total = (items: Day[], value: (item: Day) => number) => sum(items, value)
  const visitors = [total(current, item => item.visitors), total(previous, item => item.visitors)]
  const views = [total(current, item => item.views), total(previous, item => item.views)]
  const seconds = [total(current, item => item.seconds), total(previous, item => item.seconds)]
  const engaged = [total(current, item => item.engaged), total(previous, item => item.engaged)]
  const likes = [total(current, item => item.likes), total(previous, item => item.likes)]
  const comments = [total(current, item => item.comments), total(previous, item => item.comments)]
  const perVisitor = (value: number, count: number) => count ? value / count : 0

  // Each tile: its value now, the value before, how to show it, and its daily trend. The last two, likes and comments,
  // were recorded before views, so they always compare.
  const tiles: [number, number, (value: number) => string, number[]][] = [
    [visitors[0], visitors[1], value => number.format(value), current.map(item => item.visitors)],
    [views[0], views[1], value => number.format(value), current.map(item => item.views)],
    [perVisitor(seconds[0], visitors[0]), perVisitor(seconds[1], visitors[1]), duration, current.map(item => perVisitor(item.seconds, item.visitors))],
    [perVisitor(engaged[0], visitors[0]), perVisitor(engaged[1], visitors[1]), value => percent.format(value), current.map(item => perVisitor(item.engaged, item.visitors))],
    [likes[0], likes[1], value => number.format(value), current.map(item => item.likes)],
    [comments[0], comments[1], value => number.format(value), current.map(item => item.comments)],
  ]

  // A bar a day, or a bar a week for a year, which has too many days to fit a bar each.
  const size = days > 90 ? 7 : 1
  const barsOf = (items: Day[]) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))
  const bars = barsOf(current)
  const barsBefore = barsOf(previous)
  const visitorsOf = (bar: Day[]) => sum(bar, item => item.visitors)
  const peak = niceCeil(Math.max(1, ...bars.map(visitorsOf), ...barsBefore.map(visitorsOf)))

  const readout = (index: number) => {
    const bar = bars[index]
    const name = bar.length > 1 ? `${dayName(bar[0].day)} – ${dayName(bar[bar.length - 1].day)}` : dayName(bar[0].day)

    return t.dayReadout(name, number.format(visitorsOf(bar)), number.format(sum(bar, item => item.views)), number.format(sum(bar, item => item.likes)), number.format(sum(bar, item => item.comments))) + (compared ? t.earlier(number.format(visitorsOf(barsBefore[index]))) : '')
  }

  const regions = new Intl.DisplayNames([locale], { type: 'region' })
  const label = (names: Map<string, string>) => ([name, count]: [string, { visitors: number; engaged: number }]): Count => ({ name, label: names.get(name) ?? name, ...count })
  const channels = countsOf(data.acquisition, item => item.channel).map(label(t.channelNames))
  const sources = countsOf(data.acquisition, item => item.source).slice(0, 10).map(label(new Map<string, string>()))
  const campaigns = data.acquisition.filter(item => item.campaign || item.medium || item.content).sort((a, b) => b.visitors - a.visitors).slice(0, 15)
  const devices = countsOf(data.audience, item => item.device).map(label(t.deviceNames))
  const browsers = countsOf(data.audience, item => item.browser).map(label(new Map([['In-app', t.inApp]])))
  const systems = countsOf(data.audience, item => item.os).map(label(new Map<string, string>()))

  const countries = countsOf(data.audience, item => item.country).slice(0, 10).map(([name, count]) => ({ name, label: `${flagOf(name)} ${nameOf(regions, name)}`.trim(), ...count }))

  const hours = new Map(data.hours.map(item => [`${item.weekday} ${item.hour}`, item.visitors]))
  const busiest = data.hours.reduce<Insights['hours'][number] | undefined>((best, item) => !best || item.visitors > best.visitors ? item : best, undefined)
  const hottest = Math.max(1, ...data.hours.map(item => item.visitors))
  const cellVisits = cell ? hours.get(`${cell[0]} ${cell[1]}`) ?? 0 : 0
  const speedRows = new Map(data.speed.map(item => [item.device, item]))
  const speedDevices = DEVICES.filter(device => (speedRows.get(device)?.lcp ?? 0) + (speedRows.get(device)?.ttfb ?? 0) > 0)

  // Core Web Vitals are LCP, INP and CLS; TTFB helps find why LCP is slow but is not one of them.
  const failing = (device: string) => SPEED.slice(0, 3).flatMap(([metric]) => {
    const { count, rating } = ratingOf(speedRows.get(device), metric)

    return count && rating !== 'good' ? [metric.toUpperCase()] : []
  })

  const postRows = rows.filter(item => item.post)
  const best = current.reduce<Day | undefined>((top, item) => !top || item.visitors > top.visitors ? item : top, undefined)
  const topChannel = channels[0]
  const ai = channels.find(item => item.name === 'ai')
  const phones = devices.find(item => item.name === 'mobile')
  const audienceTotal = sum(devices, item => item.visitors)
  const readers = sum(rows, item => item.visitors)
  const scrolled = sum(postRows, item => item.scrolled)
  const slow = speedDevices.find(device => failing(device).length > 0)

  // A highlight shows only when its numbers exist. The middle part of each is the number, in bold.
  const highlights = [
    best?.visitors ? t.bestDay(dayName(best.day), number.format(best.visitors)) : undefined,
    postRows[0] ? t.topPost(postRows[0].title, number.format(postRows[0].visitors)) : undefined,
    topChannel ? t.topChannel(topChannel.label, percent.format(topChannel.visitors / Math.max(1, sum(channels, item => item.visitors)))) : undefined,
    ai ? t.aiVisits(number.format(ai.visitors)) : undefined,
    phones && audienceTotal ? t.phones(percent.format(phones.visitors / audienceTotal)) : undefined,
    readers ? t.arabic(percent.format(sum(rows, item => item.arabic) / readers)) : undefined,
    scrolled ? t.reading(percent.format(sum(postRows, item => item.scroll) / scrolled / 100)) : undefined,
    speedDevices.length === 0 ? undefined : slow ? t.speedFail(t.deviceNames.get(slow) ?? slow, failing(slow).join(', ')) : t.speedPass,
  ].flatMap(item => item ? [item] : [])

  const table = (items: Row[], caption: string) => (
    <section className="insights-card" data-wide aria-label={caption}>
      <h2>{caption}</h2>
      {items.length === 0 ? <p className="insights-empty">{t.none}</p> : (
        <div className="insights-table-wrap">
          <table className="insights-table">
            <thead>
              <tr>{t.columns.map((column, index) => <th key={column} scope="col" className={[2, 5, 6, 8, 9, 10].includes(index) ? 'insights-optional' : undefined}>{column}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.page}>
                  <td className="insights-rank">{number.format(index + 1)}</td>
                  <th scope="row">{item.post ? <a href={`${language === 'ar' ? '/ar' : ''}${item.page}`}>{item.title}</a> : <span dir="ltr">{item.title}</span>}</th>
                  <td className="insights-optional"><Sparkline values={item.trend} /></td>
                  <td>{number.format(item.visitors)}</td>
                  <td>{compared ? <Delta change={changeOf(item.visitors, item.before)} label={t.change(number.format(item.before), days)} labels={t} percent={percent} /> : '–'}</td>
                  <td className="insights-optional">{number.format(item.views)}</td>
                  <td className="insights-optional">{number.format(item.entries)}</td>
                  <td>{item.visitors ? duration(item.seconds / item.visitors) : '–'}</td>
                  <td className="insights-optional">{item.scrolled ? percent.format(item.scroll / item.scrolled / 100) : '–'}</td>
                  <td className="insights-optional">{number.format(item.likes)}</td>
                  <td className="insights-optional">{number.format(item.comments)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )

  return (
    <>
      <SEOHead title={t.title} description={t.description} url="https://1saif.me/insights" noIndex />
      <div className="site-shell">
        <SiteHeader />

        <main id="main-content">
          <article className="plain-page insights-page">
            {head}
            <p className="insights-note">{t.note}</p>

            <dl className="insights-kpis">
              {tiles.map(([now, before, format, trend], index) => (
                <div key={t.kpis[index]} className="insights-kpi">
                  <dt>{t.kpis[index]}<small>{t.kpiNotes[index]}</small></dt>
                  <dd>
                    <span className="insights-kpi-value">{format(now)}</span>
                    {(compared || index > 3) && <Delta change={changeOf(now, before)} label={t.change(format(before), days)} labels={t} percent={percent} />}
                  </dd>
                  <dd className="insights-kpi-trend"><Sparkline values={trend} /></dd>
                </div>
              ))}
            </dl>

            <div className="insights-grid">
              <Frame title={t.traffic} wide>
                <div className="insights-legend" aria-hidden>
                  <span><i className="insights-key-bar" />{t.legend[0]}</span>
                  {compared && <span><i className="insights-key-line" />{t.legend[1]}</span>}
                </div>
                <p className="insights-readout" aria-live="polite">
                  {active !== undefined && bars[active] ? readout(active) : t.rangeReadout(number.format(visitors[0]), number.format(views[0]))}
                </p>
                <div className="insights-traffic" dir="ltr" onMouseLeave={() => setActive(undefined)}>
                  <div className="insights-gridlines" aria-hidden>
                    {[1, 0.5, 0].map(level => <span key={level} style={cssVariable('--level', level)}>{decimal.format(peak * level)}</span>)}
                  </div>
                  <div className="insights-plot">
                    <div className="insights-bars" style={cssVariable('--days', bars.length)}>
                      {bars.map((bar, index) => (
                        <button
                          key={bar[0].day}
                          type="button"
                          className="insights-bar"
                          data-active={index === active || undefined}
                          aria-label={readout(index)}
                          onMouseEnter={() => setActive(index)}
                          onFocus={() => setActive(index)}
                          onBlur={() => setActive(undefined)}
                        >
                          <span style={{ height: `${(visitorsOf(bar) / peak) * 100}%` }} />
                        </button>
                      ))}
                    </div>
                    {compared && (
                      <svg className="insights-line" viewBox={`0 0 ${bars.length} 100`} preserveAspectRatio="none" aria-hidden>
                        <polyline points={barsBefore.map((bar, index) => `${index + 0.5},${100 - (visitorsOf(bar) / peak) * 100}`).join(' ')} />
                      </svg>
                    )}
                  </div>
                  <div className="insights-axis">
                    {[0, Math.floor((bars.length - 1) / 2), bars.length - 1].map(index => <span key={index}>{dayName(bars[index][0].day)}</span>)}
                  </div>
                </div>
              </Frame>

              {highlights.length > 0 && (
                <Frame title={t.highlights} wide>
                  <ul className="insights-highlights">
                    {highlights.map(([before, value, after]) => <li key={before + value}>{before}<strong dir="auto">{value}</strong>{after}</li>)}
                  </ul>
                </Frame>
              )}

              <BarList items={channels} title={t.channels} head={t.splitHead} none={t.none} number={number} percent={percent} />
              <BarList items={sources} title={t.sources} head={t.splitHead} none={t.none} number={number} percent={percent} />

              <Frame title={t.campaigns} wide>
                {campaigns.length === 0 ? <p className="insights-empty">{t.noCampaigns}</p> : (
                  <div className="insights-table-wrap">
                    <table className="insights-table insights-campaigns">
                      <thead><tr>{t.campaignColumns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
                      <tbody>
                        {campaigns.map(item => (
                          <tr key={[item.source, item.medium, item.campaign, item.content].join(' ')}>
                            <th scope="row" dir="auto">{item.source || '–'}</th>
                            <td dir="auto">{item.medium || '–'}</td>
                            <td dir="auto">{item.campaign || '–'}</td>
                            <td dir="auto">{item.content || '–'}</td>
                            <td>{number.format(item.visitors)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Frame>

              <BarList items={devices} title={t.devices} head={t.splitHead} none={t.none} number={number} percent={percent} />
              <BarList items={browsers} title={t.browsers} head={t.splitHead} none={t.none} number={number} percent={percent} />
              <BarList items={systems} title={t.systems} head={t.splitHead} none={t.none} number={number} percent={percent} />
              <BarList items={countries} title={t.countries} head={t.splitHead} none={t.none} number={number} percent={percent} />

              <Frame title={t.hours} note={t.hoursNote} wide>
                <p className="insights-readout" aria-live="polite">
                  {cell ? t.hourReadout(weekdayName(cell[0]), hourName(cell[1]), number.format(cellVisits)) : busiest ? t.busiest(weekdayName(busiest.weekday), hourName(busiest.hour)) : t.none}
                </p>
                <div className="insights-table-wrap">
                  <table className="insights-heatmap" dir="ltr" onMouseLeave={() => setCell(undefined)}>
                    <thead>
                      <tr>
                        <td />
                        {Array.from({ length: 24 }, (_, hour) => <th key={hour} scope="col">{hour % 6 === 0 ? hour : ''}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 7 }, (_, weekday) => (
                        <tr key={weekday}>
                          <th scope="row">{weekdayName(weekday, 'short')}</th>
                          {Array.from({ length: 24 }, (_, hour) => {
                            const count = hours.get(`${weekday} ${hour}`) ?? 0

                            return (
                              <td key={hour} style={cssVariable('--level', count / hottest)} data-empty={count === 0 || undefined} data-active={(cell?.[0] === weekday && cell[1] === hour) || undefined} onMouseEnter={() => setCell([weekday, hour])}>
                                <span className="insights-hidden">{t.hourReadout(weekdayName(weekday), hourName(hour), number.format(count))}</span>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Frame>

              {table(postRows, t.posts)}
              {table(rows.filter(item => !item.post), t.pages)}

              <Frame title={t.speed} note={t.speedNote} wide>
                {speedDevices.length === 0 ? <p className="insights-empty">{t.noSpeed}</p> : (
                  <div className="insights-speed">
                    {speedDevices.map(device => {
                      const row = speedRows.get(device)
                      const fails = failing(device)
                      // Poor when any Core Web Vital is poor, needs work when one only misses good.
                      const verdict: Rating = fails.length === 0 ? 'good' : SPEED.slice(0, 3).some(([metric]) => ratingOf(row, metric).rating === 'poor') ? 'poor' : 'ni'

                      return (
                        <section key={device} className="insights-device" aria-label={t.deviceNames.get(device)}>
                          <h3>{t.deviceNames.get(device)} <small>{t.loads(number.format(row?.lcp || row?.ttfb || 0))}</small></h3>
                          <p className="insights-verdict" data-rating={verdict}>{RATING_ICONS.get(verdict)} {fails.length ? t.fails(fails.join(', ')) : t.passes}</p>
                          <ul className="insights-metrics">
                            {SPEED.map(([metric]) => {
                              const { count, good, poor, rating } = ratingOf(row, metric)

                              return (
                                <li key={metric}>
                                  <span className="insights-metric-name">{t.metricNames.get(metric)}</span>
                                  {count ? (
                                    <>
                                      <span className="insights-rating" data-rating={rating}>{RATING_ICONS.get(rating)} {t.ratings.get(rating)}</span>
                                      <span className="insights-distribution" aria-hidden>
                                        <i data-rating="good" style={cssVariable('--share', good)} />
                                        <i data-rating="ni" style={cssVariable('--share', 1 - good - poor)} />
                                        <i data-rating="poor" style={cssVariable('--share', poor)} />
                                      </span>
                                      <small>{t.good(percent.format(good))} · {t.loads(number.format(count))}</small>
                                    </>
                                  ) : <small>{t.noSpeed}</small>}
                                </li>
                              )
                            })}
                          </ul>
                        </section>
                      )
                    })}
                  </div>
                )}
              </Frame>
            </div>

            <p className="insights-cost">{t.cost(number.format(data.read), fine.format(data.read / FREE_READS))}</p>
          </article>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
