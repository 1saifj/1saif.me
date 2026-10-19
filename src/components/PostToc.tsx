import React, { useEffect, useState } from 'react'

export type Heading = { id: string; text: string }

const decode = (text: string) => text.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim()

// The post's sections, from the h2 ids utils/markdownProcessor.ts writes. Same result for the prerendered string
// and for the browser's copy of it, so the list hydrates without a mismatch.
export const postHeadings = (html: string): Heading[] =>
  [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<a class="heading-anchor"/g)].map(match => ({ id: match[1], text: decode(match[2]) }))

// A post needs this many sections before a contents list helps.
export const tocFrom = 3

// "On this page" beside long posts on wide screens; the section being read is marked.
export const PostToc: React.FC<{ headings: Heading[]; label: string; language: string }> = ({ headings, label, language }) => {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (headings.length < tocFrom || !('IntersectionObserver' in window)) return undefined
    // A heading counts as current while it is in the top third of the screen, under the sticky header.
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]

      if (visible) setActive(visible.target.id)
    }, { rootMargin: '-80px 0px -66% 0px' })

    headings.forEach(heading => {
      const element = document.getElementById(heading.id)

      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < tocFrom) return null

  return (
    <nav className="post-toc" aria-label={label}>
      <p lang={language}>{label}</p>
      <ol>
        {headings.map(heading => <li key={heading.id}><a href={`#${heading.id}`} aria-current={active === heading.id ? 'location' : undefined}>{heading.text}</a></li>)}
      </ol>
    </nav>
  )
}
