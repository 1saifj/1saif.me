import { describe, expect, it } from 'vitest'
import { closestPost } from './NotFoundPage'

describe('closestPost', () => {
  it('finds the post a shortened address points at', () => {
    expect(closestPost('/blog/retry-strategies')?.title).toBe("Retry Strategies That Don't Make Outages Worse")
    expect(closestPost('/ar/blog/locking-down-vm')?.title).toBe('Locking Down a Small VM Without Spending Money')
  })

  it('suggests nothing for an address with no matching words, or outside the blog', () => {
    expect(closestPost('/blog/zzzz-qqqq')).toBeUndefined()
    expect(closestPost('/nope')).toBeUndefined()
  })
})
