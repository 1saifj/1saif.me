import { publishedBlogs } from '../data/blogs'
import { projects } from '../data/projects'
import { createSlugFromTitle } from './slugUtils'

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: string
}

export const generateSitemap = (): string => {
  const baseUrl = 'https://1saif.me' // Update this with your actual domain
  const currentDate = new Date().toISOString().split('T')[0]
  
  const urls: SitemapUrl[] = [
    // Main pages
    {
      loc: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${baseUrl}/blog`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      loc: `${baseUrl}/privacy`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: '0.3'
    },
    
    // Blog posts
    ...publishedBlogs.map(blog => ({
      loc: `${baseUrl}/blog/${createSlugFromTitle(blog.title)}`,
      lastmod: new Date(blog.updatedAt || blog.createdAt).toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: '0.8'
    })),
    
    // Project pages  
    ...projects.map(project => ({
      loc: `${baseUrl}/project/${createSlugFromTitle(project.name)}`,
      lastmod: currentDate,
      changefreq: 'monthly' as const,
      priority: '0.7'
    }))
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return sitemap
}

// Function to download sitemap as XML file
export const downloadSitemap = () => {
  const sitemapContent = generateSitemap()
  const blob = new Blob([sitemapContent], { type: 'text/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'sitemap.xml'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Function to generate robots.txt content
export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://1saif.me' // Update with your actual domain
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Disallow certain paths if needed
Disallow: /api/
Disallow: /_next/
Disallow: /temp/
`
}

// Function to download robots.txt
export const downloadRobotsTxt = () => {
  const robotsContent = generateRobotsTxt()
  const blob = new Blob([robotsContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'robots.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
} 