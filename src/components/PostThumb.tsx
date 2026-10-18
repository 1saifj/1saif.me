import React from 'react'

// Small WebP figure generated from the post's featured image (public/articles/thumbs).
export const PostThumb: React.FC<{ src?: string }> = ({ src }) => {
  if (!src) return null
  const name = src.split('/').pop()?.replace(/\.\w+$/, '')

  return <img className="notebook-post-thumb" src={`/articles/thumbs/${name}.webp`} alt="" width="192" height="128" loading="lazy" decoding="async" />
}
