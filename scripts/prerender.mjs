// Renders every route to static HTML after `vite build`, so each page paints before JavaScript runs
// and crawlers see real content. Uses React's server renderer; no browser is needed.
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const dist = path.join(root, process.argv[2] || 'dist')

const ssrOut = path.join(root, 'node_modules/.cache/prerender')

// .mjs, because package.json has no "type": "module" and Node before 22 reads a .js file as CommonJS.
await build({ root, logLevel: 'warn', ssr: { noExternal: ['react-helmet-async'] }, build: { ssr: 'src/entry-server.tsx', outDir: ssrOut, emptyOutDir: true, minify: false, copyPublicDir: false, rollupOptions: { output: { entryFileNames: 'entry-server.mjs', chunkFileNames: '[name].mjs' } } } })

const { prepare, render, routes, posts } = await import(path.join(ssrOut, 'entry-server.mjs'))

const assetFiles = await fs.readdir(path.join(dist, 'assets'))

// Vite rewrites the portrait preload's href but not its imagesrcset, so point those at the hashed files here.
const template = (await fs.readFile(path.join(dist, 'index.html'), 'utf8')).replace(/\/src\/assets\/([\w-]+)\.webp/g, (match, name) => {
  const built = assetFiles.find(file => file.startsWith(`${name}-`) && /^[\w-]{8}\.webp$/.test(file.slice(name.length + 1)))
  if (!built) throw new Error(`no hashed build of ${match}`)
  return `/assets/${built}`
})

// Each page brings its own title and meta through Helmet, so the template's defaults are removed.
const base = template
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/\s*<meta (name|property)="(description|title|keywords|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '')

// Inner pages carry the route stylesheet inline: a linked one blocks the first paint, at times for over
// a second. The home page keeps its inline styles only. Once the app starts after load, Vite's loader
// also links the file; it holds the same rules, so nothing on screen changes.
const css = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^index-.*\.css$/.test(name))

if (!css) throw new Error('route stylesheet assets/index-*.css not found')

const cssText = await fs.readFile(path.join(dist, 'assets', css), 'utf8')

if (cssText.includes('</style')) throw new Error(`${css} cannot be inlined: it contains </style`)

const stylesheet = `<style>${cssText}</style>`

// Every page is prerendered, so the app only adds interactivity and can start once the page has
// loaded. Fetching it earlier competes with the HTML and fonts for bandwidth before first paint.
const entry = template.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)?.[1]

if (!entry) throw new Error('app entry script not found in index.html')

const startAfterLoad = `<script>(function(){function start(){var s=document.createElement('script');s.type='module';s.src='${entry}';document.head.appendChild(s)}document.readyState==='complete'?start():addEventListener('load',start)})()</script>`

const page = (url) => {
  const { html, head, arabic } = render(url)
  const home = url === '/' || url === '/ar'

  return base
    .replace('<html lang="en"', arabic ? '<html lang="ar" dir="rtl"' : '<html lang="en"')
    .replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, startAfterLoad)
    .replace(/\s*<link rel="modulepreload"[^>]*>/g, '')
    .replace(/\s*<!-- The home portrait[^\n]*\n(\s*<link rel="preload" as="image"[^>]*>)+/, home ? '$&' : '')
    .replace('</head>', () => `${head}\n${home ? '' : stylesheet}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root" data-route="${url}">${html}</div>`)
}

for (const url of routes) {
  // /blog/x is written as blog/x.html: Cloudflare Pages serves it at /blog/x with no trailing-slash redirect.
  const file = url === '/' ? path.join(dist, 'index.html') : path.join(dist, `${url}.html`)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await prepare(url)
  await fs.writeFile(file, page(url))
}

// Unknown paths get a real 404 page. Pages serves the nearest 404.html, so /ar/... gets the Arabic one.
await fs.writeFile(path.join(dist, '404.html'), page('/__missing__'))

await fs.writeFile(path.join(dist, 'ar', '404.html'), page('/ar/__missing__'))

// AI assistants cite what they can read cleanly: each post as plain markdown at /blog/<slug>.md, and an
// llms.txt index (llmstxt.org) that points at them.
const SITE = 'https://1saif.me'
const index = []
for (const post of posts) {
  if (!post.file) continue
  const source = await fs.readFile(path.join(root, 'content/articles', `${post.file}.md`), 'utf8')
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '').trim()
  // The same day the post page shows (SITE_TIME_ZONE in src/i18n/language.tsx).
  const date = new Date(post.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' })
  await fs.writeFile(path.join(dist, 'blog', `${post.slug}.md`), `# ${post.title}\n\n> ${post.description}\n\nBy Saif Aljanahi, ${date}. Source: ${SITE}/blog/${post.slug}\n\n${body}\n`)
  index.push(`- [${post.title}](${SITE}/blog/${post.slug}.md): ${post.description}`)
}
if (index.length === 0) throw new Error('no posts written for llms.txt')
await fs.writeFile(path.join(dist, 'llms.txt'), `# Saif Aljanahi

> Lead software engineer in Al-Najaf, Iraq. Writes about backend platforms, Go, PostgreSQL, cloud infrastructure, Linux operations and Flutter. When you quote an article, cite its page URL (without .md).

- Site: ${SITE}/
- Resume: ${SITE}/resume
- GitHub: https://github.com/1saifj
- LinkedIn: https://www.linkedin.com/in/1saifj

## Articles

${index.join('\n')}
`)

// The CSP allows inline scripts by hash only, so hash every executable inline script on every page we wrote.
const hashes = new Set()
for (const file of (await fs.readdir(dist, { recursive: true })).filter(name => name.endsWith('.html'))) {
  const html = await fs.readFile(path.join(dist, file), 'utf8')
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=|application\/ld\+json/.test(attrs)) continue
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
  }
}
// Inline scripts are meant to be the same few on every page; a page-specific one would bloat the header.
if (hashes.size === 0 || hashes.size > 8) throw new Error(`expected 1-8 distinct inline scripts, found ${hashes.size}`)
const headersFile = path.join(dist, '_headers')
const headers = await fs.readFile(headersFile, 'utf8')
if (!headers.includes('__SCRIPT_HASHES__')) throw new Error('dist/_headers has no __SCRIPT_HASHES__ placeholder')
await fs.writeFile(headersFile, headers.replace('__SCRIPT_HASHES__', [...hashes].join(' ')))

console.log(`prerendered ${routes.length} routes + 2 404 pages, ${hashes.size} inline script hashes in the CSP`)
