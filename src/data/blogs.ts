import { BlogPost, blogSchema } from '../schemas/blogSchema'
import { articles } from '../utils/contentLoader'

export const blogs: BlogPost[] = articles
  .map(article => {
    try {
      return blogSchema.parse({
        title: article.frontmatter.title,
        description: article.frontmatter.description,
        createdAt: article.frontmatter.createdAt,
        updatedAt: article.frontmatter.updatedAt,
        draft: article.frontmatter.draft || false,
        tags: article.frontmatter.tags || []
      })
    } catch (error) {
      console.warn(`Failed to parse blog article: ${article.slug}`, error)
      return null
    }
  })
  .filter((blog): blog is BlogPost => blog !== null)
  .sort((a, b) => b.createdAt - a.createdAt)

export const publishedBlogs = blogs.filter(blog => !blog.draft)