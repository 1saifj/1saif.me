import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  noIndex?: boolean
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Saif Aljanahi - Full-Stack Engineer',
  description = 'Professional portfolio of Saif Aljanahi, Full-Stack Engineer specializing in Golang, Python, and Flutter development. Experienced in building scalable web applications and mobile solutions.',
  image = '/sj_image.jpeg',
  url = 'https://1saif.me',
  type = 'website',
  author = 'Saif Aljanahi',
  publishedTime,
  modifiedTime,
  tags = [],
  noIndex = false
}) => {
  const fullTitle = title.includes('Saif Aljanahi') ? title : `${title} | Saif Aljanahi`
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`
  const fullUrl = url

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph (Facebook) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Saif Aljanahi Portfolio" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@saifaljanahi" />
      <meta name="twitter:site" content="@saifaljanahi" />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? 'Article' : 'WebSite',
          "name": fullTitle,
          "description": description,
          "url": fullUrl,
          "image": fullImageUrl,
          ...(type === 'website' ? {
            "author": {
              "@type": "Person",
              "name": author,
              "url": url,
              "jobTitle": "Full-Stack Engineer",
              "worksFor": {
                "@type": "Organization",
                "name": "Freelance"
              }
            }
          } : {
            "author": {
              "@type": "Person",
              "name": author
            },
            "publisher": {
              "@type": "Person",
              "name": author
            },
            ...(publishedTime && { "datePublished": publishedTime }),
            ...(modifiedTime && { "dateModified": modifiedTime })
          })
        })}
      </script>
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="classification" content="portfolio" />
      <meta name="category" content="technology" />
      <meta name="coverage" content="worldwide" />
      <meta name="distribution" content="global" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  )
}

export default SEOHead 