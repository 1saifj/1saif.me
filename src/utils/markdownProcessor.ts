import { highlightCode, getLanguageLabel } from './syntaxHighlighter'

export const convertMarkdownToHtml = async (markdown: string): Promise<string> => {
  // Step 1: Convert basic markdown elements
  let html = markdown
    // Convert headers (with improved styling and dark mode support)
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-10 mb-6 pb-3 border-b-2 border-blue-100 dark:border-blue-800">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-8 pb-4 border-b-2 border-blue-200 dark:border-blue-700">$1</h1>')

  // Step 2: Process code blocks asynchronously
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const codeBlocks: Array<{ match: string; language: string; code: string; index: number }> = []
  
  let match
  while ((match = codeBlockRegex.exec(html)) !== null) {
    codeBlocks.push({
      match: match[0],
      language: match[1] || 'text',
      code: match[2].trim(),
      index: match.index
    })
  }

  // Process all code blocks in parallel
  const processedCodeBlocks = await Promise.all(
    codeBlocks.map(async (block) => {
      const { language, code } = block
      const languageLabel = getLanguageLabel(language)
      
      try {
        const highlightedCode = await highlightCode(code, language)
        const codeId = Math.random().toString(36).substr(2, 9)
        
        return {
          ...block,
          replacement: `
            <div class="code-block-container relative group my-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
              <div class="code-header flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <span class="text-sm font-medium text-slate-600 dark:text-slate-300">${languageLabel}</span>
                <button 
                  data-copy-target="${codeId}" 
                  class="copy-button text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded border border-slate-200 dark:border-slate-600 transition-all duration-200 opacity-70 group-hover:opacity-100"
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
              <div class="code-content relative">
                <div id="${codeId}" class="syntax-highlighted-code [&>pre]:!m-0 [&>pre]:!p-4 [&>pre]:block [&>pre]:w-full">${highlightedCode}</div>
              </div>
            </div>
          `.trim()
        }
      } catch (error) {
        console.warn(`Failed to process code block for language: ${language}`, error)
        // Fallback to plain text with basic styling
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return {
          ...block,
          replacement: `
            <div class="code-block-container relative group my-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
              <div class="code-header flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <span class="text-sm font-medium text-slate-600 dark:text-slate-300">${languageLabel}</span>
                <button 
                  data-copy-target="fallback-${Math.random().toString(36).substr(2, 9)}" 
                  class="copy-button text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded border border-slate-200 dark:border-slate-600 transition-all duration-200 opacity-70 group-hover:opacity-100"
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
              <div class="code-content relative">
                <pre class="m-0 p-4 bg-slate-900 dark:bg-slate-800 text-slate-100 dark:text-slate-200 overflow-x-auto"><code>${escapedCode}</code></pre>
              </div>
            </div>
          `.trim()
        }
      }
    })
  )

  // Replace code blocks in reverse order to maintain correct indices
  processedCodeBlocks
    .sort((a, b) => b.index - a.index)
    .forEach(block => {
      html = html.slice(0, block.index) + block.replacement + html.slice(block.index + block.match.length)
    })

  // Step 3: Protect Shiki code blocks from further processing
  const protectedBlocks: { placeholder: string; content: string }[] = []
  html = html.replace(/<div class="code-block-container[\s\S]*?<\/div>/g, (match) => {
    const placeholder = `___PROTECTED_BLOCK_${protectedBlocks.length}___`
    protectedBlocks.push({ placeholder, content: match })
    return placeholder
  })

  // Step 4: Continue with other markdown processing
  html = html
    // Enhanced tables with professional styling and dark mode support
    .replace(/\|(.+)\|\n\|[-\s|:]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
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
      `
    })

    // Enhanced images with responsive styling and dark mode support
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      return `<figure class="my-8">
        <img src="${src}" alt="${alt}" class="w-full max-w-4xl mx-auto rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300" loading="lazy">
        ${alt ? `<figcaption class="text-center text-sm text-slate-600 dark:text-slate-400 mt-3 italic">${alt}</figcaption>` : ''}
      </figure>`
    })

    // Enhanced links with better styling and security (dark mode support)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const isExternal = url.startsWith('http') || url.startsWith('https')
      const securityAttrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
      const styling = 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 hover:decoration-blue-300 dark:hover:decoration-blue-400 transition-all duration-200'
      
      return `<a href="${url}" class="${styling}" ${securityAttrs}>${text}</a>`
    })

    // Enhanced lists with improved spacing and styling (dark mode support)
    .replace(/^\* (.+$)/gm, '<li class="text-slate-700 dark:text-slate-300 leading-relaxed mb-2 ml-6 relative"><span class="absolute -left-6 text-blue-500 dark:text-blue-400 font-bold">•</span>$1</li>')
    .replace(/^(\d+)\. (.+$)/gm, '<li class="text-slate-700 dark:text-slate-300 leading-relaxed mb-2 ml-8 relative"><span class="absolute -left-8 text-blue-600 dark:text-blue-400 font-semibold">$1.</span>$2</li>')

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
    html = html.replace(placeholder, content)
  })

  return html
}

// Copy functionality is now handled via event delegation in BlogPost component