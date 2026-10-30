import { describe, expect, it } from 'vitest'
import { matchRoute } from './routes'

describe('matchRoute', () => {
  it('matches each page the router owns', () => {
    expect(matchRoute('/')).toBe('/')
    expect(matchRoute('/blog')).toBe('/blog')
    expect(matchRoute('/blog/x')).toBe('/blog/:slug')
    expect(matchRoute('/project/x')).toBe('/project/:slug')
    expect(matchRoute('/resume')).toBe('/resume')
    expect(matchRoute('/privacy')).toBe('/privacy')
    expect(matchRoute('/insights')).toBe('/insights')
  })

  it('rejects a shared prefix, a nested slug and another same-origin file', () => {
    expect(matchRoute('/blogish')).toBeUndefined()
    expect(matchRoute('/cv')).toBeUndefined()
    expect(matchRoute('/cv.html')).toBeUndefined()
    expect(matchRoute('/blog/x/y')).toBeUndefined()
    expect(matchRoute('/project/x/y')).toBeUndefined()
    expect(matchRoute('/rss.xml')).toBeUndefined()
  })
})
