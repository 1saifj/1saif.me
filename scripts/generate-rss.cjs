const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://1saif.me';
const SITE_NAME = 'Saif Aljanahi';
const SITE_DESCRIPTION = 'Full-Stack Software Engineer specializing in Golang, Python, Flutter, and modern web technologies';
const AUTHOR_EMAIL = 'saifalialjanahi@gmail.com';
const CONTENT_DIR = path.join(__dirname, '../content/articles');
const RSS_OUTPUT = path.join(__dirname, '../public/rss.xml');
const ATOM_OUTPUT = path.join(__dirname, '../public/atom.xml');
const JSON_OUTPUT = path.join(__dirname, '../public/feed.json');

// Read markdown files and extract metadata
function parseMarkdownMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const metadataMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!metadataMatch) return null;
  
  const metadata = {};
  const metadataLines = metadataMatch[1].split('\n');
  
  let currentKey = null;
  let currentArray = null;
  
  metadataLines.forEach(line => {
    if (line.includes(':') && !line.startsWith(' ')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim().replace(/['"]/g, '');
      
      if (value) {
        metadata[key.trim()] = value;
      } else {
        currentKey = key.trim();
        currentArray = [];
      }
    } else if (line.trim().startsWith('-') && currentArray) {
      currentArray.push(line.trim().substring(1).trim());
      metadata[currentKey] = currentArray;
    }
  });
  
  // Extract content after frontmatter
  const contentAfterMatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  const excerpt = contentAfterMatter
    .substring(0, 300)
    .replace(/#+\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim() + '...';
  
  metadata.excerpt = excerpt;
  metadata.content = contentAfterMatter;
  
  return metadata;
}

// Generate slug from filename
function getSlugFromFilename(filename) {
  return filename.replace('.md', '').replace(/_/g, '-');
}

// Get all blog posts
function getBlogPosts() {
  const files = fs.readdirSync(CONTENT_DIR);
  const posts = [];
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(CONTENT_DIR, file);
      const metadata = parseMarkdownMetadata(filePath);
      
      if (metadata) {
        const slug = getSlugFromFilename(file);
        const stats = fs.statSync(filePath);
        
        posts.push({
          slug,
          title: metadata.title || slug,
          description: metadata.description || metadata.excerpt || '',
          excerpt: metadata.excerpt || '',
          content: metadata.content || '',
          updatedAt: metadata.updatedAt || metadata.createdAt || stats.mtime.toISOString().split('T')[0],
          createdAt: metadata.createdAt || stats.birthtime.toISOString().split('T')[0],
          featuredImage: metadata.featuredImage || '',
          tags: Array.isArray(metadata.tags) ? metadata.tags : []
        });
      }
    }
  });
  
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate RSS 2.0 Feed
function generateRSS(posts) {
  const now = new Date().toUTCString();
  const latestPostDate = posts.length > 0 ? new Date(posts[0].createdAt).toUTCString() : now;
  
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <description>${SITE_DESCRIPTION}</description>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${latestPostDate}</pubDate>
    <ttl>60</ttl>
    <copyright>Copyright ${new Date().getFullYear()} ${SITE_NAME}</copyright>
    <managingEditor>${AUTHOR_EMAIL} (${SITE_NAME})</managingEditor>
    <webMaster>${AUTHOR_EMAIL} (${SITE_NAME})</webMaster>
    <image>
      <url>${SITE_URL}/sj.png</url>
      <title>${SITE_NAME} Blog</title>
      <link>${SITE_URL}/blog</link>
    </image>
`;

  posts.forEach(post => {
    const postUrl = `${SITE_URL}/blog/${post.slug}`;
    const imageUrl = post.featuredImage ? `${SITE_URL}${post.featuredImage}` : '';
    const pubDate = new Date(post.createdAt).toUTCString();
    const categories = post.tags.map(tag => `      <category>${escapeXml(tag)}</category>`).join('\n');
    
    const contentHtml = `
      <p>${escapeXml(post.description)}</p>
      ${imageUrl ? `<img src="${imageUrl}" alt="${escapeXml(post.title)}" />` : ''}
      <p><a href="${postUrl}">Read more...</a></p>
    `;
    
    rss += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.excerpt)}</description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${SITE_NAME}</dc:creator>
${categories}
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg"/>` : ''}
    </item>
