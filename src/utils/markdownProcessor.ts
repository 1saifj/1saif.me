import { highlightCode, getLanguageLabel } from './syntaxHighlighter'

export const convertMarkdownToHtml = async (markdown: string): Promise<string> => {
  // Step 1: Convert basic markdown elements
  let html = markdown
    // Convert headers (with improved styling)
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-200">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-slate-800 mt-10 mb-6 pb-3 border-b-2 border-blue-100">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-900 mt-12 mb-8 pb-4 border-b-2 border-blue-200">$1</h1>')

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
            <div class="code-block-container relative group my-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <div class="code-header flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span class="text-sm font-medium text-slate-600">${languageLabel}</span>
                <button 
                  data-copy-target="${codeId}" 
                  class="copy-button text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded border transition-all duration-200 opacity-70 group-hover:opacity-100"
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
            <div class="code-block-container relative group my-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <div class="code-header flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span class="text-sm font-medium text-slate-600">${languageLabel}</span>
                <button 
                  data-copy-target="fallback-${Math.random().toString(36).substr(2, 9)}" 
                  class="copy-button text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded border transition-all duration-200 opacity-70 group-hover:opacity-100"
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
              <div class="code-content relative">
                <pre class="m-0 p-4 bg-slate-900 text-slate-100 overflow-x-auto"><code>${escapedCode}</code></pre>
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
    // Enhanced tables with professional styling
    .replace(/\|(.+)\|\n\|[-\s|:]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
      const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
      const rowData = rows.trim().split('\n').map((row: string) => 
        row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
      )
      
      const headerHtml = headerCells.map((cell: string) => 
        `<th class="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 bg-slate-50">${cell}</th>`
      ).join('')
      
      const rowsHtml = rowData.map((row: string[], index: number) => 
        `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors duration-150">
          ${row.map((cell: string) => `<td class="px-6 py-4 text-sm text-slate-700 border-b border-slate-200">${cell}</td>`).join('')}
        </tr>`
      ).join('')
      
      return `
        <div class="table-container my-6 overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>${headerHtml}</tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">${rowsHtml}</tbody>
          </table>
        </div>
      `
    })

    // Enhanced links with better styling and security
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const isExternal = url.startsWith('http') || url.startsWith('https')
      const securityAttrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
      const styling = isExternal 
        ? 'text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-300 transition-all duration-200'
        : 'text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-300 transition-all duration-200'
      
      return `<a href="${url}" class="${styling}" ${securityAttrs}>${text}</a>`
    })

    // Enhanced lists with improved spacing and styling
    .replace(/^\* (.+$)/gm, '<li class="text-slate-700 leading-relaxed mb-2 ml-6 relative"><span class="absolute -left-6 text-blue-500 font-bold">•</span>$1</li>')
    .replace(/^(\d+)\. (.+$)/gm, '<li class="text-slate-700 leading-relaxed mb-2 ml-8 relative"><span class="absolute -left-8 text-blue-600 font-semibold">$1.</span>$2</li>')

    // Text formatting with subtle styling improvements
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-slate-700">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono border">$1</code>')

    // Enhanced blockquotes with modern styling
    .replace(/^> (.+$)/gm, '<blockquote class="border-l-4 border-blue-400 pl-6 py-2 my-4 bg-blue-50 text-slate-700 italic rounded-r-lg">$1</blockquote>')

    // Convert line breaks while preserving structure
    .replace(/\n\n/g, '</p><p class="text-slate-700 leading-relaxed mb-4">')
    .replace(/\n/g, '<br>')

  // Wrap content in paragraph tags with proper styling
  html = `<div class="prose prose-slate max-w-none">
    <p class="text-slate-700 leading-relaxed mb-4">${html}</p>
  </div>`

  // Clean up any empty paragraphs and malformed tags
  html = html
    .replace(/<p class="text-slate-700 leading-relaxed mb-4"><\/p>/g, '')
    .replace(/<p class="text-slate-700 leading-relaxed mb-4">(\s*<(?:h[1-6]|div|blockquote|ul|ol|table))/g, '$1')
    .replace(/(<\/(?:h[1-6]|div|blockquote|ul|ol|table)>\s*)<\/p>/g, '$1')

  // Step 5: Restore protected code blocks
  protectedBlocks.forEach(({ placeholder, content }) => {
    html = html.replace(placeholder, content)
  })

  return html
}

// Copy functionality is now handled via event delegation in BlogPost component