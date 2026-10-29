import { describe, expect, it } from 'vitest'
import { commentTime } from './commentTime'

const now = Date.UTC(2026, 9, 29, 12)

const date = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

const at = (ago: number, locale = 'en-GB') => commentTime(now - ago, now, locale, date)

describe('commentTime', () => {
  it('reads like GitHub: now, minutes, hours, yesterday, days and weeks', () => {
    expect(at(20_000)).toBe('now')
    expect(at(-5_000)).toBe('now')
    expect(at(5 * 60_000)).toBe('5 minutes ago')
    expect(at(90 * 60_000)).toBe('1 hour ago')
    expect(at(30 * 3_600_000)).toBe('yesterday')
    expect(at(3 * 86_400_000)).toBe('3 days ago')
    expect(at(15 * 86_400_000)).toBe('2 weeks ago')
  })

  it('shows the date after four weeks', () => {
    expect(at(28 * 86_400_000)).toBe('1 Oct 2026')
  })

  it('speaks Arabic on Arabic pages', () => {
    expect(at(30 * 3_600_000, 'ar-IQ-u-nu-latn')).toBe('أمس')
  })
})
