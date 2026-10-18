import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../i18n/language'

const SITE = 'https://1saif.me'

interface SEOHeadProps {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  noIndex?: boolean
}

const SEOHead: React.FC<SEOHeadProps> = ({ title, description, url, image = '/sj_image.jpeg', type = 'website', publishedTime, modifiedTime, tags = [], noIndex = false }) => {
  const { language } = useLanguage()
  const fullTitle = title.includes('Saif Aljanahi') || title.includes('سيف الجناحي') ? title : `${title} | ${language === 'ar' ? 'سيف الجناحي' : 'Saif Aljanahi'}`
  // Pages pass their English URL; the Arabic page is the same path under /ar. Each version names itself canonical.
  const baseUrl = url.split('?')[0]
  const path = baseUrl.slice(SITE.length) || '/'
  const arabicUrl = `${SITE}/ar${path === '/' ? '' : path}`
  const currentUrl = language === 'ar' ? arabicUrl : baseUrl
  const imageUrl = image.startsWith('http') ? image : `${SITE}${image}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" hrefLang="en" href={baseUrl} />
      <link rel="alternate" hrefLang="ar" href={arabicUrl} />
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />
      {noIndex && <meta name="robots" content="noindex" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Saif Aljanahi" />
      <meta property="og:locale" content={language === 'ar' ? 'ar_IQ' : 'en_US'} />
      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === 'article' && tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  )
}

export default SEOHead
