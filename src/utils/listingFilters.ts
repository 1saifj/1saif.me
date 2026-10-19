// The blog list keeps its topic and search text in the URL, so a filtered list can be shared and Back returns to it.

export const ALL_TAGS = 'all'

// A tag that no post carries shows every post, so a stale or hand-edited link never lands on an empty list.
export const readListingTag = (params: URLSearchParams, knownTags: ReadonlySet<string>): string => {
  const tag = params.get('tag')

  return tag && knownTags.has(tag) ? tag : ALL_TAGS
}

export const readListingQuery = (params: URLSearchParams): string => params.get('q') ?? ''

// The default tag leaves no ?tag, so a link to the whole list stays bare.
export const withListingTag = (params: URLSearchParams, tag: string): URLSearchParams => {
  const next = new URLSearchParams(params)

  if (tag === ALL_TAGS) next.delete('tag')
  else next.set('tag', tag)

  return next
}

// An empty query leaves no ?q. The typed text is stored as it is, so a trailing space does not move the caret.
export const withListingQuery = (params: URLSearchParams, query: string): URLSearchParams => {
  const next = new URLSearchParams(params)

  if (query.trim()) next.set('q', query)
  else next.delete('q')

  return next
}
