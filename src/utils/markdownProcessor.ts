import { formatLineRanges, isHighlightedLine, parseFenceMeta } from './codeFenceMeta'
import { getLanguageLabel } from './syntaxHighlighter'

// Plain semantic HTML: every style lives in index.css under .article-content.
const blockTags = 'h[1-6]|div|blockquote|ul|ol|table|figure'

// Code blocks of this many lines get line numbers; longer than foldAbove, they start folded.
const numberFrom = 8

const foldAbove = 30

// Heading ids for #links. Keeps Latin and Arabic letters and digits, so Arabic headings get readable ids too.
const slugify = (text: string) => text.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section'

// One code block as escaped plain text, tagged with its language. Comments reuse it, so they get the same colours and Copy button.
export const codeBlockHtml = (lang: string, meta: string, code: string): string => {
  const language = lang || 'text'
  const { titleHtml, ranges } = parseFenceMeta(meta)
  const lines = code.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').split('\n')
  // Same line structure Shiki produces, so line numbers show from the first paint and nothing moves when colours arrive.
  const escapedCode = lines.map((line, index) => `<span class="line${isHighlightedLine(ranges, index + 1) ? ' highlighted' : ''}">${line}</span>`).join('\n')
  const numbered = lines.length >= numberFrom ? ' data-numbered' : ''
  // The browser re-marks the lines after Shiki rewrites the code, so the set travels on the pre.
  const highlight = ranges.length ? ` data-highlight="${formatLineRanges(ranges)}"` : ''
  const title = titleHtml ? `<span class="code-title">${titleHtml}</span>` : ''
  // Long blocks start folded; the reader opens them. Folding in the HTML (not in script) keeps the layout still.
  const folded = lines.length > foldAbove

  return `<div class="code-block-container"${folded ? ' data-collapsed' : ''}><div class="code-header">${title}<span class="code-lang">${getLanguageLabel(language)}</span><button type="button" class="copy-button" aria-live="polite">Copy</button></div><div class="code-content code-surface"><pre data-lang="${language}"${highlight}${numbered}><code>__ESCAPED_CODE__</code></pre></div>${folded ? `<button type="button" class="code-expand" aria-expanded="false" data-lines="${lines.length}">Show all ${lines.length} lines</button>` : ''}</div>`
    .replace('__ESCAPED_CODE__', () => escapedCode)
}

export const convertMarkdownToHtml = (markdown: string): string => {
  // The page shows the title, so the Markdown's own "# Title" line is dropped.
  const source = markdown.replace(/^\s*# [^\n]*\n+/, '')

  // Step 1a: Code blocks first. They render as escaped plain text, tagged with their language.
  // In the browser, utils/codeBlocks.ts adds syntax colors in place and wires the Copy button.
  // A fence may carry a title and a line set after the language, as in ```go title="cmd/api/main.go" {3,7-9}.
  let html = source.replace(/```(\w*)([^\n]*)\n([\s\S]*?)```/g, (_match, lang: string, meta: string, code: string) =>
    `\n\n<!--code-block-->${codeBlockHtml(lang, meta, code)}<!--/code-block-->\n\n`)

  // Step 1b: Hide code blocks from every later step, headings included
  const protectedBlocks: { placeholder: string; content: string }[] = []
  // Explicit markers: a regex on </div> stopped at the header and left the code exposed to the newline-to-<br> step.
  html = html.replace(/<!--code-block-->[\s\S]*?<!--\/code-block-->/g, (match) => {
    const placeholder = `___PROTECTED_BLOCK_${protectedBlocks.length}___`
    protectedBlocks.push({ placeholder, content: match })

    return placeholder
  })

  // Step 2: Headings, now that code blocks are hidden (a `# comment` in code is not a heading).
  // Each heading is its own block, so the text right under it becomes a paragraph.
  const used = new Map<string, number>()

  const heading = (level: number) => (_match: string, text: string) => {
    const base = slugify(text)
    const count = used.get(base) ?? 0

    used.set(base, count + 1)
    const id = count ? `${base}-${count + 1}` : base

    return `\n\n<h${level} id="${id}">${text}<a class="heading-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a></h${level}>\n\n`
  }

  // The page title is the only h1. A body that uses "#" for its sections moves every level down one,
  // so "# Part" / "## Detail" become h2 / h3 instead of a lost h1.
  const shift = /^# /m.test(html) ? 1 : 0

  html = html
    .replace(/^### (.*$)/gm, heading(3 + shift))
    .replace(/^## (.*$)/gm, heading(2 + shift))
    .replace(/^# (.*$)/gm, heading(2))

  // Inline code is escaped and set aside before the other inline rules, so `a<<b` or `**x**` stay literal.
  // An unescaped "<" here once opened a tag that the browser carried past the article and broke hydration.
  const inlineCode: string[] = []
  html = html.replace(/`([^`\n]+)`/g, (_match, code: string) => {
    const placeholder = `___INLINE_CODE_${inlineCode.length}___`
    inlineCode.push(`<code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`)

    return placeholder
  })

  // Step 3: Inline and block Markdown
  html = html
    .replace(/\|(.+)\|\n\|[-\s|:]+\|\n((?:\|.+\|\n?)*)/g, (_match, header: string, rows: string) => {
      const cells = (row: string) => row.split('|').map(cell => cell.trim()).filter(Boolean)
      const head = cells(header).map(cell => `<th>${cell}</th>`).join('')
      const body = rows.trim().split('\n').map(row => `<tr>${cells(row).map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')

      return `\n\n<div class="table-container"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>\n\n`
    })

    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, src: string) =>
      `<figure><img src="${src}" alt="${alt}" loading="lazy" decoding="async">${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`)

    // External links open in a new tab without leaking the opener.
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text: string, url: string) =>
      `<a href="${url}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`)

    .replace(/^[*-] (.+$)/gm, '<li><span class="md-marker" aria-hidden="true">•</span>$1</li>')
    .replace(/^(\d+)\. (.+$)/gm, '<li><span class="md-marker">$1.</span>$2</li>')
    // Each run of consecutive items becomes one list; the items draw their own bullet or number.
    .replace(/<li>.*?<\/li>(?:\n<li>.*?<\/li>)*/g, items => `<ul class="md-list">${items.replace(/\n/g, '')}</ul>`)

    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

    .replace(/^> (.+$)/gm, '<blockquote>$1</blockquote>')

    // Paragraphs: a blank line ends one. Extra blank lines never make empty paragraphs.
    .trim()
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  html = `<p>${html}</p>`
    .replace(/<p>\s*<\/p>/g, '')
    // Blocks never sit inside a paragraph.
    .replace(new RegExp(`<p>(\\s*(?:<(?:${blockTags})|___PROTECTED_BLOCK_))`, 'g'), '$1')
    .replace(new RegExp(`((?:</(?:${blockTags})>|___PROTECTED_BLOCK_\\d+___)\\s*)</p>`, 'g'), '$1')

  // Step 4: Restore inline code and code blocks
  html = html.replace(/___INLINE_CODE_(\d+)___/g, (_match, index: string) => inlineCode[Number(index)])
  protectedBlocks.forEach(({ placeholder, content }) => {
    html = html.replace(placeholder, () => content)
  })

  return html
}
