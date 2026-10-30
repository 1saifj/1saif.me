import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { publishedBlogs } from '../data/blogs'
import { LanguageProvider, type Language } from '../i18n/language'
import { createSlugFromTitle } from '../utils/slugUtils'
import { InsightsPage } from './InsightsPage'

// React reads this flag to allow act() outside a test renderer.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const post = publishedBlogs[0]

const slug = createSlugFromTitle(post.title)

// A 30-day report: 5 October is in the range, 5 September in the period before it.
const insights = {
  from: '2026-10-01',
  before: '2026-09-01',
  first: '2026-08-01',
  read: 1234,
  daily: [
    { day: '2026-09-05', views: 2, visitors: 2, seconds: 20, engaged: 1 },
    { day: '2026-10-05', views: 5, visitors: 3, seconds: 150, engaged: 2 },
  ],
  pages: [
    { page: `/blog/${slug}`, day: '2026-09-05', views: 1, visitors: 1, entries: 1, seconds: 10, scroll: null, scrolled: 0, arabic: 0 },
    { page: `/blog/${slug}`, day: '2026-10-05', views: 4, visitors: 2, entries: 2, seconds: 130, scroll: 150, scrolled: 2, arabic: 1 },
    { page: '/', day: '2026-10-05', views: 1, visitors: 1, entries: 1, seconds: 20, scroll: null, scrolled: 0, arabic: 0 },
  ],
  acquisition: [
    { channel: 'ai', source: 'chatgpt.com', medium: '', campaign: '', visitors: 1, engaged: 1 },
    { channel: 'search', source: 'google.com', medium: '', campaign: '', visitors: 2, engaged: 1 },
    { channel: 'email', source: 'newsletter', medium: 'email', campaign: 'oct', visitors: 1, engaged: 0 },
  ],
  audience: [
    { device: 'mobile', browser: 'Safari', os: 'iOS', country: 'IQ', visitors: 2, engaged: 1 },
    { device: 'desktop', browser: 'In-app', os: 'macOS', country: 'T1', visitors: 1, engaged: 1 },
  ],
  hours: [{ weekday: 2, hour: 21, visitors: 3 }],
  speed: [{ device: 'mobile', lcp: 4, lcpGood: 2, lcpPoor: 1, inp: 2, inpGood: 2, inpPoor: 0, cls: 4, clsGood: 4, clsPoor: 0, ttfb: 4, ttfbGood: 4, ttfbPoor: 0 }],
  likes: [{ slug, count: 1 }],
  comments: [{ slug, count: 2 }],
  likesDaily: [{ day: '2026-10-05', count: 1 }],
  commentsDaily: [{ day: '2026-10-05', count: 2 }],
}

let root: Root

let container: HTMLDivElement

async function show(reply: Response, language: Language = 'en') {
  const fetch = vi.fn(async () => reply)

  vi.stubGlobal('fetch', fetch)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)

  await act(async () => {
    root.render(
      <HelmetProvider>
        <MemoryRouter>
          <LanguageProvider language={language}><InsightsPage /></LanguageProvider>
        </MemoryRouter>
      </HelmetProvider>,
    )
  })

  return fetch
}

const cells = (row: Element | undefined) => [...row?.querySelectorAll('th, td') ?? []].map(cell => cell.textContent)

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

const texts = (selector: string) => [...container.querySelectorAll(selector)].map(item => item.textContent)

const click = (element: Element | null | undefined) => act(async () => element?.dispatchEvent(new MouseEvent('click', { bubbles: true })))

const point = (element: Element | null | undefined) => act(() => element?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })))

