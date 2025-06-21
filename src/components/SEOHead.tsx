import React from 'react'
import { Helmet } from 'react-helmet-async'
import { getOptimizedImageUrl, ImagePresets } from '../utils/imageOptimization'

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
  siteName?: string
  locale?: string
  twitterUsername?: string
  category?: string
  section?: string
  readingTime?: number
  wordCount?: number
  canonicalUrl?: string
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
  noIndex = false,
  siteName = 'Saif Aljanahi Portfolio',
  locale = 'en_US',
  twitterUsername = '@saifaljanahi',
  category = 'technology',
  section,
  readingTime,
  wordCount,
  canonicalUrl
}) => {
  const fullTitle = title.includes('Saif Aljanahi') ? title : `${title} | Saif Aljanahi`
  const currentUrl = canonicalUrl || url || window.location.href
  
  // Enhanced image optimization for different social platforms with better Telegram support
  const getImageForPlatform = (platform: 'og' | 'twitter' | 'telegram' | 'telegram_preview') => {
    const baseImageUrl = image.startsWith('http') ? image : `${url}${image}`
    
    switch (platform) {
      case 'og': // Facebook, LinkedIn, general Open Graph
        return getOptimizedImageUrl(baseImageUrl, {
          width: 1200,
          height: 630,
          quality: 90,
          format: 'auto',
          fit: 'cover',
          gravity: 'auto'
        })
      case 'twitter':
        return getOptimizedImageUrl(baseImageUrl, {
          width: 1200,
          height: 675,
          quality: 90,
          format: 'auto',
          fit: 'cover',
          gravity: 'auto'
        })
      case 'telegram':
        // Telegram prefers higher quality images for better preview
        return getOptimizedImageUrl(baseImageUrl, {
          width: 1280,
          height: 720,
          quality: 95,
          format: 'webp', // Telegram supports WebP for better compression
          fit: 'cover',
          gravity: 'auto'
        })
      case 'telegram_preview':
        // Smaller preview image for faster loading in chat previews
        return getOptimizedImageUrl(baseImageUrl, {
          width: 640,
          height: 360,
          quality: 85,
          format: 'webp',
          fit: 'cover',
          gravity: 'auto'
        })
      default:
        return baseImageUrl
    }
  }

  const ogImage = getImageForPlatform('og')
  const twitterImage = getImageForPlatform('twitter')
  const telegramImage = getImageForPlatform('telegram')
  const telegramPreviewImage = getImageForPlatform('telegram_preview')

  // Enhanced structured data with better article support
  const generateStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "name": fullTitle,
      "description": description,
      "url": currentUrl,
      "image": {
        "@type": "ImageObject",
        "url": ogImage,
        "width": 1200,
        "height": 630,
        "caption": `${title} - ${author}`
      },
      "author": {
        "@type": "Person",
        "name": author,
        "url": url,
        "jobTitle": "Full-Stack Engineer",
        "image": `${url}/sj.png`,
        "sameAs": [
          "https://linkedin.com/in/saifaljanahi",
          "https://github.com/saifaljanahi",
          "https://twitter.com/saifaljanahi"
        ]
      }
    }

    if (type === 'article') {
      return {
        ...baseData,
        "@type": "Article",
        "headline": title,
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "publisher": {
          "@type": "Person",
          "name": author,
          "logo": {
            "@type": "ImageObject",
            "url": `${url}/sj.png`,
            "width": 512,
            "height": 512
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": currentUrl
        },
        "articleSection": section || category,
        "keywords": tags.join(', '),
        "inLanguage": "en-US",
        "isAccessibleForFree": true,
        "copyrightHolder": {
          "@type": "Person",
          "name": author
        },
        ...(wordCount && { "wordCount": wordCount }),
        ...(readingTime && { "timeRequired": `PT${readingTime}M` }),
        // Additional article properties for better SEO
        "genre": "Technology",
        "thumbnailUrl": telegramPreviewImage,
        "alternativeHeadline": description
      }
    }

    return {
      ...baseData,
      "@type": "WebSite",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${url}/blog?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  }

  // Generate additional structured data for better social media integration
  const generateBlogPostingSchema = () => {
    if (type !== 'article') return null
    
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": [telegramImage, ogImage, twitterImage],
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "author": {
        "@type": "Person",
        "name": author,
        "url": url
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${url}/sj.png`
        }
      },
      "mainEntityOfPage": currentUrl,
      "url": currentUrl,
      "isPartOf": {
        "@type": "Blog",
        "name": `${siteName} Blog`,
        "url": `${url}/blog`
      },
      "articleSection": section || category,
      "keywords": tags,
      "wordCount": wordCount,
      "timeRequired": readingTime ? `PT${readingTime}M` : undefined
    }
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Enhanced Meta Tags */}
      <meta name="keywords" content={tags.join(', ')} />
      <meta name="category" content={category} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="classification" content="portfolio" />
      <meta name="coverage" content="worldwide" />
      <meta name="distribution" content="global" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Enhanced Open Graph (Facebook, LinkedIn, Telegram, WhatsApp) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={`${title} - ${author}`} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:updated_time" content={modifiedTime || publishedTime} />
      
      {/* Enhanced Open Graph for Articles */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          <meta property="article:section" content={section || category} />
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime || publishedTime} />
          <meta property="article:expiration_time" content="" />
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
          {/* Additional article images for better social sharing */}
          <meta property="og:image" content={telegramImage} />
          <meta property="og:image:secure_url" content={telegramImage} />
          <meta property="og:image:width" content="1280" />
          <meta property="og:image:height" content="720" />
        </>
      )}
      
      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:image:alt" content={`${title} - ${author}`} />
      <meta name="twitter:creator" content={twitterUsername} />
      <meta name="twitter:site" content={twitterUsername} />
      <meta name="twitter:domain" content={new URL(url).hostname} />
      <meta name="twitter:label1" content="Reading time" />
      <meta name="twitter:data1" content={`${readingTime || 5} min read`} />
      <meta name="twitter:label2" content="Filed under" />
      <meta name="twitter:data2" content={category} />
      
      {/* Enhanced Telegram-specific optimizations */}
      <meta property="telegram:channel" content="@saifaljanahi" />
      <meta name="telegram:image" content={telegramImage} />
      <meta name="telegram:image:secure_url" content={telegramImage} />
      <meta name="telegram:preview" content={telegramPreviewImage} />
      <meta name="telegram:instant_view" content="1" />
      
      {/* Telegram Instant View specific meta tags */}
      {type === 'article' && (
        <>
          <meta name="telegram:article" content="true" />
          <meta name="telegram:author" content={author} />
          <meta name="telegram:published_time" content={publishedTime} />
          <meta name="telegram:reading_time" content={`${readingTime || 5}`} />
          <meta name="telegram:tags" content={tags.join(', ')} />
        </>
      )}
      
      {/* Additional social media platform optimizations */}
      <meta property="vk:image" content={ogImage} />
      <meta property="whatsapp:image" content={ogImage} />
      <meta property="pinterest:image" content={ogImage} />
      <meta property="pinterest:description" content={description} />
      
      {/* LinkedIn specific */}
      <meta property="linkedin:owner" content="saifaljanahi" />
      
      {/* Rich snippets for search engines */}
      <meta name="news_keywords" content={tags.join(', ')} />
      <meta name="standout" content={currentUrl} />
      
      {/* Article-specific meta tags */}
      {type === 'article' && (
        <>
          <meta name="reading_time" content={`${readingTime} min read`} />
          <meta name="word_count" content={wordCount?.toString()} />
          <meta name="publish_date" content={publishedTime} />
          <meta name="modified_date" content={modifiedTime} />
        </>
      )}
      
      {/* Mobile app deep linking */}
      <meta name="al:web:url" content={currentUrl} />
      
      {/* Structured Data - Main Article/Website Schema */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>
      
      {/* Additional BlogPosting structured data for articles */}
      {type === 'article' && generateBlogPostingSchema() && (
        <script type="application/ld+json">
          {JSON.stringify(generateBlogPostingSchema())}
        </script>
      )}
      
      {/* Breadcrumb structured data for articles */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": url
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${url}/blog`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": title,
                "item": currentUrl
              }
            ]
          })}
        </script>
      )}
      
      {/* FAQ structured data for articles (if applicable) */}
      {type === 'article' && tags.includes('tutorial') && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": title,
            "description": description,
            "author": {
              "@type": "Person",
              "name": author
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "proficiencyLevel": "Beginner"
          })}
        </script>
      )}
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      <link rel="preconnect" href="https://unpkg.com" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      
      {/* RSS and Atom feeds */}
      <link rel="alternate" type="application/rss+xml" title={`${siteName} Blog Feed`} href={`${url}/rss.xml`} />
      <link rel="alternate" type="application/atom+xml" title={`${siteName} Atom Feed`} href={`${url}/atom.xml`} />
      
      {/* JSON Feed */}
      <link rel="alternate" type="application/json" title={`${siteName} JSON Feed`} href={`${url}/feed.json`} />
      
      {/* DNS prefetch for common external resources */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//t.me" />
      <link rel="dns-prefetch" href="//telegram.org" />

      {/* Telegram Instant View Optimization */}
      <meta property="telegram:instant_view" content="supported" />
      <meta property="telegram:instant_view:version" content="2.1" />
      {type === 'article' && (
        <>
          <meta property="telegram:instant_view:path" content="/blog/" />
          <meta property="telegram:article:author" content={author || 'Saif Aljanahi'} />
          <meta property="telegram:article:published_time" content={publishedTime} />
          {modifiedTime && <meta property="telegram:article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* Additional structured data for better parsing */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? "Article" : "WebPage",
          "headline": title,
          "description": description,
          "author": {
            "@type": "Person",
            "name": author || "Saif Aljanahi",
            "url": "https://1saif.me"
          },
          "publisher": {
            "@type": "Person", 
            "name": "Saif Aljanahi",
            "url": "https://1saif.me"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url || canonicalUrl
          },
          "url": url || canonicalUrl,
          "image": image,
          "datePublished": publishedTime,
          "dateModified": modifiedTime || publishedTime,
          "inLanguage": locale || "en-US",
          ...(type === 'article' && {
            "articleSection": category || section || "Technology",
            "wordCount": wordCount,
            "timeRequired": readingTime ? `PT${readingTime}M` : undefined,
            "keywords": tags?.join(', ')
          })
        })}
      </script>
    </Helmet>
  )
}

export default SEOHead 