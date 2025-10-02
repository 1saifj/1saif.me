import { describe, it, expect, beforeAll } from 'vitest'
import { convertMarkdownToHtml } from './markdownProcessor'

describe('markdownProcessor', () => {
  describe('Code Blocks', () => {
    it('should handle simple code blocks', async () => {
      const markdown = `
\`\`\`javascript
const x = 5;
console.log(x);
\`\`\`
`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<div class="code-block-wrapper')
      expect(html).toContain('JavaScript')
      // Check that the code is present (will be wrapped in syntax highlighting)
      expect(html).toMatch(/const.*x.*=.*5/)
      expect(html).not.toContain('__CODEBLOCK_')
    })

    it('should handle multiple code blocks', async () => {
      const markdown = `
First paragraph

\`\`\`python
def hello():
    print("Hello")
\`\`\`

Middle paragraph

\`\`\`sql
SELECT * FROM users;
\`\`\`

Last paragraph
`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('Python')
      expect(html).toContain('SQL')
      // Check that the code is present (will be wrapped in syntax highlighting)
      expect(html).toMatch(/def.*hello/)
      expect(html).toMatch(/SELECT.*FROM.*users/)
      expect(html).not.toContain('__CODEBLOCK_')
      expect(html).toContain('<p>First paragraph</p>')
      expect(html).toContain('<p>Middle paragraph</p>')
      expect(html).toContain('<p>Last paragraph</p>')
    })

    it('should handle code blocks with special characters', async () => {
      const markdown = `
\`\`\`javascript
const regex = /^__CODEBLOCK_\\d+__$/;
const html = '<div>Test</div>';
if (x < 5 && y > 10) { }
\`\`\`
`
      const html = await convertMarkdownToHtml(markdown)
      // Check for escaped HTML entities in the code
      expect(html).toMatch(/div.*Test.*div/)
      expect(html).toContain('__CODEBLOCK_') // This should be in the code
      expect(html).toMatch(/if.*x.*5.*y.*10/)
    })

    it('should handle code blocks without language specification', async () => {
      const markdown = `
\`\`\`
plain text code
without language
\`\`\`
`
      const html = await convertMarkdownToHtml(markdown)
      // PLAINTEXT is displayed in uppercase in the label
      expect(html).toContain('PLAINTEXT')
      expect(html).toContain('plain text code')
      expect(html).not.toContain('__CODEBLOCK_')
    })
  })

  describe('Inline Code', () => {
    it('should handle inline code', async () => {
      const markdown = 'Use `npm install` to install dependencies.'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<code>npm install</code>')
      expect(html).not.toContain('__INLINECODE_')
    })

    it('should handle multiple inline code snippets', async () => {
      const markdown = 'Run `npm start`, then `npm test`, and finally `npm build`.'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<code>npm start</code>')
      expect(html).toContain('<code>npm test</code>')
      expect(html).toContain('<code>npm build</code>')
      expect(html).not.toContain('__INLINECODE_')
    })

    it('should handle inline code with special characters', async () => {
      const markdown = 'The variable `<div>` should be escaped.'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<code>&lt;div&gt;</code>')
    })
  })

  describe('Headers', () => {
    it('should convert all header levels', async () => {
      const markdown = `# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<h1>H1 Header</h1>')
      expect(html).toContain('<h2>H2 Header</h2>')
      expect(html).toContain('<h3>H3 Header</h3>')
      expect(html).toContain('<h4>H4 Header</h4>')
      expect(html).toContain('<h5>H5 Header</h5>')
      expect(html).toContain('<h6>H6 Header</h6>')
    })

    it('should handle headers with inline code', async () => {
      const markdown = '## Using `const` in JavaScript'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<h2>Using <code>const</code> in JavaScript</h2>')
    })
  })

  describe('Text Formatting', () => {
    it('should handle bold text with **', async () => {
      const markdown = 'This is **bold text** here.'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<strong>bold text</strong>')
    })

    it('should handle bold text with __', async () => {
      const markdown = 'This is __bold text__ here.'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<strong>bold text</strong>')
    })

    it('should handle italic text with *', async () => {
      const markdown = 'This is *italic text* here.'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<em>italic text</em>')
    })

    it('should handle italic text with _', async () => {
      const markdown = 'This is _italic text_ here.'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<em>italic text</em>')
    })

    it('should not confuse placeholders with formatting', async () => {
      const markdown = `
Some text before

\`\`\`javascript
const x = 5;
\`\`\`

Some text with __bold__ and _italic_ after code block.
`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).not.toContain('__CODEBLOCK_')
      expect(html).not.toContain('__INLINECODE_')
      expect(html).toContain('<strong>bold</strong>')
      expect(html).toContain('<em>italic</em>')
      // Check that the code is present (will be wrapped in syntax highlighting)
      expect(html).toMatch(/const.*x.*=.*5/)
    })

    it('should handle nested formatting', async () => {
      const markdown = 'This is **bold with _italic_ inside** text.'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<strong>bold with <em>italic</em> inside</strong>')
    })
  })

  describe('Lists', () => {
    it('should handle unordered lists', async () => {
      const markdown = `* First item
* Second item
* Third item`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<ul>')
      expect(html).toContain('<li>First item</li>')
      expect(html).toContain('<li>Second item</li>')
      expect(html).toContain('<li>Third item</li>')
      expect(html).toContain('</ul>')
    })

    it('should handle ordered lists', async () => {
      const markdown = `1. First item
2. Second item
3. Third item`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<ol>')
      expect(html).toContain('<li>First item</li>')
      expect(html).toContain('<li>Second item</li>')
      expect(html).toContain('<li>Third item</li>')
      expect(html).toContain('</ol>')
    })

    it('should handle lists with inline code', async () => {
      const markdown = `* Run \`npm install\`
* Execute \`npm start\`
* Test with \`npm test\``
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<li>Run <code>npm install</code></li>')
      expect(html).toContain('<li>Execute <code>npm start</code></li>')
    })

    it('should handle lists with bold and italic', async () => {
      const markdown = `* **Bold** item
* *Italic* item
* Normal item`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<li><strong>Bold</strong> item</li>')
      expect(html).toContain('<li><em>Italic</em> item</li>')
    })
  })

  describe('Links and Images', () => {
    it('should handle links', async () => {
      const markdown = 'Check out [my website](https://example.com)'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">my website</a>')
    })

    it('should handle internal links', async () => {
      const markdown = 'Go to [home page](/)'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<a href="/" >home page</a>')
      expect(html).not.toContain('target="_blank"')
    })

    it('should handle images', async () => {
      const markdown = '![Alt text](image.jpg)'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<figure>')
      expect(html).toContain('<img src="image.jpg" alt="Alt text" loading="lazy">')
      expect(html).toContain('<figcaption>Alt text</figcaption>')
    })

    it('should handle links with inline code', async () => {
      const markdown = 'Use [`npm`](https://npmjs.com) for packages'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<a href="https://npmjs.com" target="_blank" rel="noopener noreferrer"><code>npm</code></a>')
    })
  })

  describe('Tables', () => {
    it('should handle basic tables', async () => {
      const markdown = `| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<table>')
      expect(html).toContain('<thead>')
      expect(html).toContain('<th>Header 1</th>')
      expect(html).toContain('<th>Header 2</th>')
      expect(html).toContain('<tbody>')
      expect(html).toContain('<td>Cell 1</td>')
    })
  })

  describe('Blockquotes', () => {
    it('should handle blockquotes', async () => {
      const markdown = '> This is a quote'
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<blockquote>This is a quote</blockquote>')
    })

    it('should handle multi-line blockquotes', async () => {
      const markdown = `> First line
> Second line
> Third line`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<blockquote>First line')
      expect(html).toContain('Second line')
      expect(html).toContain('Third line</blockquote>')
    })
  })

  describe('Paragraphs', () => {
    it('should wrap text in paragraphs', async () => {
      const markdown = `This is the first paragraph.

This is the second paragraph.

This is the third paragraph.`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<p>This is the first paragraph.</p>')
      expect(html).toContain('<p>This is the second paragraph.</p>')
      expect(html).toContain('<p>This is the third paragraph.</p>')
    })

    it('should handle paragraphs around code blocks', async () => {
      const markdown = `Before code

\`\`\`js
const x = 1;
\`\`\`

After code`
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<p>Before code</p>')
      expect(html).toContain('<p>After code</p>')
      expect(html).toContain('<div class="code-block-wrapper')
    })
  })

  describe('Complex Edge Cases', () => {
    it('should handle document with all elements', async () => {
      const markdown = `# Main Title

This is a paragraph with **bold**, *italic*, and \`inline code\`.

## Section with Code

Here's some code:

\`\`\`javascript
function test() {
  return "Hello __CODEBLOCK_0__";
}
\`\`\`

### Lists Section

* Item with **bold**
* Item with \`code\`
* Item with [link](https://example.com)

1. Numbered item
2. Another item

> This is a quote with \`code\` inside

| Table | Header |
| ----- | ------ |
| Data  | Cell   |

![Image](test.jpg)

Final paragraph with _emphasis_ and __strong__ text.`

      const html = await convertMarkdownToHtml(markdown)
      
      // Check all elements are present
      expect(html).toContain('<h1>Main Title</h1>')
      expect(html).toContain('<h2>Section with Code</h2>')
      expect(html).toContain('<h3>Lists Section</h3>')
      expect(html).toContain('<strong>bold</strong>')
      expect(html).toContain('<em>italic</em>')
      expect(html).toContain('<code>inline code</code>')
      // Check that the code is present (will be wrapped in syntax highlighting)
      expect(html).toMatch(/function.*test/)
      expect(html).toContain('__CODEBLOCK_0__') // Should preserve this in code
      expect(html).toContain('<ul>')
      expect(html).toContain('<ol>')
      expect(html).toContain('<blockquote>')
      expect(html).toContain('<table>')
      expect(html).toContain('<figure>')
      
      // Check no placeholders leaked (except the one in the actual code)
      // The code contains the string "__CODEBLOCK_0__" which should be preserved
      expect(html).toContain('"Hello __CODEBLOCK_0__"')
    })

    it('should handle code block at start of document', async () => {
      const markdown = `\`\`\`js
const x = 1;
\`\`\`

Following paragraph.`
      
      const html = await convertMarkdownToHtml(markdown)
      // Check that the code is present (will be wrapped in syntax highlighting)
      expect(html).toMatch(/const.*x.*=.*1/)
      expect(html).toContain('<p>Following paragraph.</p>')
      expect(html).not.toContain('__CODEBLOCK_')
    })

    it('should handle code block at end of document', async () => {
      const markdown = `Starting paragraph.

\`\`\`js
const x = 1;
\`\`\``
      
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('<p>Starting paragraph.</p>')
      // Check that the code is present (will be wrapped in syntax highlighting)
      expect(html).toMatch(/const.*x.*=.*1/)
      expect(html).not.toContain('__CODEBLOCK_')
    })

    it('should handle consecutive code blocks', async () => {
      const markdown = `\`\`\`js
first block
\`\`\`

\`\`\`python
second block
\`\`\`

\`\`\`sql
third block
\`\`\``
      
      const html = await convertMarkdownToHtml(markdown)
      // Check that the code blocks are present
      expect(html).toMatch(/first.*block/)
      expect(html).toMatch(/second.*block/)
      expect(html).toMatch(/third.*block/)
      expect(html).not.toContain('__CODEBLOCK_')
    })

    it('should preserve underscores that are not formatting', async () => {
      const markdown = `Variables like user_name and __dirname should be preserved.

But __this__ should be bold.`
      
      const html = await convertMarkdownToHtml(markdown)
      expect(html).toContain('user_name')
      // __dirname should be preserved as is (not treated as bold formatting)
      expect(html).toMatch(/__dirname/)
      expect(html).toContain('<strong>this</strong>')
    })

    it('should handle text that looks like placeholders', async () => {
      const markdown = `Discussion about __CODEBLOCK_0__ and __INLINECODE_1__ patterns.

\`\`\`js
// Real code here
\`\`\`

More text about patterns.`
      
      const html = await convertMarkdownToHtml(markdown)
      // These should not be treated as placeholders since they're in the original content
      // These patterns in regular text should be preserved
      expect(html).toMatch(/__CODEBLOCK_0__/)
      expect(html).toMatch(/__INLINECODE_1__/)
      expect(html).toMatch(/\/\/.*Real.*code.*here/)
    })
  })

  describe('Performance and Security', () => {
    it('should handle very long code blocks', async () => {
      const longCode = Array(100).fill('const x = 1;').join('\n')
      const markdown = `\`\`\`js
${longCode}
\`\`\``
      
      const html = await convertMarkdownToHtml(markdown)
      // Check that the code is present (will be wrapped in syntax highlighting)
      expect(html).toMatch(/const.*x.*=.*1/)
      expect(html).not.toContain('__CODEBLOCK_')
    })

    it('should escape HTML in markdown text', async () => {
      const markdown = `<script>alert('XSS')</script>

<div onclick="alert('XSS')">Click me</div>`
      
      const html = await convertMarkdownToHtml(markdown)
      expect(html).not.toContain('<script>')
      expect(html).not.toContain('onclick=')
    })

    it('should handle malformed markdown gracefully', async () => {
      const markdown = `**Unclosed bold

\`\`\`
Unclosed code block`
      
      const html = await convertMarkdownToHtml(markdown)
      // Should not throw and should produce some output
      expect(html).toBeTruthy()
    })
  })
})