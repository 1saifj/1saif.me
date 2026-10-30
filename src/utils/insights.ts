// Anonymous page views, time on page, scroll depth and Core Web Vitals: one beacon per page view to /api/read.
// No cookie, no storage and no ID; the Worker keeps a visitor ID that changes every day (README, Insights).
import { isArabicPath } from '../i18n/language'

// Entry fields TypeScript's DOM types do not list yet.
interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

interface EventTiming extends PerformanceEntry {
  interactionId?: number
}

// Where the visit came from, read once from the first URL. Only the first page view sends it.
interface Landing {
  // false when the first page was opened from this site, such as a link opened in a new tab.
  entry: boolean
  // The origin only: a full referrer can carry a long query that would push the beacon past the Worker's 2 KB cap.
  ref: string
  source: string
  medium: string
  campaign: string
  content: string
  // The query's parameter names, so the Worker can see a click ID such as gclid. Values are never sent.
  keys: string
}

interface PageView {
  path: string
  landing?: Landing
  // -1 means not measured: an in-site page change has no LCP or TTFB, and a page without input has no INP.
  lcp: number
  cls: number
  inp: number
  ttfb: number
  // Visible time so far in ms, and when the page was last shown (-1 while hidden).
  time: number
  shown: number
  // The lowest point seen and the tallest page height, in px, for the scroll depth.
  bottom: number
  height: number
}

let enabled = false

let page: PageView | undefined

const newPage = (path: string): PageView => ({ path, lcp: -1, cls: 0, inp: -1, ttfb: -1, time: 0, shown: document.visibilityState === 'visible' ? performance.now() : -1, bottom: 0, height: 0 })

function measure() {
  if (!page) return

  page.bottom = Math.max(page.bottom, scrollY + innerHeight)
  page.height = Math.max(page.height, document.documentElement.scrollHeight)
}

function send() {
  if (!page) return

  const { path, landing, lcp, cls, inp, ttfb, time, shown, bottom, height } = page
  const seconds = Math.round((time + (shown < 0 ? 0 : performance.now() - shown)) / 1000)
  // shortcut: a page left by an in-site link before any scroll keeps the height seen at its first scroll event, which
  // can be a loading placeholder; measure on a timer if short pages show 100% too often.
  const scroll = height ? Math.round((100 * bottom) / height) : -1

  // One beacon per page view: a tab hidden twice, or hidden and then left, sends nothing more.
  page = undefined
  // Not /api/collect: EasyPrivacy, in uBlock Origin and Brave, blocks that path.
  navigator.sendBeacon('/api/read', JSON.stringify({ path, ...landing, lang: isArabicPath(path) ? 'ar' : 'en', touch: navigator.maxTouchPoints > 1, seconds, scroll, lcp, cls, inp, ttfb }))
}

function observe(type: string, read: (entries: PerformanceEntry[]) => void) {
  if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return

  // SAFETY: durationThreshold is a valid option for 'event' entries (40 ms is web-vitals' default) that TypeScript's types lack; other types ignore it.
  new PerformanceObserver(list => read(list.getEntries())).observe({ type, buffered: true, durationThreshold: 40 } as PerformanceObserverInit)
}

// Called by the router on every in-site page change: the old page's beacon goes, a new view starts. The new page is
// already on screen here, so the old one's scroll depth is what its scroll events saw.
export function pageView(path: string) {
  if (!enabled || path === page?.path) return

  send()
  page = newPage(path)
}

export function startInsights() {
  // Automated browsers send nothing. Do Not Track and Global Privacy Control count the same anonymous way:
  // nothing here follows a person across sites or days, or is shared (README, Insights).
  if (navigator.webdriver) return

  // Local dev has a collector only when wrangler dev runs behind the Vite proxy (README, Local dev).
  if (import.meta.env.DEV && !import.meta.env.VITE_INSIGHTS) return

  if (!navigator.sendBeacon || !window.PerformanceObserver) return

  enabled = true
  // SAFETY: entries of type 'navigation' are PerformanceNavigationTiming by definition.
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const query = new URLSearchParams(location.search)
  const tag = (...names: string[]) => (names.map(name => query.get(name)).find(Boolean) ?? '').slice(0, 64)
  const ref = document.referrer ? new URL(document.referrer).origin : ''

  page = {
    ...newPage(location.pathname),
    // The time on page starts with the navigation, not with this script.
    shown: document.visibilityState === 'visible' ? 0 : -1,
    ttfb: navigation ? navigation.responseStart : -1,
    landing: { entry: ref !== location.origin, ref, source: tag('utm_source', 'ref', 'source', 'src'), medium: tag('utm_medium'), campaign: tag('utm_campaign'), content: tag('utm_content'), keys: [...query.keys()].join(',').slice(0, 200) },
  }

  // shortcut: LCP and TTFB are for the first page only. Chrome 151+ reports in-site page changes as soft navigations, but
  // CrUX does not count them yet; measure them in their own columns if the speed card should cover in-site pages.
  observe('largest-contentful-paint', entries => {
    if (page?.landing) page.lcp = entries[entries.length - 1].startTime
  })

  // shortcut: CLS is the plain sum over the page view, not the largest 5 s session window; switch if long pages skew it.
  observe('layout-shift', entries => {
    // SAFETY: the observer is registered for 'layout-shift' only, so every entry is a LayoutShift.
    for (const entry of entries as LayoutShift[]) if (page && !entry.hadRecentInput) page.cls += entry.value
  })

  // shortcut: INP is the slowest interaction, not the 98th percentile; fine while a page view has few interactions.
  observe('event', entries => {
    // SAFETY: the observer is registered for 'event' only, so every entry is an event timing.
    for (const entry of entries as EventTiming[]) if (page && entry.interactionId) page.inp = Math.max(page.inp, entry.duration)
  })

  addEventListener('scroll', measure, { passive: true })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // The page is still the one on screen, so this measures even a page that never scrolled.
      measure()
      send()
    } else if (page && page.shown < 0) {
      page.shown = performance.now()
    }
  })
}
