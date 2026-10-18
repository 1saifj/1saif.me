// What the parser below can produce; pages validate the shape with zod.
type FrontmatterValue = string | number | boolean | string[]

interface ContentFile {
  slug: string
  frontmatter: Record<string, FrontmatterValue>
  content: string
}

// Simple frontmatter parser that doesn't require Node.js Buffer
interface ParsedFile {
  data: Record<string, FrontmatterValue>
  content: string
}

function parseFrontmatter(content: string): ParsedFile {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content };
  }
  
  const [, frontmatterStr, markdownContent] = match;
  const data: Record<string, FrontmatterValue> = {};
  
  // Parse YAML-like frontmatter
  const lines = frontmatterStr.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line || line.startsWith('#')) {
      i++;
      continue;
    }
    
    const colonIndex = line.indexOf(':');

    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Check if this is an array (value is empty and next lines are indented with -)
      if (!value && i + 1 < lines.length && lines[i + 1].trim().startsWith('-')) {
        const arrayItems: string[] = [];
        i++;
        
        // Parse array items
        while (i < lines.length && lines[i].trim().startsWith('-')) {
          let arrayValue = lines[i].trim().substring(1).trim();
          
          // Remove quotes if present
          if ((arrayValue.startsWith('"') && arrayValue.endsWith('"')) || 
              (arrayValue.startsWith("'") && arrayValue.endsWith("'"))) {
            arrayValue = arrayValue.slice(1, -1);
          }
          
          arrayItems.push(arrayValue);
          i++;
        }
        
        data[key] = arrayItems;
        continue;
      }
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Try to parse as number, boolean, or date
      if (value === 'true') {
        data[key] = true;
      } else if (value === 'false') {
        data[key] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        data[key] = Number(value);
      } else if (key === 'createdAt' || key === 'updatedAt') {
        // Convert date strings to timestamps
        const date = new Date(value);

        if (!isNaN(date.getTime())) {
          data[key] = date.getTime();
        } else {
          data[key] = Date.now(); // fallback to current timestamp
        }
      } else {
        data[key] = value;
      }
    }
    
    i++;
  }
  
  return { data, content: markdownContent };
}

export function processMarkdownFiles(modules: Record<string, string>): ContentFile[] {
  return Object.entries(modules).map(([path, content]) => {
    const { data: frontmatter, content: markdownContent } = parseFrontmatter(content)
    const slug = path.split('/').pop()?.replace('.md', '') || ''
    
    // Add defaults for missing required fields
    const processedFrontmatter = {
      title: slug.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'No description available',
      createdAt: Date.now(),
      draft: false,
      tags: [],
      ...frontmatter
    }
    
    return {
      slug,
      frontmatter: processedFrontmatter,
      content: markdownContent
    }
  })
}
