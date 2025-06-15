import { z } from 'zod'

// Define languages directly without external import
const languages = z.union([
  z.literal('typescript'),
  z.literal('rust'),
  z.literal('haskell'),
  z.literal('go'),
  z.literal('ocaml')
])

export const projectSchema = z.object({
  order: z.number().optional().default(-1),
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  language: languages,
  wip: z.boolean().optional().default(false)
})

export type Project = z.infer<typeof projectSchema>
export type Language = z.infer<typeof languages>