import { z } from 'zod'

function intoTimestamp(date: Date | string | number): number {
  if (typeof date === 'number') {
    // Could be a timestamp or YYYYMMDD format
    if (date > 99999999) return date // Already a timestamp
    // Handle YYYYMMDD format like 20230122
    const dateStr = date.toString()
    if (dateStr.length === 8) {
      const year = dateStr.slice(0, 4)
      const month = dateStr.slice(4, 6)
      const day = dateStr.slice(6, 8)
      return new Date(`${year}-${month}-${day}`).valueOf()
    }
    return date * 1000 // Convert seconds to milliseconds if needed
  }
  if (date instanceof Date) return date.valueOf()
  if (typeof date === 'string') {
    const parsed = new Date(date)
    if (!isNaN(parsed.getTime())) return parsed.valueOf()
  }
  // Fallback to current time
  return Date.now()
}

function intoTagsArray(tags: string | string[] | undefined): string[] {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    // Handle comma-separated tags or YAML array format
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  }
  return []
}

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"), 
  createdAt: z.union([z.string(), z.date(), z.number()]).transform(intoTimestamp),
  updatedAt: z.union([z.string(), z.date(), z.number()]).transform(intoTimestamp).optional(),
  draft: z.boolean().default(false),
  tags: z.union([z.array(z.string()), z.string(), z.undefined()]).transform(intoTagsArray)
})

export type BlogPost = z.infer<typeof blogSchema>