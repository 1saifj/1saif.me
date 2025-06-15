import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Import comprehensive language definitions
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
  'svg': 'markup'
}

export const highlightCode = (code: string, language: string = ''): string => {
  if (!code.trim()) return code

  // Normalize language name
  const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase()
  
  // Check if language is supported
  if (!normalizedLang || !Prism.languages[normalizedLang]) {
    // Fallback to plain text with basic formatting
    return `<pre class="language-text"><code class="text-slate-300">${escapeHtml(code)}</code></pre>`
  }

  try {
    const highlighted = Prism.highlight(code, Prism.languages[normalizedLang], normalizedLang)
    return `<pre class="language-${normalizedLang}"><code class="language-${normalizedLang}">${highlighted}</code></pre>`
  } catch (error) {
    console.warn(`Failed to highlight code for language: ${normalizedLang}`, error)
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