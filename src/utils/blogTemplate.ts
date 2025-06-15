// Blog post template generator
export interface BlogPostMetadata {
  title: string
  slug: string
  description: string
  date: string
  author: string
  tags: string[]
  readTime: number
  image?: string
  category: string
}

export const generateBlogTemplate = (metadata: BlogPostMetadata): string => {
  const frontMatter = `---
title: "${metadata.title}"
description: "${metadata.description}"
date: "${metadata.date}"
author: "${metadata.author}"
tags: [${metadata.tags.map(tag => `"${tag}"`).join(', ')}]
readTime: ${metadata.readTime}
image: "${metadata.image || '/blog/default-cover.jpg'}"
category: "${metadata.category}"
published: true
featured: false
---

# ${metadata.title}

${metadata.description}

## Introduction

Write your introduction here...

## Main Content

### Section 1

Your content here...

### Section 2

More content...

## Code Examples

\`\`\`typescript
// Example code block
function example() {
  console.log('Hello World');
}
\`\`\`

## Conclusion

Wrap up your article here...

---

**About the Author**: ${metadata.author} is a Full-Stack Engineer specializing in Golang, Python, and Flutter development.

**Tags**: ${metadata.tags.join(', ')}
**Read Time**: ${metadata.readTime} minutes
**Published**: ${new Date(metadata.date).toLocaleDateString()}
`

  return frontMatter
}

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

export const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export const extractHeadings = (content: string) => {
  const headingRegex = /^(#{1,6})\s+(.*)$/gm
  const headings = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    const slug = generateSlug(text)
    
    headings.push({
      level,
      text,
      slug,
      id: slug
    })
  }

  return headings
}

export const generateTableOfContents = (content: string): string => {
  const headings = extractHeadings(content)
  
  if (headings.length === 0) return ''

  let toc = '## Table of Contents\n\n'
  
  headings.forEach(heading => {
    const indent = '  '.repeat(Math.max(0, heading.level - 2))
    toc += `${indent}- [${heading.text}](#${heading.slug})\n`
  })

  return toc + '\n'
}

// Blog post categories
export const BLOG_CATEGORIES = [
  'Development',
  'Tutorial',
  'Opinion',
  'Technology',
  'Career',
  'Open Source',
  'Mobile Development',
  'Web Development',
  'Backend',
  'Frontend',
  'DevOps',
  'Research'
] as const

export type BlogCategory = typeof BLOG_CATEGORIES[number]

// Common tags
export const COMMON_TAGS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Golang',
  'Flutter',
  'Dart',
  'Web Development',
  'Mobile Development',
  'Backend',
  'Frontend',
  'API',
  'Database',
  'DevOps',
  'Docker',
  'AWS',
  'Tutorial',
  'Best Practices',
  'Clean Code',
  'Architecture',
  'Performance',
  'Security',
  'Testing',
  'Open Source'
] as const

export type CommonTag = typeof COMMON_TAGS[number]

// SEO helpers for blog posts
export const generateMetaTags = (metadata: BlogPostMetadata) => {
  return {
    title: `${metadata.title} | Saif Aljanahi`,
    description: metadata.description,
    keywords: metadata.tags.join(', '),
    author: metadata.author,
    'article:published_time': metadata.date,
    'article:author': metadata.author,
    'article:section': metadata.category,
    'article:tag': metadata.tags.join(', '),
    'twitter:card': 'summary_large_image',
    'twitter:site': '@saifaljanahi',
    'twitter:creator': '@saifaljanahi',
    'twitter:title': metadata.title,
    'twitter:description': metadata.description,
    'twitter:image': metadata.image || '/blog/default-cover.jpg',
    'og:title': metadata.title,
    'og:description': metadata.description,
    'og:image': metadata.image || '/blog/default-cover.jpg',
    'og:url': `https://1saif.me/blog/${metadata.slug}`,
    'og:type': 'article',
    'og:site_name': 'Saif Aljanahi Portfolio'
  }
} 