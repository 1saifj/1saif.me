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

const today = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)

const insights = {
  from: today,
  daily: [{ day: today, views: 5, visitors: 3 }],
  pages: [{ page: `/blog/${slug}`, views: 4, visitors: 2 }, { page: '/', views: 1, visitors: 1 }],
  referrers: [{ name: 'news.ycombinator.com', visitors: 2 }],
  countries: [{ name: 'IQ', visitors: 2 }, { name: 'T1', visitors: 1 }],
  devices: [{ name: 'mobile', visitors: 3 }],
  languages: [{ name: 'ar', visitors: 3 }],
  likes: [{ slug, count: 1 }],
  comments: [{ slug, count: 2 }],
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

describe('InsightsPage', () => {
  it("shows the range's unique visitors, views, likes and comments, per post and per page", async () => {
    const fetch = await show(Response.json(insights))

    expect(fetch).toHaveBeenCalledWith('/api/insights?days=30', expect.anything())
    expect([...container.querySelectorAll('.insights-totals dd')].map(item => item.textContent)).toEqual(['3', '5', '1', '2'])
    expect(container.querySelectorAll('.insights-bar')).toHaveLength(30)

    const [posts, pages] = container.querySelectorAll('.insights-table')

    expect(cells(posts.querySelector('tbody tr') ?? undefined)).toEqual([post.title, '2', '4', '1', '2'])
    expect(cells(pages.querySelector('tbody tr') ?? undefined)).toEqual(['/', '1', '1', '0', '0'])
    expect(container.textContent).toContain('Iraq')
    expect(container.textContent).toContain('T1')
  })

  it('asks for a new range and names the day under the pointer', async () => {
    const fetch = await show(Response.json(insights))
    const week = [...container.querySelectorAll('.insights-range button')].find(button => button.textContent === '7 days')

    fetch.mockImplementation(async () => Response.json({ ...insights }))
    await act(async () => week?.dispatchEvent(new MouseEvent('click', { bubbles: true })))

    expect(fetch).toHaveBeenLastCalledWith('/api/insights?days=7', expect.anything())
    expect(week?.getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelectorAll('.insights-bar')).toHaveLength(7)

    act(() => container.querySelector('.insights-bar')?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })))
    expect(container.querySelector('.insights-readout')?.textContent).toMatch(/: 3 visitors, 5 views$/)
  })

  it('tells anyone but the owner that the page is private, with a sign-in that comes back here', async () => {
    await show(new Response(null, { status: 404 }), 'ar')

    expect(container.querySelector('.insights-totals')).toBeNull()
    expect(container.querySelector('.insights-message a')?.getAttribute('href')).toBe(`/api/auth/github?return=${encodeURIComponent('/ar/insights')}`)
  })

  it('offers a retry when the numbers fail to load', async () => {
    const fetch = await show(new Response(null, { status: 500 }))

    fetch.mockImplementation(async () => Response.json(insights))
    await act(async () => container.querySelector('.insights-retry')?.dispatchEvent(new MouseEvent('click', { bubbles: true })))

    expect(container.querySelectorAll('.insights-totals dd')).toHaveLength(4)
  })
})
