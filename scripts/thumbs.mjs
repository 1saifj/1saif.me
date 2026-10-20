// Builds the post thumbnails PostThumb asks for: public/articles/thumbs/<name>.webp (384x256)
// and <name>-144.webp (144x96), both 3:2. Uses the cwebp CLI, so no image library is needed.
//   npm run thumbs -- agent_ripgrep_feat.jpg   one image, by name or by path
//   npm run thumbs -- --missing                every featured image whose thumbnails are missing
// Existing files are kept unless you pass --force. Install cwebp with "brew install webp" (macOS)
// or "apt-get install webp".
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const publicDir = path.join(root, 'public')

const articlesDir = path.join(publicDir, 'articles')

const thumbsDir = path.join(articlesDir, 'thumbs')

const contentDir = path.join(root, 'content/articles')

const sizes = [
  { suffix: '', width: 384, height: 256 },
  { suffix: '-144', width: 144, height: 96 },
]

const argv = process.argv.slice(2)

const targets = argv.filter(arg => !arg.startsWith('--'))

const force = argv.includes('--force')

const missingOnly = argv.includes('--missing')

function fail(message) {
  console.error(message)
  process.exit(1)
}

function even(value) {
  return Math.floor(value / 2) * 2
}

/** Reads a JPEG SOF or PNG IHDR header; the featured images use only those two formats. */
function imageSize(file) {
  const data = fs.readFileSync(file)
  const isPng = data.toString('latin1', 1, 4) === 'PNG'

  if (isPng) {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
  }

  let offset = 2

  while (offset + 9 < data.length) {
    const isMarker = data[offset] === 0xff && data[offset + 1] !== 0xff
    const marker = isMarker ? data[offset + 1] : -1
    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc

    if (isFrame) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) }
    }

    offset += isMarker ? 2 + data.readUInt16BE(offset + 2) : 1
  }

  return null
}

/** cwebp crops before it resizes, so cut the 3:2 window out first, then scale it down. */
function cropFor(size) {
  const tooWide = size.width * 2 > size.height * 3
  const tooTall = size.height * 2 > size.width * 3

  if (!tooWide && !tooTall) {
    return null
  }

  const width = tooWide ? Math.max(2, even(size.height * 1.5)) : size.width
  const height = tooWide ? size.height : Math.max(2, even(size.width / 1.5))

  return { x: even((size.width - width) / 2), y: even((size.height - height) / 2), width, height }
}

function encode(source, target, size, crop) {
  const args = ['-q', '82', '-m', '6']

  if (crop) {
    args.push('-crop', `${crop.x}`, `${crop.y}`, `${crop.width}`, `${crop.height}`)
  }

  args.push('-resize', `${size.width}`, `${size.height}`, source, '-o', target)
  const result = spawnSync('cwebp', args, { encoding: 'utf8' })

  if (result.error) {
    fail('cwebp is missing. Install it with "brew install webp" (macOS) or "apt-get install webp".')
  }

  if (result.status !== 0) {
    fail(`cwebp failed on ${source}:\n${result.stderr.trim()}`)
  }
}

function resolveSource(arg) {
  const candidates = [path.resolve(arg), path.join(articlesDir, arg), path.join(publicDir, arg.replace(/^\//, ''))]
  const found = candidates.find(file => fs.existsSync(file) && fs.statSync(file).isFile())

  if (!found) {
    fail(`no image at ${arg}`)
  }

  return found
}

/** Writes both sizes, skipping the ones that already exist unless --force is set. */
function thumbsFor(source) {
  const size = imageSize(source)

  if (size === null) {
    fail(`${source} is not a JPEG or PNG`)
  }

  const name = path.basename(source, path.extname(source))
  const crop = cropFor(size)
  const written = []

  for (const target of sizes) {
    const file = path.join(thumbsDir, `${name}${target.suffix}.webp`)

    if (fs.existsSync(file) && !force) {
      continue
    }

    encode(source, file, target, crop)
    written.push(path.relative(root, file))
  }

  return written
}

function featuredImages() {
  const images = []

  for (const file of fs.readdirSync(contentDir)) {
    if (!file.endsWith('.md')) {
      continue
    }

    const text = fs.readFileSync(path.join(contentDir, file), 'utf8')
    const match = /^featuredImage:\s*"([^"]+)"/m.exec(text)

    if (match) {
      images.push(path.join(publicDir, match[1].replace(/^\//, '')))
    }
  }

  return images
}

function missingThumbs(images) {
  return images.filter(image => {
    const name = path.basename(image, path.extname(image))

    return sizes.some(size => !fs.existsSync(path.join(thumbsDir, `${name}${size.suffix}.webp`)))
  })
}

function runMissing() {
  const images = featuredImages()
  const todo = missingThumbs(images)

  if (todo.length === 0) {
    console.log(`all ${images.length} featured images have both thumbnails; nothing to do`)

    return
  }

  for (const image of todo) {
    const written = thumbsFor(image)

    if (written.length === 0) {
      console.log(`${image} already has both thumbnails; pass --force to rebuild them`)
    } else {
      console.log(`wrote ${written.join(', ')}`)
    }
  }
}

if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true })
}

if (missingOnly) {
  runMissing()
} else if (targets.length === 0) {
  console.log('usage: npm run thumbs -- <image>.jpg [--force] | npm run thumbs -- --missing')
  process.exit(1)
} else {
  for (const target of targets) {
    const written = thumbsFor(resolveSource(target))

    if (written.length === 0) {
      console.log(`${target} already has both thumbnails; pass --force to rebuild them`)
    } else {
      console.log(`wrote ${written.join(', ')}`)
    }
  }
}
