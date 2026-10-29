// The comment toolbar: each format turns the selected text into the Markdown that commentToHtml renders.

export type Format = 'heading' | 'bold' | 'italic' | 'code' | 'codeBlock' | 'link' | 'list' | 'orderedList' | 'quote'

export interface Edit {
  from: number
  to: number
  text: string
  selectionStart: number
  selectionEnd: number
}

const WRAP: Partial<Record<Format, string>> = { bold: '**', italic: '*', code: '`' }

const LINE_PREFIX: Partial<Record<Format, (index: number) => string>> = { heading: () => '### ', list: () => '- ', orderedList: index => `${index + 1}. `, quote: () => '> ' }

// commentToHtml splits blocks on blank lines, so a list, quote or code block needs one on each side.
const blankBefore = (before: string) => before === '' || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n'

const blankAfter = (after: string) => after === '' || after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n'

export function formatSelection(value: string, start: number, end: number, format: Format): Edit {
  const selected = value.slice(start, end)
  const marker = WRAP[format]

  if (marker) return { from: start, to: end, text: marker + selected + marker, selectionStart: start + marker.length, selectionEnd: end + marker.length }

  if (format === 'link') {
    const text = `[${selected}](https://)`
    const urlEnd = start + text.length - 1

    // With text selected, the address is selected so a paste replaces it; without, the cursor waits for the label.
    return { from: start, to: end, text, selectionStart: selected ? urlEnd - 'https://'.length : start + 1, selectionEnd: selected ? urlEnd : start + 1 }
  }

  const prefix = LINE_PREFIX[format]

  if (!prefix) {
    const lead = blankBefore(value.slice(0, start))
    const text = `${lead}\`\`\`\n${selected}\n\`\`\`${blankAfter(value.slice(end))}`
    const codeStart = start + lead.length + 4

    return { from: start, to: end, text, selectionStart: codeStart, selectionEnd: codeStart + selected.length }
  }

  // Line formats apply to every line the selection touches.
  // lastIndexOf reads a negative start as 0, so a cursor at 0 before a blank first line would land on line 2.
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1
  const lineEnd = value.indexOf('\n', end)
  const to = lineEnd === -1 ? value.length : lineEnd
  const lines = value.slice(from, to).split('\n').map((line, index) => prefix(index) + line).join('\n')
  const lead = blankBefore(value.slice(0, from))
  const bodyStart = from + lead.length

  return { from, to, text: lead + lines + blankAfter(value.slice(to)), selectionStart: start === end ? bodyStart + lines.length : bodyStart, selectionEnd: bodyStart + lines.length }
}

// As on GitHub: one address pasted over text on one line makes that text a link. Anything else pastes as usual.
export function pasteLink(value: string, start: number, end: number, pasted: string): Edit | undefined {
  const selected = value.slice(start, end)
  const url = pasted.trim()

  if (!selected.trim() || selected.includes('\n') || !/^https?:\/\/[^\s()]+$/.test(url)) return undefined

  const text = `[${selected}](${url})`

  return { from: start, to: end, text, selectionStart: start + text.length, selectionEnd: start + text.length }
}

// The markers commentToHtml renders as a list or a quote. A list item cannot nest, so a marker starts the line.
const LIST_ITEM = /^([-*] |\d+\. |> ?)(.*)$/

// As on GitHub: Enter at the end of a list or quote line starts the next item, and Enter on an empty item ends the list.
export function continueList(value: string, caret: number): Edit | undefined {
  const lineStart = value.lastIndexOf('\n', caret - 1) + 1
  const atLineEnd = caret === value.length || value[caret] === '\n'
  const match = LIST_ITEM.exec(value.slice(lineStart, caret))

  // Inside a code block (an odd number of fences before the caret), Enter is a plain line break.
  if (!atLineEnd || !match || (value.slice(0, lineStart).match(/^```/gm) ?? []).length % 2 === 1) return undefined

  const [, marker, rest] = match

  if (!rest.trim()) return { from: lineStart, to: caret, text: '', selectionStart: lineStart, selectionEnd: lineStart }

  const number = /^\d+/.exec(marker)
  const next = number ? `${Number(number[0]) + 1}. ` : marker.startsWith('>') ? '> ' : marker
  const text = `\n${next}`

  return { from: caret, to: caret, text, selectionStart: caret + text.length, selectionEnd: caret + text.length }
}

// A quote reply: each line gets "> ", and an empty line ">", so the quote stays one block. A code block is left
// out, because a fence inside a quote does not render.
export function quoteReply(text: string): string {
  const prose = text.replace(/```[^\n]*\n[\s\S]*?(?:```|$)/g, '').replace(/\n{3,}/g, '\n\n').trim()

  return prose && prose.split('\n').map(line => line.trim() ? `> ${line}` : '>').join('\n')
}
