import React from 'react'

// Small WebP figure generated from the post's featured image (public/articles/thumbs).
export const PostThumb: React.FC<{ src?: string }> = ({ src }) => {
  if (!src) return null
  const name = src.split('/').pop()?.replace(/\.\w+$/, '')

  return <img className="notebook-post-thumb" src={`/articles/thumbs/${name}.webp`} srcSet={`/articles/thumbs/${name}-144.webp 144w, /articles/thumbs/${name}.webp 384w`} sizes="144px" alt="" width="144" height="96" loading="lazy" decoding="async" />
}
