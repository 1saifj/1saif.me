import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let beacon = vi.fn<(url: string, data: string) => boolean>(() => true)

const sentPaths = () => beacon.mock.calls.map(([, data]) => JSON.parse(data).path)

const sent = (index: number) => JSON.parse(beacon.mock.calls[index][1])

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { value, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

const hide = () => setVisibility('hidden')

// jsdom has no layout, so the scroll position and page height are set by hand.
function scrollTo(top: number, height: number) {
  Object.defineProperty(window, 'scrollY', { value: top, configurable: true })
  Object.defineProperty(document.documentElement, 'scrollHeight', { value: height, configurable: true })
  window.dispatchEvent(new Event('scroll'))
}

// Module state (the open page view) is per import, so each test gets a fresh copy.
async function start() {
  vi.resetModules()
  const insights = await import('./insights')

  insights.startInsights()

  return insights
}

beforeEach(() => {
  beacon = vi.fn<(url: string, data: string) => boolean>(() => true)
  vi.stubEnv('VITE_INSIGHTS', '1')
  vi.stubGlobal('PerformanceObserver', Object.assign(class {}, { supportedEntryTypes: [] }))
  Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true })
  Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true })
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  Object.defineProperty(document, 'referrer', { value: '', configurable: true })
  window.history.replaceState(null, '', '/a')
})

afterEach(() => {
  // Earlier imports keep their listener; a final hide empties any view they still hold.
  hide()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('insights', () => {
  it('sends one beacon per page view, even when the tab is hidden twice', async () => {
    await start()
    hide()
    hide()

    expect(sentPaths()).toEqual(['/a'])
    expect(beacon.mock.calls[0][0]).toBe('/api/read')
  })

  it('sends the old page when the route changes, then the new one when hidden', async () => {
    const { pageView } = await start()

    pageView('/a')
    pageView('/b')
    hide()

    expect(sentPaths()).toEqual(['/a', '/b'])
  })

  it('sends the referrer origin only', async () => {
    Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/search?q=saif', configurable: true })
    await start()
    hide()

    expect(JSON.parse(beacon.mock.calls[0][1]).ref).toBe('https://www.google.com')
  })

  it('sends where the visit came from with the first page view only, and never a parameter value', async () => {
    Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/search?q=saif', configurable: true })
    window.history.replaceState(null, '', '/a?utm_source=Newsletter&utm_medium=email&utm_content=Post_01&gclid=SECRET')
    const { pageView } = await start()

    pageView('/b')
    hide()

    expect(sent(0)).toMatchObject({ entry: true, ref: 'https://www.google.com', source: 'Newsletter', medium: 'email', campaign: '', content: 'Post_01', keys: 'utm_source,utm_medium,utm_content,gclid' })
    expect(beacon.mock.calls[0][1]).not.toContain('SECRET')
    expect(sent(1)).not.toHaveProperty('entry')
    expect(sent(1)).not.toHaveProperty('ref')
  })

  it('does not count a first page opened from the site itself as an entry', async () => {
    Object.defineProperty(document, 'referrer', { value: `${location.origin}/blog`, configurable: true })
    await start()
    hide()

    expect(sent(0).entry).toBe(false)
  })

  it('sends the visible time and how far the page was read', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0)

    await start()
    scrollTo(732, 2000)
    now.mockReturnValue(12_400)
    hide()

    // 732 px scrolled plus jsdom's 768 px window is 1500 of 2000 px.
    expect(sent(0)).toMatchObject({ seconds: 12, scroll: 75 })
  })

  it('counts only the time the page was visible', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0)

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    await start()
    now.mockReturnValue(5_000)
    setVisibility('visible')
    now.mockReturnValue(9_000)
    hide()

    expect(sent(0).seconds).toBe(4)
  })

  it('counts a browser that sends Do Not Track and Global Privacy Control', async () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true })
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true })
    await start()
    hide()

    expect(sentPaths()).toEqual(['/a'])
  })

  it('sends nothing from an automated browser', async () => {
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true })
    const { pageView } = await start()

    pageView('/b')
    hide()

    expect(beacon).not.toHaveBeenCalled()
  })
})
