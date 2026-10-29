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

const loaded = { likes: 2, comments: [{ id: 1, body: 'First line\nsecond line', createdAt: 1793221200000, author: { id: 7, login: 'ali', name: '<b>Ali</b>' } }] }

// The Worker sets this cookie at sign-in; jsdom refuses __Host- cookies on http, so the getter is stubbed.
const signIn = () => vi.spyOn(document, 'cookie', 'get').mockReturnValue(`__Host-viewer=${btoa(JSON.stringify({ id: 42, login: 'octocat', name: 'The Octocat' }))}`)

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

const like = () => container.querySelector<HTMLElement>('.post-like-button')!

const count = () => container.querySelector('.post-like-count')!.textContent

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  sessionStorage.clear()
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('PostReactions', () => {
  it('loads once in view and shows comments as plain text', async () => {
    const fetch = await render([async () => Response.json(loaded)])

    expect(fetch.mock.calls).toEqual([['/api/posts/a-post']])
    expect(count()).toBe('2 likes')
    expect(container.querySelector('.post-comment-meta strong')!.textContent).toBe('<b>Ali</b>')
    expect(container.querySelector('.post-comments b')).toBeNull()
    expect(container.querySelector('.post-comment-login')!.getAttribute('dir')).toBe('ltr')
  })

  it('sends a signed-out reader to GitHub and keeps the like for the way back', async () => {
    await render([async () => Response.json(loaded)])
    // jsdom cannot navigate, so the link only records the click.
    container.addEventListener('click', event => event.preventDefault())

    expect(like().tagName).toBe('A')
    expect(like().getAttribute('href')).toBe('/api/auth/github?return=%2Fblog%2Fa-post')
    await act(async () => like().click())
    expect(sessionStorage.getItem('like-intent:a-post')).toBe('1')
  })

  it('shows the signed-in reader\'s own like from its own request', async () => {
    signIn()
    const fetch = await render([async () => Response.json({ liked: true }), async () => Response.json(loaded)])

    expect(fetch.mock.calls.map(([url]) => url)).toEqual(['/api/posts/a-post/like', '/api/posts/a-post'])
    expect(like().getAttribute('aria-pressed')).toBe('true')
  })

  it('shows the count from the reader\'s own request, because the cached post reply may be older', async () => {
    signIn()
    await render([async () => Response.json({ likes: 3, liked: true }), async () => Response.json(loaded)])

    expect(count()).toBe('3 likes')
  })

  it('sends the like clicked before the sign-in, and its count wins over the cached one', async () => {
    signIn()
    sessionStorage.setItem('like-intent:a-post', '1')
    const fetch = await render([async () => Response.json({ likes: 3, liked: true }), async () => Response.json(loaded)])

    expect(fetch.mock.calls[0][1]?.method).toBe('PUT')
    expect(like().getAttribute('aria-pressed')).toBe('true')
    expect(count()).toBe('3 likes')
    expect(sessionStorage.getItem('like-intent:a-post')).toBeNull()
  })

  it('puts the like back when the request fails', async () => {
    signIn()
    await render([async () => Response.json({ liked: false }), async () => Response.json(loaded), async () => Response.json({ error: 'rate' }, { status: 429 })])
    await act(async () => like().click())

    expect(like().getAttribute('aria-pressed')).toBe('false')
    expect(count()).toBe('The like was not saved. Try again.')
  })

  it('takes the server count and state after a like', async () => {
    signIn()
    const fetch = await render([async () => Response.json({ liked: false }), async () => Response.json(loaded), async () => Response.json({ likes: 3, liked: true })])

    await act(async () => like().click())

    expect(like().getAttribute('aria-pressed')).toBe('true')
    expect(count()).toBe('3 likes')
    const [, init] = fetch.mock.calls[2]

    expect(init?.method).toBe('PUT')
    expect(JSON.parse(String(init?.body))).toEqual({ language: 'en' })
  })

  it('turns the button back into the sign-in link when the session has ended', async () => {
    signIn()
    await render([async () => Response.json({ liked: false }), async () => Response.json(loaded), async () => Response.json({ error: 'auth' }, { status: 401 })])
    vi.spyOn(document, 'cookie', 'get').mockReturnValue('')
    await act(async () => like().click())

    expect(like().tagName).toBe('A')
    expect(count()).toBe('Sign in with GitHub to like this post.')
  })

  it('says so when a blocked account\'s like is not stored', async () => {
    signIn()
    await render([async () => Response.json({ likes: 2, liked: false }), async () => Response.json(loaded), async () => Response.json({ likes: 2, liked: false })])
    await act(async () => like().click())

    expect(like().getAttribute('aria-pressed')).toBe('false')
    expect(count()).toBe('This account cannot like posts here.')
  })

  it('says when the account has reached the daily comment limit on this post', async () => {
    signIn()
    await render([async () => Response.json({ likes: 2, liked: false }), async () => Response.json(loaded), async () => Response.json({ error: 'daily' }, { status: 429 })])
    const message = container.querySelector('textarea')!

    // React tracks the value through the native setter, so a plain assignment would not reach onChange.
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(message, 'One more')
    await act(async () => message.dispatchEvent(new Event('input', { bubbles: true })))
    await act(async () => container.querySelector('form')!.requestSubmit())

    expect(container.querySelector('.post-comment-form [role="status"]')!.textContent).toBe('You posted 10 comments on this post today. Try again tomorrow.')
  })

  it('drops a like kept for a sign-in that did not finish', async () => {
    sessionStorage.setItem('like-intent:a-post', '1')
    await render([async () => Response.json(loaded)])

    expect(sessionStorage.getItem('like-intent:a-post')).toBeNull()
  })
})
