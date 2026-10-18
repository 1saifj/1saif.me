export function createSlugFromTitle(title: string | undefined): string {
  if (!title) {
    return ''
  }

  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function findContentBySlug<T extends { slug?: string; frontmatter: { title?: string; name?: string } }>(
  content: T[],
  slug: string
): T | undefined {
  return content.find(item => {
    const titleSlug = createSlugFromTitle(item.frontmatter.title)
    const nameSlug = createSlugFromTitle(item.frontmatter.name)

    return item.slug === slug || titleSlug === slug || nameSlug === slug
  })
}
