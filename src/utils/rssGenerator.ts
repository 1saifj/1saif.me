import { publishedBlogs } from '../data/blogs'
import { articles } from './contentLoader'
import { createSlugFromTitle } from './slugUtils'

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  guid: string
  category: string[]
  author: string
  content?: string
}

interface RSSFeed {
  title: string
  description: string
  link: string
  language: string
  lastBuildDate: string
  managingEditor: string
  webMaster: string
  items: RSSItem[]
}

/**
 * Generate RSS feed XML for the blog
 */
export function generateRSSFeed(): string {
  const baseUrl = 'https://1saif.me'
  const now = new Date().toUTCString()
  
  const rssItems: RSSItem[] = publishedBlogs.map(blog => {
    const slug = createSlugFromTitle(blog.title)
    const articleContent = articles.find(a => createSlugFromTitle(a.frontmatter.title) === slug)
    
    // Clean content for RSS (remove markdown and HTML)
    const cleanContent = articleContent?.content
      ?.replace(/```[\s\S]*?```/g, '') // Remove code blocks
      ?.replace(/`[^`]+`/g, '') // Remove inline code
      ?.replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      ?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      ?.replace(/[#*_~]/g, '') // Remove markdown formatting
      ?.replace(/\n+/g, ' ') // Replace newlines with spaces
      ?.trim()
      ?.substring(0, 500) + '...' || blog.description

    return {
      title: blog.title,
      description: blog.description,
      link: `${baseUrl}/blog/${slug}`,
      pubDate: new Date(blog.createdAt).toUTCString(),
      guid: `${baseUrl}/blog/${slug}`,
      category: blog.tags,
      author: 'saif@1saif.me (Saif Aljanahi)',
      content: cleanContent
    }
  }).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  const feed: RSSFeed = {
    title: 'Saif Aljanahi - Full-Stack Engineer Blog',
    description: 'Latest articles on web development, software engineering, and technology by Saif Aljanahi',
    link: `${baseUrl}/blog`,
    language: 'en-US',
    lastBuildDate: now,
    managingEditor: 'saif@1saif.me (Saif Aljanahi)',
    webMaster: 'saif@1saif.me (Saif Aljanahi)',
    items: rssItems
  }

  return generateRSSXML(feed)
}

/**
 * Generate RSS XML from feed data
 */
function generateRSSXML(feed: RSSFeed): string {
  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(feed.title)}</title>
    <description>${escapeXML(feed.description)}</description>
    <link>${feed.link}</link>
    <language>${feed.language}</language>
    <lastBuildDate>${feed.lastBuildDate}</lastBuildDate>
    <managingEditor>${feed.managingEditor}</managingEditor>
    <webMaster>${feed.webMaster}</webMaster>
    <atom:link href="https://1saif.me/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://1saif.me/sj.png</url>
      <title>${escapeXML(feed.title)}</title>
      <link>${feed.link}</link>
      <width>144</width>
      <height>144</height>
    </image>`

  feed.items.forEach(item => {
    xml += `
    <item>
      <title>${escapeXML(item.title)}</title>
      <description>${escapeXML(item.description)}</description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <author>${item.author}</author>`
    
    if (item.content) {
      xml += `
      <content:encoded><![CDATA[${item.content}]]></content:encoded>`
    }
    
    item.category.forEach(cat => {
      xml += `
      <category>${escapeXML(cat)}</category>`
    })
    
    xml += `
    </item>`
  })

  xml += `
  </channel>
</rss>`

  return xml
}

/**
 * Generate JSON Feed (modern alternative to RSS)
 */
export function generateJSONFeed(): string {
  const baseUrl = 'https://1saif.me'
  
  const jsonItems = publishedBlogs.map(blog => {
    const slug = createSlugFromTitle(blog.title)
    const articleContent = articles.find(a => createSlugFromTitle(a.frontmatter.title) === slug)
    
    return {
      id: `${baseUrl}/blog/${slug}`,
      url: `${baseUrl}/blog/${slug}`,
      title: blog.title,
      content_text: blog.description,
      content_html: articleContent?.content || blog.description,
      summary: blog.description,
      date_published: new Date(blog.createdAt).toISOString(),
      date_modified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
      author: {
        name: 'Saif Aljanahi',
        url: baseUrl,
        avatar: `${baseUrl}/sj.png`
      },
      tags: blog.tags,
      image: blog.featuredImage ? `${baseUrl}${blog.featuredImage}` : `${baseUrl}/sj_image.jpeg`
    }
  }).sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime())

  const jsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Saif Aljanahi - Full-Stack Engineer Blog',
    description: 'Latest articles on web development, software engineering, and technology by Saif Aljanahi',
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/feed.json`,
    icon: `${baseUrl}/sj.png`,
    favicon: `${baseUrl}/favicon.png`,
    author: {
      name: 'Saif Aljanahi',
      url: baseUrl,
      avatar: `${baseUrl}/sj.png`
    },
    language: 'en-US',
    items: jsonItems
  }

  return JSON.stringify(jsonFeed, null, 2)
}

/**
 * Generate sitemap XML for better SEO
 */
export function generateSitemap(): string {
  const baseUrl = 'https://1saif.me'
  const now = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/resume</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`

  // Add blog posts
  publishedBlogs.forEach(blog => {
    const slug = createSlugFromTitle(blog.title)
    const lastmod = blog.updatedAt 
      ? new Date(blog.updatedAt).toISOString().split('T')[0]
      : new Date(blog.createdAt).toISOString().split('T')[0]
    
    sitemap += `
  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
  })

  sitemap += `
</urlset>`

  return sitemap
}

/**
 * Save RSS feed to public directory (for build-time generation)
 */
export function saveRSSFiles(): void {
  try {
    // This would typically be used in a build script
    const rssXML = generateRSSFeed()
    const jsonFeed = generateJSONFeed()
    const sitemap = generateSitemap()
    
    // In a real implementation, you'd write these to files
    console.log('RSS XML generated:', rssXML.length, 'characters')
    console.log('JSON Feed generated:', jsonFeed.length, 'characters')
    console.log('Sitemap generated:', sitemap.length, 'characters')
    
    // For client-side usage, you might want to trigger downloads
    // or send to a server endpoint
  } catch (error) {
    console.error('Failed to generate RSS files:', error)
  }
}

/**
 * Download RSS feed as a file for users
 */
export function downloadRSSFeed(blogs: any[]): void {
  try {
    const rssXML = generateRSSFeed()
    
    // Create a Blob with the RSS content
    const blob = new Blob([rssXML], { type: 'application/rss+xml' })
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob)
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = 'saif-aljanahi-blog-rss.xml'
    link.style.display = 'none'
    
    // Add to DOM, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL
    window.URL.revokeObjectURL(url)
    
    console.log('RSS feed download initiated')
  } catch (error) {
    console.error('Failed to download RSS feed:', error)
  }
}