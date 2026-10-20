// Renders the default social cards (1200x630, the size link previews use) with the site's own fonts and portrait.
// Run after changing the name, title or portrait: node scripts/og-card.mjs
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public')
// Inlined as data URLs: a page set with setContent cannot load file:// fonts or images.

const file = name => `data:${name.endsWith('.woff2') ? 'font/woff2' : 'image/webp'};base64,${fs.readFileSync(path.join(publicDir, name)).toString('base64')}`

const cards = [
  { out: 'og-card.jpg', dir: 'ltr', lang: 'en', font: 'Geist Sans', name: 'Saif Aljanahi', title: 'Lead Software Engineer', place: 'Al-Najaf, Iraq', line: 'Backend systems, the cloud infrastructure under them, and the web and mobile apps on top.' },
  { out: 'og-card-ar.jpg', dir: 'rtl', lang: 'ar', font: 'IBM Plex Sans Arabic', name: 'سيف الجناحي', title: 'قائد هندسة برمجيات', place: 'النجف، العراق', line: 'أنظمة خلفية، والبنية السحابية التي تعمل عليها، وتطبيقات الويب والأجهزة المحمولة.' },
]

const html = card => `<!doctype html><html lang="${card.lang}" dir="${card.dir}"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Geist Sans'; font-weight: 400; src: url('${file('fonts/geist-sans-400.woff2')}'); }
@font-face { font-family: 'Geist Sans'; font-weight: 600; src: url('${file('fonts/geist-sans-600.woff2')}'); }
@font-face { font-family: 'IBM Plex Sans Arabic'; font-weight: 400; src: url('${file('fonts/plex-arabic-400.woff2')}'); }
@font-face { font-family: 'IBM Plex Sans Arabic'; font-weight: 600; src: url('${file('fonts/plex-arabic-600.woff2')}'); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; display: grid; grid-template-columns: 1fr 336px; gap: 64px; align-items: center; padding: 0 80px; background: #fff; color: #10161d; font-family: '${card.font}', 'Geist Sans', sans-serif; }
.copy { display: grid; gap: 18px; }
h1 { font-size: ${card.lang === 'ar' ? 78 : 76}px; font-weight: 600; letter-spacing: ${card.lang === 'ar' ? 0 : '-.03em'}; line-height: ${card.lang === 'ar' ? 1.25 : 1.05}; }
.title { color: #0a66c2; font-size: 30px; font-weight: 600; }
.place { color: #5b6875; font-size: 24px; }
.line { max-width: 620px; margin-top: 10px; color: #46525e; font-size: 26px; line-height: ${card.lang === 'ar' ? 1.7 : 1.45}; }
.site { margin-top: 26px; padding-top: 22px; border-top: 1px solid #e3e8ee; font-family: 'Geist Sans', sans-serif; font-size: 26px; font-weight: 600; direction: ltr; text-align: ${card.dir === 'rtl' ? 'right' : 'left'}; }
.site span { color: #0a66c2; }
img { width: 336px; height: 420px; border-radius: 14px; object-fit: cover; outline: 1px solid rgba(16, 22, 29, .1); outline-offset: -1px; }
</style></head><body>
<div class="copy"><h1>${card.name}</h1><p class="title">${card.title}</p><p class="place">${card.place}</p><p class="line">${card.line}</p><p class="site">1saif<span>.</span>me</p></div>
<img src="${file('sj_image.webp')}" alt="">
</body></html>`

const browser = await chromium.launch({ channel: 'chrome' })

const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })

for (const card of cards) {
  await page.setContent(html(card), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: path.join(publicDir, card.out), type: 'jpeg', quality: 86 })
  console.log('wrote', card.out)
}

await browser.close()
