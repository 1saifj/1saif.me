interface BlogPost {
  title: string
  description: string
  createdAt: number
  tags: string[]
}

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  guid: string
  categories: string[]
}

export const generateRSSFeed = (posts: BlogPost[], siteUrl: string = 'https://saifaljanahi.dev'): string => {
  const rssItems = posts.map(post => {
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const link = `${siteUrl}/blog/${slug}`
    
    return {
      title: post.title,
      description: post.description,
      link,
      pubDate: new Date(post.createdAt).toUTCString(),
      guid: link,
      categories: post.tags
    }
  })

  const rssXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Saif Aljanahi - Software Engineering Blog</title>
    <description>Technical insights on software engineering, system architecture, and modern development practices</description>
    <link>${siteUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>saifalialjanahi@gmail.com (Saif Aljanahi)</managingEditor>
    <webMaster>saifalialjanahi@gmail.com (Saif Aljanahi)</webMaster>
    <category>Technology</category>
    <category>Software Engineering</category>
    <category>Programming</category>
    <ttl>60</ttl>
    <image>
      <url>${siteUrl}/sj_image.jpeg</url>
      <title>Saif Aljanahi</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${rssItems.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      ${item.categories.map(category => `<category><![CDATA[${category}]]></category>`).join('')}
    </item>`).join('')}
  </channel>
</rss>`

  return rssXML
}

export const downloadRSSFeed = (posts: BlogPost[]) => {
  const rssContent = generateRSSFeed(posts)
  const blob = new Blob([rssContent], { type: 'application/rss+xml' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'rss.xml'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}