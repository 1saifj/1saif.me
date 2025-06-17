import { z } from 'zod'

// Define languages directly without external import
const languages = z.union([
  z.literal('typescript'),
  z.literal('rust'),
  z.literal('haskell'),
  z.literal('go'),
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
  url: z.string().url(),
  language: languages,
  wip: z.boolean().optional().default(false),
  isPrivate: z.boolean().optional().default(false),
  sourceType: sourceTypes.optional().default('open-source')
})

export type Project = z.infer<typeof projectSchema>
export type Language = z.infer<typeof languages>
export type SourceType = z.infer<typeof sourceTypes>