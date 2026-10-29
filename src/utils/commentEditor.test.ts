import { describe, expect, it } from 'vitest'
import { commentToHtml } from './commentMarkdown'
import { continueList, Format, formatSelection, pasteLink, quoteReply } from './commentEditor'

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

  it('wraps each line of a selection over lines, so every line renders bold', () => {
    const result = apply('one\n\ntwo', 0, 8, 'bold')

    expect(result).toMatchObject({ text: '**one**\n\n**two**', selected: '**one**\n\n**two**' })
    expect(result.html).toBe('<p><strong>one</strong></p><p><strong>two</strong></p>')
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

  it('turns a line into a heading that renders as one', () => {
    expect(apply('Intro\nSetup\nRun it', 7, 7, 'heading').html).toBe('<p>Intro</p><h5>Setup</h5><p>Run it</p>')
  })

  it('leaves the next line alone when the selection ends with its line break', () => {
    expect(apply('a\nb', 0, 2, 'heading')).toMatchObject({ text: '### a\n\nb', html: '<h5>a</h5><p>b</p>' })
  })

  it('formats the first line when the cursor sits before a blank first line', () => {
    expect(apply('\nitem', 0, 0, 'list').text).toBe('- \n\nitem')
  })

  it('fences the selection as a code block with blank lines around it', () => {
    const result = apply('try go build now', 4, 12, 'codeBlock')

    expect(result).toMatchObject({ text: 'try \n\n```\ngo build\n```\n\n now', selected: 'go build' })
    expect(result.html).toContain('<pre data-lang="text">')
  })
})

describe('pasteLink', () => {
  it('links the selected text to a pasted address', () => {
    const edit = pasteLink('see the docs here', 8, 12, ' https://developers.cloudflare.com/d1/ \n')

    expect(edit).toEqual({ from: 8, to: 12, text: '[docs](https://developers.cloudflare.com/d1/)', selectionStart: 53, selectionEnd: 53 })
    expect(commentToHtml(`see the ${edit?.text} here`)).toContain('<a href="https://developers.cloudflare.com/d1/"')
  })

  it.each([
    ['nothing is selected', 'docs', 2, 2, 'https://x.dev'],
    ['the selection spans lines', 'a\nb', 0, 3, 'https://x.dev'],
    ['the paste is not one address', 'docs', 0, 4, 'see https://x.dev'],
    ['the address is not http', 'docs', 0, 4, 'javascript:alert(1)'],
    ['the text is in a code block', '```\nx = "foo"', 9, 12, 'https://x.dev'],
    ['the text is in a code span', 'run `foo` now', 5, 8, 'https://x.dev'],
  ])('pastes as usual when %s', (_, value, start, end, pasted) => {
    expect(pasteLink(value, start, end, pasted)).toBeUndefined()
  })
})

// Presses Enter at the caret, marked |, and returns the text with the new caret marked |.
const enter = (marked: string) => {
  const caret = marked.indexOf('|')
  const value = marked.replace('|', '')
  const edit = continueList(value, caret)

  if (!edit) return undefined
  const text = value.slice(0, edit.from) + edit.text + value.slice(edit.to)

  return text.slice(0, edit.selectionStart) + '|' + text.slice(edit.selectionStart)
}

describe('continueList', () => {
  it('starts the next item of a list or a quote', () => {
    expect(enter('- one|')).toBe('- one\n- |')
    expect(enter('* one|\nafter')).toBe('* one\n* |\nafter')
    expect(enter('> said|')).toBe('> said\n> |')
    expect(enter('9. nine|')).toBe('9. nine\n10. |')
  })

  it('renders what it continues as one list', () => {
    expect(commentToHtml('9. nine\n10. ten')).toBe('<ol><li>nine</li><li>ten</li></ol>')
  })

  it('ends the list on an empty item and removes its marker', () => {
    expect(enter('- one\n- |')).toBe('- one\n|')
    expect(enter('- one\n2. |')).toBe('- one\n|')
    expect(enter('> a\n>|')).toBe('> a\n|')
  })

  it('leaves Enter alone in the middle of a line, outside a list, and inside a code block', () => {
    expect(enter('- on|e')).toBeUndefined()
    expect(enter('plain|')).toBeUndefined()
    expect(enter('+ not a list here|')).toBeUndefined()
    expect(enter('```\n- inside code|')).toBeUndefined()
    expect(enter('```\ncode\n```\n- after code|')).toBe('```\ncode\n```\n- after code\n- |')
    expect(enter('- run `npm i`|')).toBe('- run `npm i`\n- |')
  })
})

describe('quoteReply', () => {
  it('quotes every line, keeps an empty line inside the quote, and renders as one quote', () => {
    const quoted = quoteReply('First line\nsecond\n\nThird')

    expect(quoted).toBe('> First line\n> second\n>\n> Third')
    expect(commentToHtml(quoted)).toBe('<blockquote><p>First line<br>second<br><br>Third</p></blockquote>')
  })

  it('leaves code blocks out, because a fence inside a quote does not render', () => {
    expect(quoteReply('Try this:\n\n```bash\nls\n```\n\nIt worked.')).toBe('> Try this:\n>\n> It worked.')
    expect(quoteReply('```js\nonly()\n```')).toBe('')
  })
})
