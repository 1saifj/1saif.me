import { describe, expect, it, vi } from 'vitest'
import { convertMarkdownToHtml } from './markdownProcessor'
import { enhanceCodeBlocks } from './codeBlocks'

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
})
