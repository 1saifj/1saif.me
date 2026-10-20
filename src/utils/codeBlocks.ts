import { isHighlightedLine, parseLineRanges } from './codeFenceMeta'
import { highlightCode } from './syntaxHighlighter'

const shells = new Set(['bash', 'sh', 'shell', 'zsh'])

// Shiki rewrites the code element, so the marks the server laid down are put back from the pre's data attribute.
export const applyLineHighlight = (pre: HTMLElement): void => {
  const ranges = parseLineRanges(pre.dataset.highlight ?? '')

  if (!ranges.length) return
  const lines = [...pre.querySelectorAll<HTMLElement>('.line')]

  lines.forEach((line, index) => {
    if (isHighlightedLine(ranges, index + 1)) line.classList.add('highlighted')
  })
}

// Article and project bodies render as plain HTML (prerendered, so the text paints at once).
// This adds the interactive parts in place, without re-rendering the prose: syntax colors for
// each code block as it nears the viewport, the Copy buttons, and Show all for folded blocks.
export function enhanceCodeBlocks(root: HTMLElement): () => void {
  const highlight = async (pre: HTMLElement) => {
    const language = pre.dataset.lang

    if (!language || language === 'text') return
    const template = document.createElement('template')

    // Shiki escapes the code it wraps, and the code is this site's own Markdown.
    template.innerHTML = await highlightCode(pre.textContent ?? '', language)
    const colored = template.content.firstElementChild

    if (!(colored instanceof HTMLElement) || !pre.isConnected) return
    colored.classList.add(...pre.classList)
    Object.assign(colored.dataset, pre.dataset)
    pre.replaceWith(colored)
    applyLineHighlight(colored)
  }

  const blocks = [...root.querySelectorAll<HTMLElement>('pre[data-lang]')]

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue
        observer?.unobserve(entry.target)
        void highlight(entry.target)
      }
    }, { rootMargin: '400px 0px' })
    : undefined

  for (const block of blocks) {
    if (observer) observer.observe(block)
    else void highlight(block)
  }

  const copy = (button: HTMLButtonElement) => {
    const pre = button.closest('.code-block-container')?.querySelector('pre')

    if (!pre || !navigator.clipboard) return
    const text = pre.textContent ?? ''

    // Shell examples copy as commands: a leading "$ " prompt is left out.
    void navigator.clipboard.writeText(shells.has(pre.dataset.lang ?? '') ? text.replace(/^\$ /gm, '') : text).then(() => {
      button.textContent = 'Copied'
      button.dataset.copied = ''
      setTimeout(() => {
        button.textContent = 'Copy'
        delete button.dataset.copied
      }, 1500)
    })
  }

  const toggle = (button: HTMLButtonElement) => {
    const block = button.closest<HTMLElement>('.code-block-container')

    if (!block) return
    const open = block.hasAttribute('data-collapsed')

    block.toggleAttribute('data-collapsed', !open)
    button.setAttribute('aria-expanded', String(open))
    button.textContent = open ? 'Show less' : `Show all ${button.dataset.lines} lines`

    // Folding again from below would leave the reader past the block, so bring its top back into view.
    if (!open && block.getBoundingClientRect().top < 0) block.scrollIntoView({ block: 'start' })
  }

  const onClick = (event: MouseEvent) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('.copy-button, .code-expand') : null

    if (!button) return

    if (button.classList.contains('copy-button')) copy(button)
    else toggle(button)
  }

  root.addEventListener('click', onClick)

  return () => {
    observer?.disconnect()
    root.removeEventListener('click', onClick)
  }
}
