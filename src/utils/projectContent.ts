import { processMarkdownFiles } from './markdownFiles'

const projectModules = import.meta.glob<string>('/content/projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

export const projects = processMarkdownFiles(projectModules)

// Arabic bodies share the English file name: content/projects/ar/<slug>.md.
const arabicModules = import.meta.glob<string>('/content/projects/ar/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

export const arabicBodies = new Map(processMarkdownFiles(arabicModules).map(file => [file.slug, file.content]))
