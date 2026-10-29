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

// React tracks the value through the native setter, so a plain assignment would not reach onChange.
async function type(area: HTMLTextAreaElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(area, value)
  await act(async () => area.dispatchEvent(new Event('input', { bubbles: true })))
}

const own = { id: 2, body: 'Mine', createdAt: 1793221300000, editedAt: null, author: { id: 42, login: 'octocat', name: 'The Octocat' } }

const withOwn = { ...loaded, comments: [...loaded.comments, own] }

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
    await type(container.querySelector('textarea')!, 'One more')
    await act(async () => container.querySelector('form')!.requestSubmit())

    expect(container.querySelector('.post-comment-form [role="status"]')!.textContent).toBe('You posted 10 comments on this post today. Try again tomorrow.')
  })

  it('edits the reader\'s own comment in the same editor, then marks it edited', async () => {
    signIn()
    const fetch = await render([async () => Response.json({ likes: 2, liked: false }), async () => Response.json(withOwn), async () => Response.json({ ...own, body: 'Mine, **fixed**', editedAt: 1793221400000 })])
    const edits = container.querySelectorAll<HTMLButtonElement>('.post-comment-edit')

    expect(edits).toHaveLength(1)
    await act(async () => edits[0].click())
    const area = container.querySelector<HTMLTextAreaElement>('.post-comment-editing textarea')!

    expect(area.value).toBe('Mine')
    expect(document.activeElement).toBe(area)
    expect(edits[0].getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.post-comment-editing .comment-toolbar')).not.toBeNull()
    // Two editors are open, so their IDs differ.
    expect(new Set([...container.querySelectorAll('textarea')].map(item => item.id)).size).toBe(2)

    await type(area, 'Mine, **fixed**')
    await act(async () => container.querySelector<HTMLFormElement>('.post-comment-editing')!.requestSubmit())

    const [url, init] = fetch.mock.calls[2]

    expect(url).toBe('/api/posts/a-post/comments/2')
    expect(init?.method).toBe('PATCH')
    expect(Object.fromEntries(new URLSearchParams(String(init?.body)))).toEqual({ message: 'Mine, **fixed**', language: 'en' })
    expect(container.querySelector('.post-comment-editing')).toBeNull()
    expect(container.querySelectorAll('.post-comment-body')[1].innerHTML).toContain('<strong>fixed</strong>')
    expect(container.querySelector('.post-comment-edited')!.textContent).toContain('edited')
    expect(document.activeElement).toBe(edits[0])
  })

  it('sends no request for an unchanged edit, and keeps the editor open with the reason on a refusal', async () => {
    signIn()
    const fetch = await render([async () => Response.json({ likes: 2, liked: false }), async () => Response.json(withOwn), async () => Response.json({ error: 'edits' }, { status: 429 })])
    const edit = container.querySelector<HTMLButtonElement>('.post-comment-edit')!
    const form = () => container.querySelector<HTMLFormElement>('.post-comment-editing')

    await act(async () => edit.click())
    await act(async () => form()!.requestSubmit())
    expect(form()).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(2)

    await act(async () => edit.click())
    await type(form()!.querySelector('textarea')!, 'Changed')
    await act(async () => form()!.requestSubmit())
    expect(form()!.querySelector('[role="status"]')!.textContent).toBe('This comment has reached its limit of 10 edits.')

    await act(async () => form()!.querySelector<HTMLButtonElement>('.post-comment-cancel')!.click())
    expect(form()).toBeNull()
    expect(container.querySelectorAll('.post-comment-body')[1].textContent).toBe('Mine')
    expect(container.querySelector('.post-comment-edited')).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('asks before a delete inside the comment, and keeps focus on a real control', async () => {
    signIn()
    const fetch = await render([async () => Response.json({ likes: 2, liked: false }), async () => Response.json(withOwn), async () => Response.json({ id: 2 })])
    const remove = () => container.querySelector<HTMLButtonElement>('.post-comment-delete')!

    await act(async () => remove().click())
    const question = container.querySelector('.post-comment-actions[role="group"]')!

    expect(question.textContent).toContain('Delete this comment for good?')
    expect(document.activeElement).toBe(remove())

    await act(async () => question.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(container.querySelector('.post-comment-actions[role="group"]')).toBeNull()
    expect(document.activeElement).toBe(remove())
    expect(fetch).toHaveBeenCalledTimes(2)

    await act(async () => remove().click())
    await act(async () => remove().click())

    expect(fetch.mock.calls[2][1]?.method).toBe('DELETE')
    expect(container.querySelectorAll('.post-comments li')).toHaveLength(1)
    expect(document.activeElement).toBe(container.querySelector('#comments-title'))
  })

  it('shows the count, the Author badge on Saif\'s comments and a relative time with the full date on hover', async () => {
    const saif = { ...own, author: { id: 31359390, login: '1saifj', name: 'Saif' }, createdAt: Date.now() - 5 * 60_000 }

    await render([async () => Response.json({ ...loaded, comments: [...loaded.comments, saif] })])

    expect(container.querySelector('#comments-title')!.textContent).toBe('Comments2')
    expect([...container.querySelectorAll('.post-comment-badge')].map(item => item.closest('li')!.querySelector('strong')!.textContent)).toEqual(['Saif'])
    const time = container.querySelectorAll('time')[1]

    expect(time.textContent).toBe('5 minutes ago')
    expect(time.getAttribute('title')).toMatch(/\d{4}/)
  })

  it('keeps Post off until there is text, sends on Ctrl+Enter, and keeps the draft over a reload', async () => {
    signIn()
    sessionStorage.setItem('comment-draft:a-post', 'Saved before the reload')
    const fetch = await render([async () => Response.json({ likes: 2, liked: false }), async () => Response.json(loaded), async () => Response.json({ ...own, id: 3, body: 'Typed' })])
    const area = container.querySelector('textarea')!
    const post = container.querySelector<HTMLButtonElement>('.post-comment-form [type="submit"]')!

    expect(area.value).toBe('Saved before the reload')
    await type(area, '  ')
    expect(post.disabled).toBe(true)
    expect(sessionStorage.getItem('comment-draft:a-post')).toBe('  ')

    await type(area, 'Typed')
    expect(post.disabled).toBe(false)
    expect(sessionStorage.getItem('comment-draft:a-post')).toBe('Typed')
    await act(async () => area.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true })))

    expect(fetch.mock.calls[2][1]?.method).toBe('POST')
    expect(container.querySelector('li.is-fresh')!.textContent).toContain('Typed')
    expect(sessionStorage.getItem('comment-draft:a-post')).toBeNull()
    expect(document.activeElement).toBe(container.querySelector('.post-comment-form textarea'))
  })

  it('keeps the draft saved for the way back from GitHub while the page is signed out', async () => {
    sessionStorage.setItem('comment-draft:a-post', 'Written before the session ended')
    await render([async () => Response.json(loaded)])

    expect(sessionStorage.getItem('comment-draft:a-post')).toBe('Written before the session ended')
  })

  it('clears the drafts and likes kept for every post on sign-out, so the next account in the tab gets none', async () => {
    signIn()
    const fetch = await render([async () => Response.json({ likes: 2, liked: false }), async () => Response.json(loaded), async () => new Response(null, { status: 204 })])

    await type(container.querySelector('textarea')!, 'Half written')
    sessionStorage.setItem('comment-draft:other-post', 'Private thoughts')
    sessionStorage.setItem('like-intent:other-post', '1')
    sessionStorage.setItem('theme', 'dark')
    await act(async () => container.querySelector<HTMLButtonElement>('.post-comment-viewer button')!.click())

    expect(fetch.mock.calls[2][0]).toBe('/api/auth/logout')
    expect(Object.keys(sessionStorage)).toEqual(['theme'])
  })

  it('drops a like kept for a sign-in that did not finish', async () => {
    sessionStorage.setItem('like-intent:a-post', '1')
    await render([async () => Response.json(loaded)])

    expect(sessionStorage.getItem('like-intent:a-post')).toBeNull()
  })
})
