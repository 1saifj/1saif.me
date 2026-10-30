// Anonymous page views and Core Web Vitals: one beacon per page view to /api/collect.
// No cookie, no storage and no ID; the Worker keeps only the referrer's host and a visitor ID that changes
// every day (README, Insights).
import { isArabicPath } from '../i18n/language'

// Entry fields TypeScript's DOM types do not list yet.
interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

interface EventTiming extends PerformanceEntry {
  interactionId?: number
}

interface PageView {
  path: string
  ref: string
  // -1 means not measured: an in-site page change has no LCP or TTFB, and a page without input has no INP.
  lcp: number
  cls: number
  inp: number
  ttfb: number
  landing: boolean
}

let enabled = false

let page: PageView | undefined

function send() {
  if (!page) return

  const { path, ref, lcp, cls, inp, ttfb } = page

  // One beacon per page view: a tab hidden twice, or hidden and then left, sends nothing more.
  page = undefined
  navigator.sendBeacon('/api/collect', JSON.stringify({ path, ref, lang: isArabicPath(path) ? 'ar' : 'en', w: window.innerWidth, lcp, cls, inp, ttfb }))
}

function observe(type: string, read: (entries: PerformanceEntry[]) => void) {
  if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return

  // SAFETY: durationThreshold is a valid option for 'event' entries (40 ms is web-vitals' default) that TypeScript's types lack; other types ignore it.
  new PerformanceObserver(list => read(list.getEntries())).observe({ type, buffered: true, durationThreshold: 40 } as PerformanceObserverInit)
}

// Called by the router on every in-site page change: the old page's beacon goes, a new view starts.
export function pageView(path: string) {
  if (!enabled || path === page?.path) return

  send()
  page = { path, ref: '', lcp: -1, cls: 0, inp: -1, ttfb: -1, landing: false }
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

  // The origin only: a full referrer can carry a long query that would push the beacon past the Worker's 2 KB cap.
  page = { path: location.pathname, ref: document.referrer ? new URL(document.referrer).origin : '', lcp: -1, cls: 0, inp: -1, ttfb: navigation ? navigation.responseStart : -1, landing: true }

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

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') send()
  })
}
