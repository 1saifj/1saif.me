import { describe, expect, it } from 'vitest'
import { convertMarkdownToHtml } from './markdownProcessor'

const render = convertMarkdownToHtml

describe('markdown basics', () => {
  it('renders headings, emphasis, inline code, links and quotes', async () => {
    const html = await render('# Title\n\n## Section\n\nSome **bold**, *italic* and `code` with a [link](https://example.com).\n\n> quoted')

    expect(html).toMatch(/<h1[^>]*>Title<\/h1>/)
    expect(html).toMatch(/<h2[^>]*>Section<\/h2>/)
    expect(html).toMatch(/<strong[^>]*>bold<\/strong>/)
    expect(html).toMatch(/<em[^>]*>italic<\/em>/)
    expect(html).toMatch(/<code[^>]*>code<\/code>/)
    // external links open in a new tab without leaking the opener
    const link = html.match(/<a [^>]*>link<\/a>/)?.[0] ?? ''
    expect(link).toContain('href="https://example.com"')
    expect(link).toContain('target="_blank"')
    expect(link).toContain('rel="noopener noreferrer"')
    expect(html).toMatch(/<blockquote[^>]*>quoted<\/blockquote>/)
  })

  it('renders a table without stray line breaks inside it', async () => {
    const html = await render('| a | b |\n|---|---|\n| 1 | 2 |\n')
    const table = html.slice(html.indexOf('<table'), html.indexOf('</table>'))

    expect(table).toMatch(/<th[^>]*>a<\/th><th[^>]*>b<\/th>/)
    expect(table).toMatch(/<td[^>]*>1<\/td><td[^>]*>2<\/td>/)
    expect(table).not.toContain('<br>')
  })
})

describe('markdown lists', () => {
  it('wraps each run of items in one list, for dash, star and numbered items', async () => {
    const html = await render('Intro\n\n- one\n* two\n\nMiddle\n\n1. first\n2. second\n\nEnd')
    const lists = html.match(/<ul[^>]*>.*?<\/ul>/g) ?? []

    expect(lists).toHaveLength(2)
    expect(lists[0]?.match(/<li/g)).toHaveLength(2)
    expect(lists[1]?.match(/<li/g)).toHaveLength(2)
    // no item outside a list, and no line break inside one
    expect(html.replace(/<ul[^>]*>.*?<\/ul>/g, '')).not.toContain('<li')
    expect(lists.join('')).not.toContain('<br>')
  })
})

describe('markdown images', () => {
  it('renders a closed img tag with its source and a caption', async () => {
    const html = await render('![Flow diagram](/articles/flow.png)')

    expect(html).toMatch(/<img src="\/articles\/flow\.png" alt="Flow diagram"[^>]*>/)
    expect(html).toContain('<figcaption')
  })
})

describe('markdown code blocks', () => {
  it('keeps code lines, tags the language, and never turns a # comment into a heading', async () => {
    const html = await render('Before\n\n```bash\n# install it\nbrew install ripgrep\n```\n\nAfter')
    const block = html.slice(html.indexOf('code-block-container'), html.lastIndexOf('</pre>'))

    expect(block).toContain('data-lang="bash"')
    expect(block).toContain('# install it\nbrew install ripgrep')
    expect(block).not.toContain('<h1')
    expect(block).not.toContain('<br>')
  })

  it('renders code as escaped plain text without Shiki for the first paint', async () => {
    const html = await render('```go\nif a < b {}\n```')

    expect(html).toContain('if a &lt; b {}')
    expect(html).not.toContain('class="shiki')
    expect(html).not.toContain('<br>')
  })

  it('keeps $$ and $1 in code exactly as written', async () => {
    const html = await render('```sql\nCREATE FUNCTION f() RETURNS int AS $$ SELECT $1 $$;\n```')

    expect(html).toContain('AS $$ SELECT $1 $$;')
  })
})
