// Code fence meta: what a post may write after the language, as in ```go title="cmd/api/main.go" {3,7-9}.
export interface LineRange {
  start: number
  end: number
}

export interface FenceMeta {
  titleHtml: string
  ranges: LineRange[]
}

const tokenPattern = /^(\d+)(?:-(\d+))?$/

// The title is text in a header, never markup, so it is escaped where it becomes HTML.
const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Reads "{3,7-9}" from a fence and "3,7-9" from the pre's data attribute, so one helper serves both.
export const parseLineRanges = (spec: string): LineRange[] => {
  const body = /\{([^}]*)\}/.exec(spec)?.[1] ?? spec
  const ranges: LineRange[] = []

  for (const token of body.split(',')) {
    const match = tokenPattern.exec(token.trim())

    if (!match) continue
    const start = Number(match[1])
    const end = Number(match[2] ?? match[1])

    // A zero or backwards range names no line, so it is a typo and not a request.
    if (start < 1 || end < start) continue
    ranges.push({ start, end })
  }

  return ranges
}

export const parseFenceMeta = (meta: string): FenceMeta => {
  const title = /title="([^"]*)"/.exec(meta)
  // The title is cut out before the braces are read, so a brace inside a title cannot name lines.
  const rest = title ? meta.replace(title[0], ' ') : meta

  return { titleHtml: escapeHtml(title?.[1] ?? ''), ranges: parseLineRanges(rest) }
}

export const isHighlightedLine = (ranges: LineRange[], line: number): boolean => ranges.some(range => line >= range.start && line <= range.end)

export const formatLineRanges = (ranges: LineRange[]): string => ranges.map(range => range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`).join(',')
