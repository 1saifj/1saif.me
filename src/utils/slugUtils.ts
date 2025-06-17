export function createSlugFromTitle(title: string | undefined): string {
  if (!title) {
    return ''
  }
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function findContentBySlug<T extends { frontmatter: { title?: string; name?: string } }>(
  content: T[],
  slug: string
): T | undefined {
  return content.find(item => {
    const title = item.frontmatter.title || item.frontmatter.name || ''
    const itemSlug = createSlugFromTitle(title)
    return itemSlug === slug
  })
}