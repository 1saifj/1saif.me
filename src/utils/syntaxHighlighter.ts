import { codeToHtml } from 'shiki'

// Language mappings to normalize different language names to Shiki's expected format
const languageMapping: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'rb': 'ruby',
  'sh': 'bash',
  'shell': 'bash',
  'zsh': 'bash',
  'dockerfile': 'docker',
  'yml': 'yaml',
  'proto': 'protobuf',
  'protobuf': 'proto',
  'md': 'markdown',
  'txt': 'text',
  'plain': 'text',
}

// Get the correct language identifier for Shiki
const normalizeLanguage = (lang: string): string => {
  const normalized = lang.toLowerCase().trim()
  return languageMapping[normalized] || normalized
}

// Check if a language is supported by Shiki
export const isLanguageAvailable = (lang: string): boolean => {
  const normalizedLang = normalizeLanguage(lang)
  
  // List of languages definitely supported by Shiki (based on documentation)
  const supportedLanguages = [
    'abap', 'actionscript-3', 'ada', 'angular-html', 'angular-ts', 'apache', 'apex', 'apl',
    'applescript', 'ara', 'asciidoc', 'asm', 'astro', 'awk', 'ballerina', 'bat', 'beancount',
    'berry', 'bibtex', 'bicep', 'blade', 'bsl', 'c', 'cadence', 'cairo', 'clarity', 'clojure',
    'cmake', 'cobol', 'codeowners', 'codeql', 'coffee', 'common-lisp', 'coq', 'cpp', 'crystal',
    'csharp', 'css', 'csv', 'cue', 'cypher', 'd', 'dart', 'dax', 'desktop', 'diff', 'docker',
    'dotenv', 'dream-maker', 'edge', 'elixir', 'elm', 'emacs-lisp', 'erb', 'erlang', 'fennel',
    'fish', 'fluent', 'fortran-fixed-form', 'fortran-free-form', 'fsharp', 'gdresource',
    'gdscript', 'gdshader', 'genie', 'gherkin', 'git-commit', 'git-rebase', 'gleam', 'glimmer-js',
    'glimmer-ts', 'glsl', 'gnuplot', 'go', 'graphql', 'groovy', 'hack', 'haml', 'handlebars',
    'haskell', 'haxe', 'hcl', 'hjson', 'hlsl', 'html', 'html-derivative', 'http', 'hxml', 'hy',
    'imba', 'ini', 'java', 'javascript', 'jinja', 'jison', 'json', 'json5', 'jsonc', 'jsonl',
    'jsonnet', 'jssm', 'jsx', 'julia', 'kotlin', 'kusto', 'latex', 'lean', 'less', 'liquid',
    'llvm', 'log', 'logo', 'lua', 'luau', 'make', 'markdown', 'marko', 'matlab', 'mdc', 'mdx',
    'mermaid', 'mipsasm', 'mojo', 'move', 'narrat', 'nextflow', 'nginx', 'nim', 'nix', 'nushell',
    'objective-c', 'objective-cpp', 'ocaml', 'pascal', 'perl', 'php', 'plsql', 'po', 'polar',
    'postcss', 'powerquery', 'powershell', 'prisma', 'prolog', 'proto', 'pug', 'puppet',
    'purescript', 'python', 'qml', 'qmldir', 'qss', 'r', 'racket', 'raku', 'razor', 'reg',
    'regexp', 'rel', 'riscv', 'rst', 'ruby', 'rust', 'sas', 'sass', 'scala', 'scheme', 'scss',
    'sdbl', 'shaderlab', 'shellscript', 'shellsession', 'smalltalk', 'solidity', 'soy', 'sparql',
    'splunk', 'sql', 'ssh-config', 'stata', 'stylus', 'svelte', 'swift', 'system-verilog',
    'systemd', 'talonscript', 'tasl', 'tcl', 'templ', 'terraform', 'tex', 'toml', 'ts-tags',
    'tsv', 'tsx', 'turtle', 'twig', 'typescript', 'typespec', 'typst', 'v', 'vala', 'vb',
    'verilog', 'vhdl', 'viml', 'vue', 'vue-html', 'vyper', 'wasm', 'wenyan', 'wgsl', 'wikitext',
    'wit', 'wolfram', 'xml', 'xsl', 'yaml', 'zenscript', 'zig', 'text', 'ansi'
  ]
  
  return supportedLanguages.includes(normalizedLang)
}

