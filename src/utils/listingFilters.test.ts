import { describe, expect, it } from 'vitest'
import { ALL_TAGS, readListingQuery, readListingTag, withListingQuery, withListingTag } from './listingFilters'

const knownTags = new Set(['golang', 'postgresql'])

describe('listing filters in the URL', () => {
  it('reads a tag and a search text', () => {
    const params = new URLSearchParams('tag=golang&q=retry')

    expect(readListingTag(params, knownTags)).toBe('golang')
    expect(readListingQuery(params)).toBe('retry')
  })

  it('shows all posts when the URL carries no tag or a tag no post has', () => {
    expect(readListingTag(new URLSearchParams(), knownTags)).toBe(ALL_TAGS)
    expect(readListingTag(new URLSearchParams('tag=go'), knownTags)).toBe(ALL_TAGS)
    expect(readListingQuery(new URLSearchParams())).toBe('')
  })

  it('leaves the default tag and an empty search text out of the URL', () => {
    expect(withListingTag(new URLSearchParams('q=retry'), ALL_TAGS).toString()).toBe('q=retry')
    expect(withListingQuery(new URLSearchParams('tag=golang'), '  ').toString()).toBe('tag=golang')
  })

  it('keeps the other filter when one of them changes', () => {
    expect(withListingTag(new URLSearchParams('q=retry'), 'golang').toString()).toBe('q=retry&tag=golang')
    expect(withListingQuery(new URLSearchParams('tag=golang'), 'retry').toString()).toBe('tag=golang&q=retry')
  })
})
