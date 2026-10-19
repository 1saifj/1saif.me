import { describe, expect, it } from 'vitest'
import { convertMarkdownToHtml } from './markdownProcessor'

const render = convertMarkdownToHtml

describe('markdown basics', () => {
  it('renders headings, emphasis, inline code, links and quotes', async () => {
    const html = await render('# Title\n\n## Section\n\nSome **bold**, *italic* and `code` with a [link](https://example.com).\n\n> quoted')

    // the page shows the title, so the Markdown title line is dropped
    expect(html).not.toContain('<h1')
    expect(html).toMatch(/<h2 id="section">Section<a class="heading-anchor" href="#section"[^>]*>#<\/a><\/h2>/)
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

  it('wraps text right under a heading in a paragraph, and gives repeated headings unique ids', async () => {
    const html = await render('# Title\nLead text.\n\n## Setup\nFirst.\n\n## Setup\nSecond.')

    expect(html.startsWith('<p>Lead text.</p>')).toBe(true)
    expect(html).toContain('</h2><p>First.</p>')
    expect(html).toContain('id="setup"')
    expect(html).toContain('id="setup-2"')
  })

  it('never puts a block inside a paragraph or leaves an empty one', async () => {
    const html = await render('Intro\n\n\n\n```go\nx := 1\n```\n\n| a |\n|---|\n| 1 |\n\n![Diagram](/d.png)\n\nEnd')

    expect(html).not.toMatch(/<p>\s*<(div|figure|table)/)
    expect(html).not.toContain('<p></p>')
    expect(html).toContain('<p>End</p>')
  })

  it('moves headings down a level when the body uses # for its sections', async () => {
    const html = await render('# Title\n\nIntro.\n\n# Part\n\n## Detail\n\nText.')

    expect(html).not.toContain('<h1')
    expect(html).toContain('<h2 id="part">')
    expect(html).toContain('<h3 id="detail">')
  })

  it('escapes inline code and keeps Markdown inside it literal', async () => {
    const html = await render('`HTTPError` comes first. Keep `base<<i` small, and `**x**` is not bold.')

    expect(html).toBe('<p><code>HTTPError</code> comes first. Keep <code>base&lt;&lt;i</code> small, and <code>**x**</code> is not bold.</p>')
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
    expect(block).toContain('<span class="line"># install it</span>\n<span class="line">brew install ripgrep</span>')
    expect(block).not.toContain('<h1')
    expect(block).not.toContain('<br>')
  })

  it('keeps a # comment on a later line of code out of the headings', async () => {
    const html = await render('```ini\n[Peer]\n# my laptop\nAllowedIPs = 10.8.0.2/32\n```')

    expect(html).toContain('<span class="line">[Peer]</span>\n<span class="line"># my laptop</span>\n<span class="line">AllowedIPs')
    expect(html).not.toMatch(/<h[1-6]/)
  })

  it('renders code as escaped plain text without Shiki for the first paint', async () => {
    const html = await render('```go\nif a < b {}\n```')

    expect(html).toContain('if a &lt; b {}')
    expect(html).not.toContain('class="shiki')
    expect(html).not.toContain('<br>')
  })

  it('numbers blocks of 8 lines or more, and folds blocks longer than 30 lines', async () => {
    const block = (n: number) => render('```go\n' + Array.from({ length: n }, (_, i) => `line${i}`).join('\n') + '\n```')

    expect(block(7)).not.toContain('data-numbered')
    expect(block(8)).toContain('data-numbered')
    expect(block(30)).not.toContain('data-collapsed')
    expect(block(31)).toContain('data-collapsed')
    expect(block(31)).toContain('Show all 31 lines')
  })

  it('keeps $$ and $1 in code exactly as written', async () => {
    const html = await render('```sql\nCREATE FUNCTION f() RETURNS int AS $$ SELECT $1 $$;\n```')

    expect(html).toContain('AS $$ SELECT $1 $$;')
  })
})

describe('code fence meta', () => {
  it('leaves a fence with no meta exactly as it was', async () => {
    const html = await render('```go\nx := 1\ny := 2\n```')

    // The exact bytes of the block, so any change to a fence without meta shows up here.
    expect(html).toBe('<!--code-block--><div class="code-block-container"><div class="code-header"><span class="code-lang">Go</span><button type="button" class="copy-button" aria-live="polite">Copy</button></div><div class="code-content code-surface"><pre data-lang="go"><code><span class="line">x := 1</span>\n<span class="line">y := 2</span></code></pre></div></div><!--/code-block-->')
  })

  it('shows a title in the header, next to the language label', async () => {
    const html = await render('```go title="cmd/api/main.go"\nfunc main() {}\n```')

    expect(html).toContain('<span class="code-title">cmd/api/main.go</span><span class="code-lang">Go</span>')
    expect(html).toContain('data-lang="go"')
    expect(html).not.toContain('data-highlight')
  })

  it('marks the named lines, and keeps the line set on the pre for the browser', async () => {
    const html = await render('```go {1,3-5}\na\nb\nc\nd\ne\n```')
    const marks = (html.match(/<span class="line[^"]*">/g) ?? []).map(tag => tag.includes('highlighted'))

    expect(html).toContain('data-highlight="1,3-5"')
    expect(marks).toEqual([true, false, true, true, true])
  })

  it('carries a title and a line set on the same fence', async () => {
    const html = await render('```go title="cmd/api/main.go" {2}\na\nb\n```')

    expect(html).toContain('<span class="code-title">cmd/api/main.go</span>')
    expect(html).toContain('data-highlight="2"')
    expect(html).toContain('<span class="line highlighted">b</span>')
  })

  it('ignores a malformed meta: bad title, bad ranges and stray words', async () => {
    const html = await render('Before\n\n```go title=main.go {a,b-} {2-} {0} run it\nfunc main() {}\n```\n\nAfter')

    expect(html).toContain('<p>Before</p>')
    expect(html).toContain('<p>After</p>')
    expect(html).not.toContain('code-title')
    expect(html).not.toContain('data-highlight')
    expect(html).not.toContain('highlighted')
    expect(html).toContain('<span class="code-lang">Go</span>')
  })

  it('escapes HTML in the title, so a title cannot open a tag', async () => {
    const html = await render('```text title="a<b>&"\nplain\n```')

    expect(html).toContain('<span class="code-title">a&lt;b&gt;&amp;</span>')
  })

  it('reads braces inside a title as text, not as lines to mark', async () => {
    const html = await render('```text title="{1}"\na\nb\n```')

    expect(html).toContain('<span class="code-title">{1}</span>')
    expect(html).not.toContain('data-highlight')
  })
})
