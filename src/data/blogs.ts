import { BlogPost, blogSchema } from '../schemas/blogSchema'
import { articles } from '../utils/contentLoader'

export const blogs: BlogPost[] = articles
  .map(article => {
    try {
      // Use the full frontmatter data which already has defaults from contentLoader
      const blogData = {
        title: article.frontmatter.title || 'Untitled',
        description: article.frontmatter.description || 'No description available',
        createdAt: article.frontmatter.createdAt || Date.now(),
        updatedAt: article.frontmatter.updatedAt,
        draft: article.frontmatter.draft || false,
        tags: article.frontmatter.tags || []
      }
      
      console.log(`Processing blog: ${article.slug}`, blogData) // Debug log
      
      return blogSchema.parse(blogData)
    } catch (error) {
      console.error(`Failed to parse blog article: ${article.slug}`, error)
      console.log('Article frontmatter:', article.frontmatter) // Debug log
      
      // Return a fallback blog post instead of null
      return {
        title: article.frontmatter.title || article.slug.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: article.frontmatter.description || 'No description available',
        createdAt: article.frontmatter.createdAt || Date.now(),
        updatedAt: article.frontmatter.updatedAt,
        draft: false,
        tags: Array.isArray(article.frontmatter.tags) ? article.frontmatter.tags : []
      } as BlogPost
    }
  })
  .filter((blog): blog is BlogPost => blog !== null)
  .sort((a, b) => b.createdAt - a.createdAt)

export const publishedBlogs = blogs.filter(blog => !blog.draft)