import { describe, expect, it } from 'vitest'
import { isArabicPath, otherLanguagePath } from './language'

describe('language paths', () => {
  it('maps each page to the same page in the other language', () => {
    expect(otherLanguagePath('/')).toBe('/ar')
    expect(otherLanguagePath('/ar')).toBe('/')
    expect(otherLanguagePath('/resume')).toBe('/ar/resume')
    expect(otherLanguagePath('/ar/blog/x')).toBe('/blog/x')
    expect(isArabicPath('/area')).toBe(false)
  })

  it('never produces a URL that leaves the site', () => {
    for (const path of ['/ar//evil.com', '/ar/\\evil.com', '//evil.com', '/\\evil.com']) {
      const target = otherLanguagePath(path)

      expect(target.startsWith('/')).toBe(true)
      expect(target.startsWith('//')).toBe(false)
      expect(new URL(target, 'https://1saif.me').origin).toBe('https://1saif.me')
    }
  })
})
