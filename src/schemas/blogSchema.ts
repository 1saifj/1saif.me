import { z } from 'zod'

function intoTimestamp(date: Date | string): number {
  return (date instanceof Date ? date : new Date(date)).valueOf()
}

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  createdAt: z.string().or(z.date()).transform(intoTimestamp),
  updatedAt: z.string().or(z.date()).transform(intoTimestamp).optional(),
  draft: z.boolean().optional(),
  tags: z.array(z.string())
})

export type BlogPost = z.infer<typeof blogSchema>