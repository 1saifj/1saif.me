import matter from 'gray-matter'

export interface ContentFile {
  slug: string
  frontmatter: Record<string, any>
  content: string
}

// Import all markdown files from content directories
const articleModules = import.meta.glob('/content/articles/*.md', { 
  as: 'raw',
  eager: true 
})

const projectModules = import.meta.glob('/content/projects/*.md', { 
  as: 'raw',
  eager: true 
})

function processMarkdownFiles(modules: Record<string, string>): ContentFile[] {
  return Object.entries(modules).map(([path, content]) => {
    const { data: frontmatter, content: markdownContent } = matter(content)
    const slug = path.split('/').pop()?.replace('.md', '') || ''
    
    return {
      slug,
      frontmatter,
      content: markdownContent
    }
  })
}

export const articles = processMarkdownFiles(articleModules)
export const projects = processMarkdownFiles(projectModules)