import { processMarkdownFiles } from './markdownFiles'

// One lazy chunk per article, so a post page downloads only its own Markdown.
const articleLoaders = import.meta.glob<string>('/content/articles/*.md', { query: '?raw', import: 'default' })

export async function loadArticle(file: string): Promise<string | undefined> {
  const load = articleLoaders[`/content/articles/${file}.md`]

  if (!load) return undefined

  return processMarkdownFiles({ [file]: await load() })[0]?.content
}
