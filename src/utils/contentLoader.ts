export interface ContentFile {
  slug: string
  frontmatter: Record<string, any>
  content: string
}

// Simple frontmatter parser that doesn't require Node.js Buffer
function parseFrontmatter(content: string): { data: Record<string, any>, content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content };
  }
  
  const [, frontmatterStr, markdownContent] = match;
  const data: Record<string, any> = {};
  
  // Parse YAML-like frontmatter
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Try to parse as number or boolean
      if (value === 'true') {
        data[key] = true;
      } else if (value === 'false') {
        data[key] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        data[key] = Number(value);
      } else {
        data[key] = value;
      }
    }
  });
  
  return { data, content: markdownContent };
}

// Import all markdown files from content directories using updated Vite glob syntax
const articleModules = import.meta.glob('/content/articles/*.md', { 
  query: '?raw',
  import: 'default',
  eager: true 
}) as Record<string, string>

const projectModules = import.meta.glob('/content/projects/*.md', { 
  query: '?raw',
  import: 'default',
  eager: true 
}) as Record<string, string>

function processMarkdownFiles(modules: Record<string, string>): ContentFile[] {
  return Object.entries(modules).map(([path, content]) => {
    const { data: frontmatter, content: markdownContent } = parseFrontmatter(content)
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