import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Import core languages first
import 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'

// Import comprehensive language definitions in order of dependencies
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-haskell'
import 'prismjs/components/prism-ocaml'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-swift'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-scala'
import 'prismjs/components/prism-dart'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-less'
import 'prismjs/components/prism-stylus'
import 'prismjs/components/prism-xml-doc'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-nginx'
import 'prismjs/components/prism-apacheconf'
import 'prismjs/components/prism-ini'
import 'prismjs/components/prism-toml'
import 'prismjs/components/prism-graphql'
import 'prismjs/components/prism-regex'

// Ensure Prism is initialized with proper manual configuration
Prism.manual = true

// Initialize language checker after imports
const initializeLanguages = () => {
  // Force re-initialization of Go language if it's not properly loaded
  if (!Prism.languages.go || typeof Prism.languages.go !== 'object') {
    console.warn('Go language not properly loaded, attempting manual initialization')
    
    // Manual Go language definition as fallback
    Prism.languages.go = Prism.languages.extend('clike', {
      'string': {
        pattern: /(^|[^\\])"(?:\\.|[^"\\])*"/,
        lookbehind: true,
        greedy: true
      },
      'keyword': /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
      'boolean': /\b(?:_|true|false|iota|nil)\b/,
      'number': /(?:\b0x[a-f\d]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[-+]?\d+)?)i?/i,
      'operator': /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,
      'builtin': /\b(?:bool|byte|complex(?:64|128)|error|float(?:32|64)|rune|string|u?int(?:8|16|32|64)?|uintptr|append|cap|close|complex|copy|delete|imag|len|make|new|panic|print(?:ln)?|real|recover)\b/
    })
  }
}

// Initialize languages on module load
initializeLanguages()

// Comprehensive language mapping for common aliases
const languageMap: Record<string, string> = {
  'ts': 'typescript',
  'js': 'javascript',
  'jsx': 'jsx',
  'tsx': 'tsx',
  'rs': 'rust',
  'hs': 'haskell',
  'ml': 'ocaml',
  'sh': 'bash',
  'shell': 'bash',
  'yml': 'yaml',
  'md': 'markdown',
  'py': 'python',
  'rb': 'ruby',
  'cs': 'csharp',
  'cpp': 'cpp',
  'c++': 'cpp',
  'kt': 'kotlin',
  'dockerfile': 'docker',
  'conf': 'nginx',
  'config': 'ini',
  'gql': 'graphql',
  'html': 'markup',
  'xml': 'markup',
  'svg': 'markup',
  'golang': 'go'
}

// Function to safely check if a language is available
const isLanguageAvailable = (language: string): boolean => {
  try {
    const langDef = Prism.languages[language]
    return !!(langDef && typeof langDef === 'object')
  } catch (error) {
    console.warn(`Error checking language availability for: ${language}`, error)
    return false
  }
}

// Function to safely highlight code with robust error handling
export const highlightCode = (code: string, language: string = ''): string => {
  if (!code.trim()) return code

  // Normalize language name
  const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase()
  
  // Special handling for Go language
  if (normalizedLang === 'go') {
    // Ensure Go language is properly initialized
    if (!isLanguageAvailable('go')) {
      console.warn('Go language not available, reinitializing...')
      initializeLanguages()
    }
  }
  
  // Enhanced safety check with language availability verification
  if (!normalizedLang || !isLanguageAvailable(normalizedLang)) {
    console.warn(`Language '${language}' (normalized: '${normalizedLang}') is not available.`)
    console.warn('Available languages:', Object.keys(Prism.languages))
    return `<pre class="language-text"><code class="text-slate-300">${escapeHtml(code)}</code></pre>`
  }

  try {
    // Additional safety check before highlighting
    const languageGrammar = Prism.languages[normalizedLang]
    if (!languageGrammar || typeof languageGrammar !== 'object') {
      throw new Error(`Invalid language grammar for: ${normalizedLang}`)
    }

    const highlighted = Prism.highlight(code, languageGrammar, normalizedLang)
    return `<pre class="language-${normalizedLang}"><code class="language-${normalizedLang}">${highlighted}</code></pre>`
  } catch (error) {
    console.warn(`Failed to highlight code for language: ${normalizedLang}`, error)
    console.warn('Falling back to plain text highlighting')
    return `<pre class="language-text"><code class="text-slate-300">${escapeHtml(code)}</code></pre>`
  }
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export const getLanguageLabel = (language: string): string => {
  const labels: Record<string, string> = {
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'jsx': 'React JSX',
    'tsx': 'React TSX',
    'rust': 'Rust',
    'go': 'Go',
    'haskell': 'Haskell',
    'ocaml': 'OCaml',
    'json': 'JSON',
    'bash': 'Bash',
    'sql': 'SQL',
    'yaml': 'YAML',
    'markdown': 'Markdown',
    'css': 'CSS',
    'scss': 'SCSS',
    'less': 'Less',
    'stylus': 'Stylus',
    'markup': 'HTML',
    'python': 'Python',
    'java': 'Java',
    'c': 'C',
    'cpp': 'C++',
    'csharp': 'C#',
    'php': 'PHP',
    'ruby': 'Ruby',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'scala': 'Scala',
    'dart': 'Dart',
    'docker': 'Docker',
    'nginx': 'Nginx',
    'apache': 'Apache',
    'ini': 'Configuration',
    'toml': 'TOML',
    'graphql': 'GraphQL',
    'regex': 'Regular Expression',
    'text': 'Plain Text'
  }
  
  const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase()
  return labels[normalizedLang] || language.toUpperCase()
}

// Debug function to log available languages (useful for development)
export const logAvailableLanguages = (): void => {
  console.log('Available Prism languages:', Object.keys(Prism.languages))
}

// Test function to verify Go language specifically
export const testGoLanguage = (): void => {
  console.log('Testing Go language support...')
  console.log('Go language available:', isLanguageAvailable('go'))
  console.log('Go language object:', Prism.languages.go)
  
  if (Prism.languages.go) {
    console.log('Go language properties:', Object.keys(Prism.languages.go))
  }
  
  // Test a simple Go code snippet
  const testCode = `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`
  
  try {
    const result = highlightCode(testCode, 'go')
    console.log('Go highlighting test successful:', result.length > 0)
  } catch (error) {
    console.error('Go highlighting test failed:', error)
  }
}

// Make test functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testGoLanguage = testGoLanguage;
  (window as any).logAvailableLanguages = logAvailableLanguages
}