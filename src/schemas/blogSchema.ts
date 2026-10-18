export interface BlogPost {
  title: string
  description: string
  // Arabic title and summary for the Arabic pages; the article itself stays in English.
  titleAr?: string
  descriptionAr?: string
  createdAt: number
  updatedAt?: number
  draft: boolean
  tags: string[]
  featuredImage?: string
  // Markdown file name in content/articles (without .md) and its word count, so a post page loads only its own file.
  file?: string
  words?: number
}