// Get a human-readable label for the language
export const getLanguageLabel = (lang: string): string => {
  const labels: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'csharp': 'C#',
    'cpp': 'C++',
    'go': 'Go',
    'rust': 'Rust',
    'php': 'PHP',
    'ruby': 'Ruby',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'scala': 'Scala',
    'haskell': 'Haskell',
    'clojure': 'Clojure',
    'elixir': 'Elixir',
    'erlang': 'Erlang',
    'fsharp': 'F#',
    'ocaml': 'OCaml',
    'jsx': 'JSX',
    'tsx': 'TSX',
    'vue': 'Vue',
    'svelte': 'Svelte',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    'stylus': 'Stylus',
    'json': 'JSON',
    'yaml': 'YAML',
    'toml': 'TOML',
    'xml': 'XML',
    'markdown': 'Markdown',
    'bash': 'Bash',
    'shellscript': 'Shell',
    'powershell': 'PowerShell',
    'sql': 'SQL',
    'docker': 'Dockerfile',
    'proto': 'Protocol Buffers',
    'graphql': 'GraphQL',
    'text': 'Plain Text',
    'dockerfile': 'Dockerfile',
    'protobuf': 'Protocol Buffers',
  }
  
  const normalizedLang = normalizeLanguage(lang)
  return labels[normalizedLang] || lang.toUpperCase()
}

// Main syntax highlighting function using Shiki
export const highlightCode = async (code: string, language: string): Promise<string> => {
  try {
    const normalizedLang = normalizeLanguage(language)
    
    // Check if language is supported
    if (!isLanguageAvailable(normalizedLang)) {
      console.warn(`Language '${language}' (normalized: '${normalizedLang}') is not available in Shiki. Falling back to plain text.`)
      return await codeToHtml(code, {
        lang: 'text',
        theme: 'vitesse-dark'
      })
    }
    
    // Use Shiki to highlight the code
    const highlighted = await codeToHtml(code, {
      lang: normalizedLang,
      theme: 'vitesse-dark' // Using a modern, VS Code-like theme
    })
    
    return highlighted
  } catch (error) {
    console.error(`Failed to highlight code for language: ${language}`, error)
    
    // Fallback to plain text if highlighting fails
    try {
      return await codeToHtml(code, {
        lang: 'text',
        theme: 'vitesse-dark'
      })
    } catch (fallbackError) {
      console.error('Failed to highlight as plain text:', fallbackError)
      // Last resort: return escaped HTML
      return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    }
  }
}

// Synchronous version for cases where async isn't available (fallback only)
export const highlightCodeSync = (code: string, language: string): string => {
  console.warn('Synchronous highlighting not recommended with Shiki. Use highlightCode instead.')
  // Return basic escaped HTML as fallback
  return `<pre><code class="language-${language}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
}

// Export commonly used themes for potential customization
export const themes = {
  dark: 'vitesse-dark',
  light: 'vitesse-light',
  github: 'github-dark',
  githubLight: 'github-light',
  nord: 'nord',
  dracula: 'dracula',
  monokai: 'monokai',
  oneDark: 'one-dark-pro',
} as const

// Helper function to get available themes
export const getAvailableThemes = (): string[] => {
  return Object.values(themes)
}

// Debug function for development
export const testLanguageSupport = async (language: string): Promise<void> => {
  console.log(`Testing language support for: ${language}`)
  console.log(`Normalized: ${normalizeLanguage(language)}`)
  console.log(`Available: ${isLanguageAvailable(language)}`)
  console.log(`Label: ${getLanguageLabel(language)}`)
  
  const testCode = `// Test code for ${language}\nconsole.log("Hello, World!");`
  
  try {
    const result = await highlightCode(testCode, language)
    console.log(`Highlighting successful for ${language}`)
    console.log('Result length:', result.length)
  } catch (error) {
    console.error(`Highlighting failed for ${language}:`, error)
  }
}

// Make test function available globally for debugging (development only)
if (typeof window !== 'undefined') {
  (window as any).testLanguageSupport = testLanguageSupport;
  (window as any).highlightCode = highlightCode;
  (window as any).isLanguageAvailable = isLanguageAvailable;
}