`;
  });

  rss += `  </channel>
</rss>`;

  return rss;
}

// Generate Atom Feed
function generateAtom(posts) {
  const now = new Date().toISOString();
  const latestPostDate = posts.length > 0 ? new Date(posts[0].updatedAt).toISOString() : now;
  
  let atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE_NAME} Blog</title>
  <subtitle>${SITE_DESCRIPTION}</subtitle>
  <link href="${SITE_URL}/blog" rel="alternate"/>
  <link href="${SITE_URL}/atom.xml" rel="self"/>
  <id>${SITE_URL}/blog</id>
  <updated>${latestPostDate}</updated>
  <author>
    <name>${SITE_NAME}</name>
    <email>${AUTHOR_EMAIL}</email>
    <uri>${SITE_URL}</uri>
  </author>
  <logo>${SITE_URL}/sj.png</logo>
  <icon>${SITE_URL}/favicon.png</icon>
`;

  posts.forEach(post => {
    const postUrl = `${SITE_URL}/blog/${post.slug}`;
    const imageUrl = post.featuredImage ? `${SITE_URL}${post.featuredImage}` : '';
    const published = new Date(post.createdAt).toISOString();
    const updated = new Date(post.updatedAt).toISOString();
    const categories = post.tags.map(tag => `    <category term="${escapeXml(tag)}"/>`).join('\n');
    
    const contentHtml = `
      <p>${escapeXml(post.description)}</p>
      ${imageUrl ? `<img src="${imageUrl}" alt="${escapeXml(post.title)}" />` : ''}
      <p><a href="${postUrl}">Read more...</a></p>
    `;
    
    atom += `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${postUrl}" rel="alternate"/>
    <id>${postUrl}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>${escapeXml(post.excerpt)}</summary>
    <content type="html"><![CDATA[${contentHtml}]]></content>
    <author>
      <name>${SITE_NAME}</name>
      <email>${AUTHOR_EMAIL}</email>
    </author>
${categories}
  </entry>
`;
  });

  atom += `</feed>`;

  return atom;
}

// Generate JSON Feed (jsonfeed.org spec)
function generateJSONFeed(posts) {
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: `${SITE_NAME} Blog`,
    description: SITE_DESCRIPTION,
    home_page_url: `${SITE_URL}/blog`,
    feed_url: `${SITE_URL}/feed.json`,
    icon: `${SITE_URL}/sj.png`,
    favicon: `${SITE_URL}/favicon.png`,
    language: 'en-US',
    authors: [
      {
        name: SITE_NAME,
        url: SITE_URL,
        avatar: `${SITE_URL}/sj_image.jpeg`
      }
    ],
    items: posts.map(post => ({
      id: `${SITE_URL}/blog/${post.slug}`,
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      content_html: post.description,
      summary: post.excerpt,
      image: post.featuredImage ? `${SITE_URL}${post.featuredImage}` : null,
      date_published: new Date(post.createdAt).toISOString(),
      date_modified: new Date(post.updatedAt).toISOString(),
      authors: [{ name: SITE_NAME }],
      tags: post.tags
    }))
  };
  
  return JSON.stringify(feed, null, 2);
}

// Main execution
try {
  console.log('Generating feeds...');
  const posts = getBlogPosts();
  console.log(`Found ${posts.length} blog posts`);
  
  // Generate RSS
  const rss = generateRSS(posts);
  fs.writeFileSync(RSS_OUTPUT, rss);
  console.log(`✅ RSS feed generated at ${RSS_OUTPUT}`);
  
  // Generate Atom
  const atom = generateAtom(posts);
  fs.writeFileSync(ATOM_OUTPUT, atom);
  console.log(`✅ Atom feed generated at ${ATOM_OUTPUT}`);
  
  // Generate JSON Feed
  const jsonFeed = generateJSONFeed(posts);
  fs.writeFileSync(JSON_OUTPUT, jsonFeed);
  console.log(`✅ JSON feed generated at ${JSON_OUTPUT}`);
  
  console.log(`\n📄 Total posts in feeds: ${posts.length}`);
} catch (error) {
  console.error('❌ Error generating feeds:', error);
  process.exit(1);
}
