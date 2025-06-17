import { Project, projectSchema } from '../schemas/projectSchema'
import { projects as projectFiles } from '../utils/contentLoader'

export const projects: Project[] = projectFiles
  .map(project => {
    try {
      return projectSchema.parse({
        order: project.frontmatter.order || -1,
        name: project.frontmatter.name,
        description: project.frontmatter.description,
        url: project.frontmatter.url,
        language: project.frontmatter.language,
        wip: project.frontmatter.wip || false,
        isPrivate: project.frontmatter.isPrivate || false,
        sourceType: project.frontmatter.sourceType || 'open-source'
      })
    } catch (error) {
      console.warn(`Failed to parse project: ${project.slug}`, error)
      return null
    }
  })
  .filter((project): project is Project => project !== null)
  .sort((a, b) => (a.order ?? -1) - (b.order ?? -1))