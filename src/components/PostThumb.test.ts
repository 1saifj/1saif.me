// @vitest-environment node
import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { publishedBlogs } from '../data/blogs'

// PostThumb asks for <name>.webp and <name>-144.webp; a missing file shows as a broken image.
describe('post thumbnails', () => {
  it('exist in both sizes for every published post with a featured image', () => {
    const missing = publishedBlogs
      .flatMap(post => {
        const name = post.featuredImage?.split('/').pop()?.replace(/\.\w+$/, '')

        return name ? [`${name}.webp`, `${name}-144.webp`] : []
      })
      .filter(file => !existsSync(`public/articles/thumbs/${file}`))

    expect(missing).toEqual([])
  })
})
