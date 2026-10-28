import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PostReactions } from './PostReactions'

// React reads this flag to allow act() outside a test renderer.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let reveal: () => void = () => {}

class FakeObserver {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    reveal = () => callback([{ isIntersecting: true }])
  }

  observe() {}

  disconnect() {}
}

let root: Root

let container: HTMLDivElement

const loaded = { likes: 2, comments: [{ id: 1, name: '<b>Ali</b>', body: 'First line\nsecond line', createdAt: 1793221200000 }] }

async function render(answers: (() => Promise<Response>)[]) {
  const fetch = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => (answers.shift() ?? (async () => Response.json({}, { status: 500 })))())

  vi.stubGlobal('fetch', fetch)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(<PostReactions slug="a-post" language="en" />))
  await act(async () => reveal())

  return fetch
}

const button = () => container.querySelector<HTMLButtonElement>('.post-like-button')!

const count = () => container.querySelector('.post-like-count')!.textContent

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  localStorage.clear()
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

describe('PostReactions', () => {
  it('loads once in view and shows comments as plain text', async () => {
    const fetch = await render([async () => Response.json(loaded)])

    expect(fetch).toHaveBeenCalledWith('/api/posts/a-post')
    expect(count()).toBe('2 likes')
    expect(container.querySelector('.post-comment-meta strong')!.textContent).toBe('<b>Ali</b>')
    expect(container.querySelector('.post-comments b')).toBeNull()
  })

  it('puts the like back when the request fails', async () => {
    await render([async () => Response.json(loaded), async () => Response.json({ error: 'rate' }, { status: 429 })])
    await act(async () => button().click())

    expect(button().getAttribute('aria-pressed')).toBe('false')
    expect(count()).toBe('The like was not saved. Try again.')
    expect(localStorage.getItem('liked-posts')).toBeNull()
  })

  it('keeps a saved like, takes the server count and remembers it', async () => {
    const fetch = await render([async () => Response.json(loaded), async () => Response.json({ likes: 3 })])

    await act(async () => button().click())

    expect(button().getAttribute('aria-pressed')).toBe('true')
    expect(count()).toBe('3 likes')
    expect(localStorage.getItem('liked-posts')).toBe('["a-post"]')
    const [, init] = fetch.mock.calls[1]

    expect(init?.method).toBe('PUT')
    expect(JSON.parse(String(init?.body)).visitor).toBe(localStorage.getItem('visitor-id'))
  })
})
