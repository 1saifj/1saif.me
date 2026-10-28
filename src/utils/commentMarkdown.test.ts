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

  it('links only http(s) addresses, marked nofollow ugc', () => {
    expect(commentToHtml('[docs](https://example.com/a?b=1)')).toBe('<p><a href="https://example.com/a?b=1" target="_blank" rel="nofollow ugc noopener noreferrer">docs</a></p>')
    expect(commentToHtml('See https://example.com.')).toBe('<p>See <a href="https://example.com" target="_blank" rel="nofollow ugc noopener noreferrer">https://example.com</a>.</p>')
    expect(commentToHtml('[x](javascript:alert(1))')).toBe('<p>[x](javascript:alert(1))</p>')
  })

  it.each([
    ['<script>alert(1)</script>'],
    ['<img src=x onerror=alert(1)>'],
    ['[x](https://a.com" onmouseover="alert(1))'],
    ['```js" onclick="alert(1)\ncode\n```'],
    ['![x](https://a.com/x.png" onerror="alert(1))'],
    ['\uE0000\uE000<b>forged</b>'],
  ])('never lets markup through: %s', input => {
    const html = commentToHtml(input)

    expect(html).not.toMatch(/<(script|img|b)[\s>]/)
    expect(html).not.toMatch(/\son\w+="/)
  })
})
