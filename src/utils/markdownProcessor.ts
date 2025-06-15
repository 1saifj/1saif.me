import { highlightCode, getLanguageLabel } from './syntaxHighlighter'

export const convertMarkdownToHtml = (markdown: string): string => {
  return markdown
    // Enhanced Headers with better styling, IDs, and table of contents support
    .replace(/^#### (.*$)/gim, (match, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h4 id="${id}" class="text-xl font-bold text-slate-900 mb-3 mt-8 pb-2 border-b border-slate-100 scroll-mt-24 hover:text-blue-600 transition-colors cursor-pointer">${title}</h4>`
    })
    .replace(/^### (.*$)/gim, (match, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h3 id="${id}" class="text-2xl font-bold text-slate-900 mb-4 mt-10 pb-2 border-b border-slate-200 scroll-mt-24 hover:text-blue-600 transition-colors cursor-pointer">${title}</h3>`
    })
    .replace(/^## (.*$)/gim, (match, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h2 id="${id}" class="text-3xl font-bold text-slate-900 mb-6 mt-12 pb-3 border-b-2 border-slate-300 scroll-mt-24 hover:text-blue-600 transition-colors cursor-pointer">${title}</h2>`
    })
    .replace(/^# (.*$)/gim, (match, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h1 id="${id}" class="text-4xl font-bold text-slate-900 mb-8 mt-16 pb-4 border-b-2 border-slate-400 scroll-mt-24 hover:text-blue-600 transition-colors cursor-pointer">${title}</h1>`
    })
    
    // Enhanced code blocks with professional syntax highlighting and copy functionality
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const lang = language || 'text'
      const languageLabel = getLanguageLabel(lang)
      const highlightedCode = highlightCode(code.trim(), lang)
      const codeId = Math.random().toString(36).substr(2, 9)
      
      return `<div class="code-block-container my-8 not-prose group">
        <div class="code-block-header bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between rounded-t-xl border-b border-slate-600 shadow-lg">
          <div class="flex items-center space-x-3">
            <div class="flex space-x-2">
              <div class="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
              <div class="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            </div>
            <span class="text-slate-200 text-sm font-semibold tracking-wide ml-4">${languageLabel}</span>
          </div>
          <button 
            onclick="copyCodeToClipboard('${codeId}')" 
            class="copy-btn opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
            title="Copy code to clipboard"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <div class="code-block-content bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-b-xl overflow-hidden shadow-2xl border border-slate-700">
          <div class="p-6 overflow-x-auto">
            <pre id="${codeId}" class="text-sm leading-relaxed font-mono">${highlightedCode.replace(/<pre[^>]*>/, '').replace(/<\/pre>$/, '')}</pre>
          </div>
        </div>
      </div>`
    })
    
    // Enhanced tables with professional styling
    .replace(/\|(.+)\|\n\|[-\s|:]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
      const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell)
      const rowData = rows.trim().split('\n').map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      )
      
      const headerHtml = headerCells.map(cell => 
        `<th class="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 bg-slate-50">${cell}</th>`
      ).join('')
      
      const rowsHtml = rowData.map((row, index) => 
        `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors duration-150">
          ${row.map(cell => `<td class="px-6 py-4 text-sm text-slate-700 border-b border-slate-200">${cell}</td>`).join('')}
        </tr>`
      ).join('')
      
      return `<div class="table-container my-8 not-prose overflow-hidden rounded-xl shadow-lg border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-gradient-to-r from-slate-100 to-slate-50">
              <tr>${headerHtml}</tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>`
    })
    
    // Enhanced inline code with better styling
    .replace(/`([^`]+)`/g, '<code class="inline-code bg-gradient-to-r from-slate-100 to-slate-50 text-slate-800 px-2 py-1 rounded-md text-sm font-mono border border-slate-200 shadow-sm not-prose font-semibold">$1</code>')
    
    // Enhanced text formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 bg-yellow-100 px-1 rounded">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 font-medium">$1</em>')
    
    // Enhanced links with better styling
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-500 underline decoration-2 underline-offset-2 hover:decoration-blue-500 transition-all duration-200 font-semibold hover:bg-blue-50 px-1 rounded" target="_blank" rel="noopener noreferrer">$1 <svg class="inline w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
    
    // Enhanced blockquotes with better styling
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-6 py-4 my-6 bg-gradient-to-r from-blue-50 to-cyan-50 text-slate-700 italic rounded-r-lg shadow-md not-prose relative"><div class="absolute top-2 left-2 text-blue-400 opacity-50 text-2xl">"</div>$1</blockquote>')
    
    // Enhanced lists with better styling
    .replace(/^\* (.*$)/gim, '<li class="text-slate-700 mb-3 flex items-start"><span class="text-blue-500 mr-3 mt-1">•</span><span>$1</span></li>')
    .replace(/^- (.*$)/gim, '<li class="text-slate-700 mb-3 flex items-start"><span class="text-blue-500 mr-3 mt-1">•</span><span>$1</span></li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="text-slate-700 mb-3 flex items-start"><span class="text-blue-500 mr-3 mt-1 font-semibold">•</span><span>$1</span></li>')
    
    // Process paragraphs with enhanced styling
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim() === '') return ''
      if (paragraph.includes('<h1') || paragraph.includes('<h2') || paragraph.includes('<h3') || paragraph.includes('<h4') ||
          paragraph.includes('<div class="code-block-container') || paragraph.includes('<blockquote') ||
          paragraph.includes('<li') || paragraph.includes('<div class="table-container')) {
        return paragraph
      }
      return `<p class="text-slate-700 leading-relaxed mb-6 text-lg tracking-wide">${paragraph.replace(/\n/g, '<br>')}</p>`
    })
    .join('')
    // Wrap lists in proper ul tags with enhanced styling
    .replace(/(<li class="text-slate-700 mb-3 flex items-start">.*?<\/li>)/gs, '<ul class="list-none mb-8 space-y-2 ml-0 not-prose bg-white rounded-lg p-6 shadow-sm border border-slate-100">$1</ul>')
}

// Add copy functionality script
if (typeof window !== 'undefined') {
  (window as any).copyCodeToClipboard = (codeId: string) => {
    const codeElement = document.getElementById(codeId)
    if (codeElement) {
      const text = codeElement.textContent || ''
      navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const button = codeElement.closest('.code-block-container')?.querySelector('.copy-btn')
        if (button) {
          const originalText = button.innerHTML
          button.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg><span>Copied!</span>`
          button.classList.add('bg-green-600', 'hover:bg-green-700')
          button.classList.remove('bg-slate-600', 'hover:bg-slate-500')
          setTimeout(() => {
            button.innerHTML = originalText
            button.classList.remove('bg-green-600', 'hover:bg-green-700')
            button.classList.add('bg-slate-600', 'hover:bg-slate-500')
          }, 2000)
        }
      })
    }
  }
}