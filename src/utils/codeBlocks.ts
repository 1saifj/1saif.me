import { highlightCode } from './syntaxHighlighter'

// Article and project bodies render as plain HTML (prerendered, so the text paints at once).
// This adds the interactive parts in place, without re-rendering the prose: syntax colors for
// each code block as it nears the viewport, and the Copy buttons.
export function enhanceCodeBlocks(root: HTMLElement): () => void {
  const highlight = async (pre: HTMLElement) => {
    const language = pre.dataset.lang

    if (!language || language === 'text') return
    const template = document.createElement('template')

    // Shiki escapes the code it wraps, and the code is this site's own Markdown.
    template.innerHTML = await highlightCode(pre.textContent ?? '', language)
    const colored = template.content.firstElementChild

    if (!colored || !pre.isConnected) return
    colored.classList.add(...pre.classList)
    pre.replaceWith(colored)
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

  const onClick = (event: MouseEvent) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('.copy-button') : null
    const code = button?.closest('.code-block-container')?.querySelector('pre')

    if (!button || !code || !navigator.clipboard) return
    void navigator.clipboard.writeText(code.textContent ?? '').then(() => {
      button.textContent = 'Copied'
      setTimeout(() => { button.textContent = 'Copy' }, 1500)
    })
  }

  root.addEventListener('click', onClick)

  return () => {
    observer?.disconnect()
    root.removeEventListener('click', onClick)
  }
}
