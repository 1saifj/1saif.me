import { describe, expect, it, vi } from 'vitest'
import { convertMarkdownToHtml } from './markdownProcessor'
import { applyLineHighlight, enhanceCodeBlocks } from './codeBlocks'

describe('enhanceCodeBlocks', () => {
  it('colors a code block in place and leaves the prose untouched', async () => {
    const root = document.createElement('div')

    root.innerHTML = convertMarkdownToHtml('Intro text.\n\n```go\nfunc main() {}\n```')
    document.body.append(root)
    const paragraph = root.querySelector('p')
    const cleanup = enhanceCodeBlocks(root)

    await vi.waitFor(() => expect(root.querySelector('pre.shiki')).not.toBeNull(), { timeout: 5000 })
    expect(root.querySelector('pre.shiki')?.textContent).toBe('func main() {}')
    expect(root.querySelector('p')).toBe(paragraph)
    cleanup()
    root.remove()
  })

  it('copies the code when Copy is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.assign(navigator, { clipboard: { writeText } })
    const root = document.createElement('div')

    root.innerHTML = convertMarkdownToHtml('```text\na < b\n```')
    const cleanup = enhanceCodeBlocks(root)

    root.querySelector<HTMLButtonElement>('.copy-button')?.click()
    expect(writeText).toHaveBeenCalledWith('a < b')
    await vi.waitFor(() => expect(root.querySelector('.copy-button')?.textContent).toBe('Copied'))
    cleanup()
  })

  it('copies shell commands without the $ prompt', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.assign(navigator, { clipboard: { writeText } })
    const root = document.createElement('div')

    root.innerHTML = convertMarkdownToHtml('```bash\n$ npm install\n$ npm test\n```')
    const cleanup = enhanceCodeBlocks(root)

    root.querySelector<HTMLButtonElement>('.copy-button')?.click()
    expect(writeText).toHaveBeenCalledWith('npm install\nnpm test')
    cleanup()
  })

  it('opens and folds a long block', () => {
    const root = document.createElement('div')

    root.innerHTML = convertMarkdownToHtml('```text\n' + Array.from({ length: 40 }, (_, i) => `l${i}`).join('\n') + '\n```')
    const cleanup = enhanceCodeBlocks(root)
    const block = root.querySelector('.code-block-container')
    const button = root.querySelector<HTMLButtonElement>('.code-expand')

    button?.click()
    expect(block?.hasAttribute('data-collapsed')).toBe(false)
    expect(button?.getAttribute('aria-expanded')).toBe('true')
    button?.click()
    expect(block?.hasAttribute('data-collapsed')).toBe(true)
    expect(button?.textContent).toBe('Show all 40 lines')
    cleanup()
  })

  it('keeps the title and the highlighted lines after Shiki replaces the code', async () => {
    const root = document.createElement('div')

    root.innerHTML = convertMarkdownToHtml('```go title="cmd/api/main.go" {2}\nfunc main() {}\nfunc helper() {}\n```')
    document.body.append(root)
    const cleanup = enhanceCodeBlocks(root)

    await vi.waitFor(() => expect(root.querySelector('pre.shiki')).not.toBeNull(), { timeout: 5000 })
    const marks = [...root.querySelectorAll('.code-content .line')].map(line => line.classList.contains('highlighted'))

    expect(root.querySelector('.code-title')?.textContent).toBe('cmd/api/main.go')
    expect(root.querySelector('pre')?.dataset.highlight).toBe('2')
    expect(marks).toEqual([false, true])
    cleanup()
    root.remove()
  })

  it('copies the code only, with no title and no markers', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.assign(navigator, { clipboard: { writeText } })
    const root = document.createElement('div')

    root.innerHTML = convertMarkdownToHtml('```bash title="scripts/setup.sh" {1}\n$ npm install\n$ npm test\n```')
    const cleanup = enhanceCodeBlocks(root)

    root.querySelector<HTMLButtonElement>('.copy-button')?.click()
    expect(writeText).toHaveBeenCalledWith('npm install\nnpm test')
    cleanup()
  })
})

describe('applyLineHighlight', () => {
  it('marks the lines named in the pre data attribute', () => {
    const pre = document.createElement('pre')

    pre.dataset.highlight = '1,3'
    pre.innerHTML = '<code><span class="line">a</span>\n<span class="line">b</span>\n<span class="line">c</span></code>'
    applyLineHighlight(pre)
    expect([...pre.querySelectorAll('.line')].map(line => line.classList.contains('highlighted'))).toEqual([true, false, true])
  })

  it('leaves a pre that names no lines alone', () => {
    const pre = document.createElement('pre')

    pre.innerHTML = '<code><span class="line">a</span></code>'
    applyLineHighlight(pre)
    expect(pre.querySelector('.highlighted')).toBeNull()
  })
})
