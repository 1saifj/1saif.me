import type { Project } from '../schemas/projectSchema'

// Labels and values differ per language; the technology names in stack do not.
export interface GlanceLabels {
  role: string
  status: string
  type: string
  language: string
  links: string
  stack: string
  inProgress: string
  shipped: string
  openSource: string
  company: string
  private: string
  visit: string
  source: string
}

export interface GlanceItem {
  key: 'role' | 'status' | 'type' | 'language' | 'links'
  label: string
  value: string
  href?: string
}

const languageNames = new Map([['typescript', 'TypeScript'], ['javascript', 'JavaScript'], ['go', 'Go'], ['dart', 'Dart'], ['rust', 'Rust'], ['haskell', 'Haskell'], ['ocaml', 'OCaml']])

const sourceLabel = (labels: GlanceLabels, sourceType: Project['sourceType']): string => {
  if (sourceType === 'company') return labels.company

  if (sourceType === 'private') return labels.private

  return labels.openSource
}

// Items with no value are left out, so the list stays short.
export const buildGlanceItems = (project: Project, role: string | undefined, labels: GlanceLabels): GlanceItem[] => {
  const items: GlanceItem[] = []

  if (role) items.push({ key: 'role', label: labels.role, value: role })

  items.push({ key: 'status', label: labels.status, value: project.wip ? labels.inProgress : labels.shipped })
  items.push({ key: 'type', label: labels.type, value: sourceLabel(labels, project.sourceType) })

  const language = languageNames.get(project.language)

  if (language) items.push({ key: 'language', label: labels.language, value: language })

  if (project.url) items.push({ key: 'links', label: labels.links, value: project.isPrivate ? labels.visit : labels.source, href: project.url })

  return items
}
