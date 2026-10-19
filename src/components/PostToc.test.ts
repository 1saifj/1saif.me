import { describe, expect, it } from 'vitest'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'
import { postHeadings } from './PostToc'

describe('postHeadings', () => {
  it('lists the h2 sections with plain text, skipping h3', () => {
    const html = convertMarkdownToHtml('# Title\n\n## Why `a<b` matters\n\nText.\n\n### Detail\n\n## Fix & test\n\nMore.')

    expect(postHeadings(html)).toEqual([
      { id: 'why-a-b-matters', text: 'Why a<b matters' },
      { id: 'fix-test', text: 'Fix & test' },
    ])
  })

  it('reads the same list from the browser copy of the article', () => {
    const html = convertMarkdownToHtml('## One\n\nA.\n\n## Two > three\n\nB.')
    const root = document.createElement('div')

    root.innerHTML = html
    expect(postHeadings(root.innerHTML)).toEqual(postHeadings(html))
  })
})