describe('InsightsPage', () => {
  it('shows each total with its change against the period before', async () => {
    const fetch = await show(Response.json(insights))

    expect(fetch).toHaveBeenCalledWith('/api/insights?days=30', expect.anything())
    expect(texts('.insights-kpi-value')).toEqual(['3', '5', '0m 50s', '67%', '1', '2'])
    expect(texts('.insights-kpi .insights-delta')).toEqual(['▲ 50%', '▲ 150%', '▲ 400%', '▲ 33%', 'New', 'New'])
    expect(container.querySelector('.insights-period')?.textContent).toBe('1 Oct – 30 Oct, compared with 1 Sept – 30 Sept')
    expect(container.querySelector('.insights-cost')?.textContent).toContain('1,234 database rows, 0.02%')
  })

  it('compares views only once the whole period before was recorded', async () => {
    await show(Response.json({ ...insights, first: '2026-09-20' }))
    const [posts] = container.querySelectorAll('.insights-table:not(.insights-campaigns)')

    expect(container.querySelector('.insights-period')?.textContent).toBe('1 Oct – 30 Oct. Views are recorded from 20 Sept, so changes show once a full period before is recorded.')
    expect(texts('.insights-kpi .insights-delta')).toEqual(['New', 'New'])
    expect(cells(posts.querySelector('tbody tr') ?? undefined)[4]).toBe('–')
    expect(container.querySelector('.insights-line')).toBeNull()
  })

  it('says that no views are recorded yet when there are none', async () => {
    await show(Response.json({ ...insights, first: null }))

    expect(container.querySelector('.insights-period')?.textContent).toBe('1 Oct – 30 Oct. No views are recorded yet.')
  })

  it('ranks posts and pages with their trend, change, time, reading depth and reactions', async () => {
    await show(Response.json(insights))
    const [posts, pages] = container.querySelectorAll('.insights-table:not(.insights-campaigns)')

    expect(cells(posts.querySelector('tbody tr') ?? undefined)).toEqual(['1', post.title, '', '2', '▲ 100%', '4', '2', '1m 05s', '75%', '1', '2'])
    expect(cells(pages.querySelector('tbody tr') ?? undefined)).toEqual(['1', '/', '', '1', 'New', '1', '1', '0m 20s', '–', '0', '0'])
  })

  it('splits visits by channel, source, campaign, device, browser, system and country', async () => {
    await show(Response.json(insights))

    expect(texts('[aria-label="Where visits start"] .insights-split-label')).toEqual(['Search', 'AI assistants', 'Email'])
    expect(texts('[aria-label="Where visits start"] .insights-split-value small')).toEqual(['50%', '25%', '25%'])
    expect(texts('[aria-label="Where visits start"] .insights-split-engaged')).toEqual(['50% Engaged', '100% Engaged', '0% Engaged'])
    expect(texts('[aria-label="Devices"] .insights-split-engaged')).toEqual(['50% Engaged', '100% Engaged'])
    expect(cells(container.querySelector('.insights-campaigns tbody tr') ?? undefined)).toEqual(['newsletter', 'email', 'oct', '1'])
    expect(texts('[aria-label="Browsers"] .insights-split-label')).toEqual(['Safari', 'In-app browser'])
    expect(texts('[aria-label="Countries"] .insights-split-label')).toEqual(['🇮🇶 Iraq', 'T1'])
    expect(container.querySelector('.insights-highlights')?.textContent).toContain(`Most read: ${post.title}, by 2 visitors.`)
    expect(container.querySelector('.insights-highlights')?.textContent).toContain('Visits from AI assistants: 1.')
  })

  it('maps visits by weekday and hour, and names the cell under the pointer', async () => {
    await show(Response.json(insights))

    expect(container.querySelectorAll('.insights-heatmap tbody td')).toHaveLength(168)
    expect(container.querySelector('[aria-label="When readers come"] .insights-readout')?.textContent).toBe('Busiest: Tuesday, 21:00. Point at a cell for its visits.')

    point(container.querySelector('.insights-heatmap tbody tr:nth-child(3) td:nth-of-type(22)'))
    expect(container.querySelector('[aria-label="When readers come"] .insights-readout')?.textContent).toBe('Tuesday, 21:00: 3 visits')
  })

  it("rates each device's speed at Google's p75 test", async () => {
    await show(Response.json(insights))
    const phone = container.querySelector('.insights-device')

    expect(phone?.querySelector('.insights-verdict')?.textContent).toBe('! Needs work: LCP')
    expect([...phone?.querySelectorAll('.insights-rating') ?? []].map(item => item.textContent)).toEqual(['! Needs work', '✓ Good', '✓ Good', '✓ Good'])
    expect(container.querySelector('.insights-highlights')?.textContent).toContain('Phone needs work on LCP.')
  })

  it('asks for a new range once, and names the day under the pointer', async () => {
    const fetch = await show(Response.json(insights))
    const button = (days: string) => [...container.querySelectorAll('.insights-range button')].find(item => item.textContent === days)

    fetch.mockImplementation(async () => Response.json({ ...insights, from: '2026-10-03', before: '2026-09-26' }))
    await click(button('7 days'))

    expect(fetch).toHaveBeenLastCalledWith('/api/insights?days=7', expect.anything())
    expect(button('7 days')?.getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelectorAll('.insights-bar')).toHaveLength(7)

    point(container.querySelectorAll('.insights-bar')[2])
    expect(container.querySelector('.insights-readout')?.textContent).toBe('5 Oct: 3 visitors, 5 views, 1 likes, 2 comments. Same day last period: 0.')

    await click(button('30 days'))
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(container.querySelectorAll('.insights-bar')).toHaveLength(30)
  })

  it('exports the page rows as CSV', async () => {
    let blob = new Blob()

    // jsdom has no object URLs; a subclass adds them without changing the real URL.
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = (file: Blob) => {
        blob = file

        return 'blob:insights'
      }

      static revokeObjectURL = () => {}
    })

    const open = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await show(Response.json(insights))
    await click(container.querySelector('.insights-export'))

    expect(open).toHaveBeenCalled()

    // jsdom's Blob has no text(), but FileReader reads it.
    const text = await new Promise<string>(resolve => {
      const reader = new FileReader()

      reader.onload = () => resolve(String(reader.result))
      reader.readAsText(blob)
    })

    expect(text.split('\n')).toEqual([
      'page,title,visitors,visitors_before,views,entries,seconds_per_visitor,read_percent,likes,comments',
      `/blog/${slug},${post.title.includes(',') ? `"${post.title}"` : post.title},2,1,4,2,65,75,1,2`,
      '/,/,1,0,1,1,20,0,0,0',
    ])
  })

  it('shows the Arabic page with its own words', async () => {
    await show(Response.json(insights), 'ar')

    expect(container.querySelector('h1')?.textContent).toBe('الإحصاءات')
    expect(texts('[aria-label="من أين تبدأ الزيارات"] .insights-split-label')).toEqual(['البحث', 'مساعدات الذكاء الاصطناعي', 'البريد'])
  })

  it('tells anyone but the owner that the page is private, with a sign-in that comes back here', async () => {
    await show(new Response(null, { status: 404 }), 'ar')

    expect(container.querySelector('.insights-kpis')).toBeNull()
    expect(container.querySelector('.insights-message a')?.getAttribute('href')).toBe(`/api/auth/github?return=${encodeURIComponent('/ar/insights')}`)
  })

  it('offers a retry when the numbers fail to load', async () => {
    const fetch = await show(new Response(null, { status: 500 }))

    fetch.mockImplementation(async () => Response.json(insights))
    await click(container.querySelector('.insights-retry'))

    expect(container.querySelectorAll('.insights-kpi')).toHaveLength(6)
  })
})
