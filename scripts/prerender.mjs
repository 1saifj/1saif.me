// Renders every route to static HTML after `vite build`, so each page paints before JavaScript runs
// and crawlers see real content. Uses React's server renderer; no browser is needed.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const dist = path.join(root, process.argv[2] || 'dist')

const ssrOut = path.join(root, 'node_modules/.cache/prerender')

// .mjs, because package.json has no "type": "module" and Node before 22 reads a .js file as CommonJS.
await build({ root, logLevel: 'warn', ssr: { noExternal: ['react-helmet-async'] }, build: { ssr: 'src/entry-server.tsx', outDir: ssrOut, emptyOutDir: true, minify: false, copyPublicDir: false, rollupOptions: { output: { entryFileNames: 'entry-server.mjs', chunkFileNames: '[name].mjs' } } } })

const { prepare, render, routes } = await import(path.join(ssrOut, 'entry-server.mjs'))

const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')

// Each page brings its own title and meta through Helmet, so the template's defaults are removed.
const base = template
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/\s*<meta (name|property)="(description|title|keywords|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '')

// Inner pages need the route stylesheet in the HTML itself, or they paint unstyled until JavaScript
// loads it. The home page keeps its inline styles only. Vite's loader skips a stylesheet already linked.
const css = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^index-.*\.css$/.test(name))

if (!css) throw new Error('route stylesheet assets/index-*.css not found')

const stylesheet = `<link rel="stylesheet" href="/assets/${css}">`

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
    .replace('</head>', `${head}\n${home ? '' : stylesheet}\n</head>`)
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

console.log(`prerendered ${routes.length} routes + 2 404 pages`)
