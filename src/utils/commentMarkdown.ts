import { codeBlockHtml } from './markdownProcessor'

// Visitor text is untrusted, unlike the posts: everything is escaped first, then only these rules add
// markup. No raw HTML, images, headings or tables; links go only to http(s) and are marked nofollow ugc.

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const link = (url: string, label: string) => `<a href="${url}" target="_blank" rel="nofollow ugc noopener noreferrer">${label}</a>`

const inline = (text: string) => text
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.+?)\*/g, '<em>$1</em>')

export function commentToHtml(markdown: string): string {
  const held: string[] = []
  // A private-use character marks set-aside parts; it is stripped from the input first, so a comment cannot forge one.
  const hold = (html: string) => `\uE000${held.push(html) - 1}\uE000`

  // Code blocks first: codeBlockHtml escapes the code itself. The fence's title and line set are ignored.
  const text = escapeHtml(markdown.replace(/\uE000/g, '').replace(/\r\n?/g, '\n')
    .replace(/```(\w{0,20})[^\n]*\n([\s\S]*?)```/g, (_match, lang: string, code: string) => `\n\n${hold(codeBlockHtml(lang, '', code))}\n\n`))
    .replace(/`([^`\n]+)`/g, (_match, code: string) => hold(`<code>${code}</code>`))
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label: string, url: string) => hold(link(url, label)))
    // A bare address becomes a link too; trailing punctuation stays outside it.
    .replace(/(^|\s)(https?:\/\/[^\s<]*[^\s<.,;:!?)'"])/g, (_match, space: string, url: string) => space + hold(link(url, url)))

  const html = text.trim().split(/\n{2,}/).map(block => {
    const lines = block.split('\n')

    if (/^\uE000\d+\uE000$/.test(block.trim()) && held[Number(block.trim().slice(1, -1))].startsWith('<div')) return block.trim()

    if (lines.every(line => /^[-*] /.test(line))) return `<ul>${lines.map(line => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`

    if (lines.every(line => /^\d+\. /.test(line))) return `<ol>${lines.map(line => `<li>${inline(line.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`

    if (lines.every(line => line.startsWith('&gt;'))) return `<blockquote><p>${lines.map(line => inline(line.replace(/^&gt; ?/, ''))).join('<br>')}</p></blockquote>`

    return `<p>${lines.map(inline).join('<br>')}</p>`
  }).join('')

  // A link label may hold inline code, so a second pass restores what the first one uncovered.
  const restore = (value: string) => value.replace(/\uE000(\d+)\uE000/g, (_match, index: string) => held[Number(index)])

  return restore(restore(html))
}
