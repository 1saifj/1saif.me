import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let beacon = vi.fn<(url: string, data: string) => boolean>(() => true)

const sentPaths = () => beacon.mock.calls.map(([, data]) => JSON.parse(data).path)

function hide() {
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
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
  window.history.replaceState(null, '', '/a')
})

afterEach(() => {
  // Earlier imports keep their listener; a final hide empties any view they still hold.
  hide()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('insights', () => {
  it('sends one beacon per page view, even when the tab is hidden twice', async () => {
    await start()
    hide()
    hide()

    expect(sentPaths()).toEqual(['/a'])
    expect(beacon.mock.calls[0][0]).toBe('/api/collect')
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

  it('sends nothing from an automated browser', async () => {
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true })
    const { pageView } = await start()

    pageView('/b')
    hide()

    expect(beacon).not.toHaveBeenCalled()
  })
})
