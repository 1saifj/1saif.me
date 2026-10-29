import type { HighlighterCore } from 'shiki/core'

// Only the grammars the posts use, and the JavaScript regex engine instead of the Oniguruma WebAssembly build.
const languages = {
  go: () => import('@shikijs/langs/go'),
  typescript: () => import('@shikijs/langs/typescript'),
  tsx: () => import('@shikijs/langs/tsx'),
  javascript: () => import('@shikijs/langs/javascript'),
  dart: () => import('@shikijs/langs/dart'),
  bash: () => import('@shikijs/langs/bash'),
  sql: () => import('@shikijs/langs/sql'),
  yaml: () => import('@shikijs/langs/yaml'),
  json: () => import('@shikijs/langs/json'),
  python: () => import('@shikijs/langs/python'),
  docker: () => import('@shikijs/langs/docker'),
  xml: () => import('@shikijs/langs/xml'),
  proto: () => import('@shikijs/langs/proto'),
  properties: () => import('@shikijs/langs/properties'),
  nginx: () => import('@shikijs/langs/nginx'),
  toml: () => import('@shikijs/langs/toml'),
  ini: () => import('@shikijs/langs/ini'),
  http: () => import('@shikijs/langs/http'),
} as const

type Language = keyof typeof languages

const aliases = new Map<string, Language>([['js', 'javascript'], ['ts', 'typescript'], ['sh', 'bash'], ['shell', 'bash'], ['zsh', 'bash'], ['dockerfile', 'docker'], ['yml', 'yaml'], ['protobuf', 'proto']])

const labels = {
  go: 'Go', typescript: 'TypeScript', tsx: 'TSX', javascript: 'JavaScript', dart: 'Dart', bash: 'Bash', sql: 'SQL', yaml: 'YAML', json: 'JSON',
  python: 'Python', docker: 'Dockerfile', xml: 'XML', proto: 'Protobuf', properties: 'Properties', nginx: 'Nginx', toml: 'TOML', ini: 'INI', http: 'HTTP',
} satisfies Record<Language, string>

const resolve = (lang: string): Language | undefined => {
  const key = lang.toLowerCase().trim()

  // SAFETY: an own-property check proves key names one of the loaders in `languages`; `in` would also pass 'constructor'.
  return Object.prototype.hasOwnProperty.call(languages, key) ? key as Language : aliases.get(key)
}

export const getLanguageLabel = (lang: string): string => {
  const resolved = resolve(lang)

  return resolved ? labels[resolved] : 'Plain text'
}

let highlighter: Promise<HighlighterCore> | undefined

// Both themes go into CSS variables (--shiki-light / --shiki-dark); index.css picks one from the site theme.
const getHighlighter = () => highlighter ??= Promise.all([import('shiki/core'), import('shiki/engine/javascript')]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
  createHighlighterCore({
    themes: [import('@shikijs/themes/github-light-default'), import('@shikijs/themes/github-dark-default')],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  }))

export const highlightCode = async (code: string, language: string): Promise<string> => {
  const shiki = await getHighlighter()
  const lang = resolve(language)

  if (lang && !shiki.getLoadedLanguages().includes(lang)) await shiki.loadLanguage(languages[lang]())

  return shiki.codeToHtml(code, { lang: lang ?? 'text', themes: { light: 'github-light-default', dark: 'github-dark-default' }, defaultColor: false })
}
