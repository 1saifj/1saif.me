const fs = require('fs');

const path = require('path');

const SITE_URL = 'https://1saif.me';

const CONTENT_DIR = path.join(__dirname, '../content/articles');

const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

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
      const value = valueParts.join(':').trim().replace(/^(['"])(.*)\1$/, '$2');
      
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
  
  return metadata;
}

// Same rule as src/utils/slugUtils.ts, so feed links match the site's routes
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
        const slug = slugify(metadata.title || file.replace('.md', ''));
        const stats = fs.statSync(filePath);
        
        posts.push({
          slug,
          title: metadata.title || slug,
          description: metadata.description || '',
          updatedAt: metadata.updatedAt || metadata.createdAt || stats.mtime.toISOString().split('T')[0],
          createdAt: metadata.createdAt || stats.birthtime.toISOString().split('T')[0],
          featuredImage: metadata.featuredImage || '',
          tags: Array.isArray(metadata.tags) ? metadata.tags : []
        });
      }
    }
  });
  
  return posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

// Generate sitemap XML
function generateSitemap(posts) {
  const now = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    
    <!-- Homepage -->
    <url>
        <loc>${SITE_URL}/</loc>
        <lastmod>${now}T00:00:00+00:00</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
        <image:image>
            <image:loc>${SITE_URL}/sj_image.jpeg</image:loc>
            <image:title>Saif Aljanahi - Software Engineer</image:title>
            <image:caption>Professional photo of Saif Aljanahi, Full-Stack Software Engineer</image:caption>
        </image:image>
    </url>
    
    <!-- Blog Index -->
    <url>
        <loc>${SITE_URL}/blog</loc>
        <lastmod>${now}T00:00:00+00:00</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    
    <!-- Resume -->
    <url>
        <loc>${SITE_URL}/resume</loc>
        <lastmod>${now}T00:00:00+00:00</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    
    <!-- Privacy -->
    <url>
        <loc>${SITE_URL}/privacy</loc>
        <lastmod>${now}T00:00:00+00:00</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
    </url>
`;

  // Add project case studies
  const projectsSource = fs.readFileSync(path.join(__dirname, '../src/data/projects.ts'), 'utf-8');
  [...projectsSource.matchAll(/^    "name": "(.*)",$/gm)].forEach(([, name]) => {
    xml += `
    <url>
        <loc>${SITE_URL}/project/${slugify(name)}</loc>
        <lastmod>${now}T00:00:00+00:00</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
`;
  });

  // Add blog posts
  posts.forEach(post => {
    const imageUrl = post.featuredImage ? `${SITE_URL}${post.featuredImage}` : '';
    
    xml += `    
    <url>
        <loc>${SITE_URL}/blog/${post.slug}</loc>
        <lastmod>${post.updatedAt}T00:00:00+00:00</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>${imageUrl ? `
        <image:image>
            <image:loc>${escapeXml(imageUrl)}</image:loc>
            <image:caption>${escapeXml(post.description)}</image:caption>
            <image:title>${escapeXml(post.title)}</image:title>
        </image:image>` : ''}
    </url>
`;
  });

  xml += `    
    <!-- RSS Feed -->
    <url>
        <loc>${SITE_URL}/rss.xml</loc>
        <lastmod>${now}T00:00:00+00:00</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>
    
</urlset>`;

  return xml;
}

// Escape XML special characters
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main execution
try {
  console.log('Generating sitemap...');
  const posts = getBlogPosts();
  console.log(`Found ${posts.length} blog posts`);
  
  // Every page also exists in Arabic under /ar; list each one next to its English entry.
  const sitemap = generateSitemap(posts).replace(/(\s*<url>\s*<loc>)https:\/\/1saif\.me(\/[^<]*)(<\/loc>[\s\S]*?<\/url>)/g, (entry, open, page, rest) =>
    page.endsWith('.xml') ? entry : `${entry}${open}${SITE_URL}/ar${page === '/' ? '' : page}${rest}`);

  fs.writeFileSync(OUTPUT_FILE, sitemap);
  
  console.log(`✅ Sitemap generated successfully at ${OUTPUT_FILE}`);
  console.log(`📄 Total URLs: ${posts.length + 5}`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
