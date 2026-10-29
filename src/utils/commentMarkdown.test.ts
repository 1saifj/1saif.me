import { describe, expect, it } from 'vitest'
import { commentToHtml } from './commentMarkdown'

describe('commentToHtml', () => {
  it('renders the supported Markdown', () => {
    expect(commentToHtml('**Nice** post, *thanks*.\nSecond line')).toBe('<p><strong>Nice</strong> post, <em>thanks</em>.<br>Second line</p>')
    expect(commentToHtml('- one\n- two')).toBe('<ul><li>one</li><li>two</li></ul>')
    expect(commentToHtml('1. one\n2. two')).toBe('<ol><li>one</li><li>two</li></ol>')
    expect(commentToHtml('> quoted\n> more')).toBe('<blockquote><p>quoted<br>more</p></blockquote>')
    expect(commentToHtml('Use `a<b && **c**`')).toBe('<p>Use <code>a&lt;b &amp;&amp; **c**</code></p>')
  })

  it('renders a fenced block with the blog code-block markup', () => {
    const html = commentToHtml('Try this:\n\n```go\nfmt.Println("<hi>")\n```\n\nDone')

    expect(html).toContain('<pre data-lang="go">')
    expect(html).toContain('fmt.Println("&lt;hi&gt;")')
    expect(html).toContain('<button type="button" class="copy-button"')
    expect(html.startsWith('<p>Try this:</p><div class="code-block-container">')).toBe(true)
    expect(html.endsWith('<p>Done</p>')).toBe(true)
  })

  it('renders headings one level under the page\'s comments heading', () => {
    expect(commentToHtml('# Setup\nRun **it**.')).toBe('<h3>Setup</h3><p>Run <strong>it</strong>.</p>')
    expect(commentToHtml('### `go` tips ##')).toBe('<h5><code>go</code> tips</h5>')
    expect(commentToHtml('#### deep')).toBe('<p>#### deep</p>')
    expect(commentToHtml('#tag')).toBe('<p>#tag</p>')
  })

  it('renders a table with the posts\' markup, and pipes in code stay in their cell', () => {
    expect(commentToHtml('| Tool | Use |\n| --- | :-: |\n| `a|b` | **fast** |')).toBe(
      '<div class="table-container"><table><thead><tr><th>Tool</th><th>Use</th></tr></thead><tbody><tr><td><code>a|b</code></td><td><strong>fast</strong></td></tr></tbody></table></div>',
    )
    expect(commentToHtml('a | b\n---')).toBe('<p>a | b<br>---</p>')
  })

  it('keeps a "# " line inside a code block as code', () => {
    const html = commentToHtml('```bash\n# install deps\nnpm i\n```')

    expect(html.match(/code-block-container/g)).toHaveLength(1)
    expect(html).toContain('install deps')
    expect(html).not.toMatch(/<h\d/)
  })

  it('labels an unknown fence language as plain text, even one named like an object property', () => {
    expect(commentToHtml('```constructor\nx\n```')).toContain('<span class="code-lang">Plain text</span>')
  })

  it('links only http(s) addresses, marked nofollow ugc', () => {
    expect(commentToHtml('[docs](https://example.com/a?b=1)')).toBe('<p><a href="https://example.com/a?b=1" target="_blank" rel="nofollow ugc noopener noreferrer">docs</a></p>')
    expect(commentToHtml('See https://example.com.')).toBe('<p>See <a href="https://example.com" target="_blank" rel="nofollow ugc noopener noreferrer">https://example.com</a>.</p>')
    expect(commentToHtml('[x](javascript:alert(1))')).toBe('<p>[x](javascript:alert(1))</p>')
  })

  it('keeps a quote, a closing bracket or a trailing & outside a bare link, and an & inside one', () => {
    const a = (url: string) => `<a href="${url}" target="_blank" rel="nofollow ugc noopener noreferrer">${url}</a>`

    expect(commentToHtml("'https://a.dev/x'")).toBe("<p>&#39;https://a.dev/x&#39;</p>")
    expect(commentToHtml("see https://a.dev/x'")).toBe(`<p>see ${a('https://a.dev/x')}&#39;</p>`)
    expect(commentToHtml('see https://a.dev/x).')).toBe(`<p>see ${a('https://a.dev/x')}).</p>`)
    expect(commentToHtml('see https://a.dev/?a=1&b=2&')).toBe(`<p>see ${a('https://a.dev/?a=1&amp;b=2')}&amp;</p>`)
    expect(commentToHtml('see https://.')).toBe('<p>see https://.</p>')
  })

  it.each([
    ['<script>alert(1)</script>'],
    ['<img src=x onerror=alert(1)>'],
    ['[x](https://a.com" onmouseover="alert(1))'],
    ['```js" onclick="alert(1)\ncode\n```'],
    ['![x](https://a.com/x.png" onerror="alert(1))'],
    ['\uE0000\uE000<b>forged</b>'],
    ['https://a.com/[x](https://b.com)'],
    ['[y](https://a.com/`code`)'],
    ['# <img src=x onerror=alert(1)>'],
    ['| <script>x</script> |\n|---|\n| <b onclick="y"> |'],
  ])('never lets markup through: %s', input => {
    const html = commentToHtml(input)

    expect(html).not.toMatch(/<(script|img|b)[\s>]/)
    expect(html).not.toMatch(/\son\w+="/)
    expect(html).not.toMatch(/href="[^"]*</)
  })
})
