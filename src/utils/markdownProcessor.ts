import { getLanguageLabel } from './syntaxHighlighter'

export const convertMarkdownToHtml = (markdown: string): string => {
  // Step 1a: Code blocks first. They render as escaped plain text, tagged with their language.
  // In the browser, utils/codeBlocks.ts adds syntax colors in place and wires the Copy button.
  let html = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang: string | undefined, code: string) => {
    const language = lang || 'text'
    const escapedCode = code.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const block = `
      <div class="code-block-container relative group my-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-900">
        <div class="code-header flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            <span>${getLanguageLabel(language)}</span>
          </span>
          <button type="button" class="copy-button px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-500 rounded-md hover:bg-slate-50 dark:hover:bg-slate-500 hover:text-slate-800 dark:hover:text-slate-100 opacity-80 hover:opacity-100 focus:ring-2 focus:ring-blue-500 focus:outline-none" title="Copy code to clipboard">Copy</button>
        </div>
        <div class="code-content code-surface relative">
          <pre class="m-0 p-4 overflow-x-auto text-sm leading-relaxed" data-lang="${language}"><code>__ESCAPED_CODE__</code></pre>
        </div>
      </div>
    `.replace(/\s*\n\s*/g, ' ').replace(/>\s+</g, '><').trim().replace('__ESCAPED_CODE__', () => escapedCode)

    return `<!--code-block-->${block}<!--/code-block-->`
  })

  // Step 1b: Hide code blocks from every later step, headings included
  const protectedBlocks: { placeholder: string; content: string }[] = []
  // Explicit markers: a regex on </div> stopped at the header and left the code exposed to the newline-to-<br> step.
  html = html.replace(/<!--code-block-->[\s\S]*?<!--\/code-block-->/g, (match) => {
    const placeholder = `___PROTECTED_BLOCK_${protectedBlocks.length}___`
    protectedBlocks.push({ placeholder, content: match })

    return placeholder
  })

  // Step 2: Headings, now that code blocks are hidden (a `# comment` in code is not a heading)
  html = html
    // Convert headers (with improved styling and dark mode support)
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-10 mb-6 pb-3 border-b-2 border-blue-100 dark:border-blue-800">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-8 pb-4 border-b-2 border-blue-200 dark:border-blue-700">$1</h1>')

  // Step 4: Continue with other markdown processing
  html = html
    // Enhanced tables with professional styling and dark mode support
    .replace(/\|(.+)\|\n\|[-\s|:]+\|\n((?:\|.+\|\n?)*)/g, (_match, header, rows) => {
      const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)

      const rowData = rows.trim().split('\n').map((row: string) => 
        row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
      )
      
      const headerHtml = headerCells.map((cell: string) => 
        `<th class="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">${cell}</th>`
      ).join('')
      
      const rowsHtml = rowData.map((row: string[], index: number) => 
        `<tr class="${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150">
          ${row.map((cell: string) => `<td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">${cell}</td>`).join('')}
        </tr>`
      ).join('')
      
      return `
        <div class="table-container my-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-800">
              <tr>${headerHtml}</tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">${rowsHtml}</tbody>
          </table>
        </div>
      `.replace(/\s*\n\s*/g, '')
    })

    // Enhanced images with responsive styling and dark mode support
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
      return `<figure class="my-8">
        <img src="${src}" alt="${alt}" class="w-full max-w-4xl mx-auto rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300" loading="lazy">
        ${alt ? `<figcaption class="text-center text-sm text-slate-600 dark:text-slate-400 mt-3 italic">${alt}</figcaption>` : ''}
      </figure>`
    })

    // Enhanced links with better styling and security (dark mode support)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
      const isExternal = url.startsWith('http') || url.startsWith('https')
      const securityAttrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
      const styling = 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 hover:decoration-blue-300 dark:hover:decoration-blue-400 transition-all duration-200'
      
      return `<a href="${url}" class="${styling}" ${securityAttrs}>${text}</a>`
    })

    // Enhanced lists with improved spacing and styling (dark mode support)
    .replace(/^[*-] (.+$)/gm, '<li class="text-slate-700 dark:text-slate-300 leading-relaxed mb-2 ml-6 relative"><span class="absolute -left-6 text-blue-500 dark:text-blue-400 font-bold">•</span>$1</li>')
    .replace(/^(\d+)\. (.+$)/gm, '<li class="text-slate-700 dark:text-slate-300 leading-relaxed mb-2 ml-8 relative"><span class="absolute -left-8 text-blue-600 dark:text-blue-400 font-semibold">$1.</span>$2</li>')
    // Each run of consecutive items becomes one list; the items draw their own bullet or number.
    .replace(/<li[^>]*>.*?<\/li>(?:\n<li[^>]*>.*?<\/li>)*/g, items => `<ul class="md-list">${items.replace(/\n/g, '')}</ul>`)

    // Text formatting with subtle styling improvements (dark mode support)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-800 dark:text-slate-200">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded text-sm font-mono border border-slate-200 dark:border-slate-700">$1</code>')

    // Enhanced blockquotes with modern styling (dark mode support)
    .replace(/^> (.+$)/gm, '<blockquote class="border-l-4 border-blue-400 dark:border-blue-500 pl-6 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 text-slate-700 dark:text-slate-300 italic rounded-r-lg">$1</blockquote>')

    // Convert line breaks while preserving structure
    .replace(/\n\n/g, '</p><p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">')
    .replace(/\n/g, '<br>')

  // Wrap content in paragraph tags with proper styling (dark mode support)
  html = `<div class="prose prose-slate max-w-none">
    <p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">${html}</p>
  </div>`

  // Clean up any empty paragraphs and malformed tags
  html = html
    .replace(/<p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-4"><\/p>/g, '')
    .replace(/<p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">(\s*<(?:h[1-6]|div|blockquote|ul|ol|table))/g, '$1')
    .replace(/(<\/(?:h[1-6]|div|blockquote|ul|ol|table)>\s*)<\/p>/g, '$1')

  // Step 5: Restore protected code blocks
  protectedBlocks.forEach(({ placeholder, content }) => {
    html = html.replace(placeholder, () => content)
  })

  return html
}

// Copy functionality is now handled via event delegation in BlogPost component