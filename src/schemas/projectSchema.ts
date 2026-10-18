import { z } from 'zod'

// Define languages directly without external import
const languages = z.union([
  z.literal('typescript'),
  z.literal('javascript'),
  z.literal('rust'),
  z.literal('haskell'),
  z.literal('go'),
  z.literal('dart'),
  z.literal('ocaml')
])

// Define source types for projects
const sourceTypes = z.union([
  z.literal('open-source'),
  z.literal('private'),
  z.literal('company')
])

export const projectSchema = z.object({
  order: z.number().optional().default(-1),
  name: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  language: languages,
  wip: z.boolean().optional().default(false),
  isPrivate: z.boolean().optional().default(false),
  sourceType: sourceTypes.optional().default('open-source'),
  role: z.string().optional(),
  impact: z.string().optional(),
  // Arabic display text; slugs and links always use the English name.
  ar: z.object({ name: z.string(), description: z.string(), role: z.string(), impact: z.string() }).partial().optional(),
})

export type Project = z.infer<typeof projectSchema>

export type Language = z.infer<typeof languages>
