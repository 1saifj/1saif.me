import { describe, expect, it } from 'vitest'
import { commentToHtml } from './commentMarkdown'
import { Format, formatSelection } from './commentEditor'

const apply = (value: string, start: number, end: number, format: Format) => {
  const edit = formatSelection(value, start, end, format)
  const text = value.slice(0, edit.from) + edit.text + value.slice(edit.to)

  return { text, selected: text.slice(edit.selectionStart, edit.selectionEnd), html: commentToHtml(text) }
}

describe('formatSelection', () => {
  it('wraps the selection and keeps it selected', () => {
    expect(apply('a big deal', 2, 5, 'bold')).toMatchObject({ text: 'a **big** deal', selected: 'big' })
    expect(apply('a big deal', 2, 5, 'italic').html).toBe('<p>a <em>big</em> deal</p>')
    expect(apply('run ls now', 4, 6, 'code').html).toBe('<p>run <code>ls</code> now</p>')
  })

  it('puts the cursor between the markers when nothing is selected', () => {
    const edit = formatSelection('ab', 1, 1, 'bold')

    expect([edit.text, edit.selectionStart, edit.selectionEnd]).toEqual(['****', 3, 3])
  })

  it('selects the address of a new link', () => {
    expect(apply('see docs', 4, 8, 'link')).toMatchObject({ text: 'see [docs](https://)', selected: 'https://' })
    expect(formatSelection('', 0, 0, 'link')).toMatchObject({ text: '[](https://)', selectionStart: 1 })
  })

  it('turns every touched line into a list that renders as one', () => {
    const result = apply('Steps:\none\ntwo', 9, 12, 'orderedList')

    expect(result.text).toBe('Steps:\n\n1. one\n2. two')
    expect(result.html).toBe('<p>Steps:</p><ol><li>one</li><li>two</li></ol>')
    expect(apply('note', 0, 0, 'quote').html).toBe('<blockquote><p>note</p></blockquote>')
    expect(apply('x\n\nitem\nafter', 3, 3, 'list').text).toBe('x\n\n- item\n\nafter')
  })

  it('fences the selection as a code block with blank lines around it', () => {
    const result = apply('try go build now', 4, 12, 'codeBlock')

    expect(result).toMatchObject({ text: 'try \n\n```\ngo build\n```\n\n now', selected: 'go build' })
    expect(result.html).toContain('<pre data-lang="text">')
  })
})
