import React from 'react'

const SITE = 'https://1saif.me'

const author = {
  '@type': 'Person',
  name: 'Saif Aljanahi',
  url: SITE,
  sameAs: ['https://github.com/1saifj', 'https://www.linkedin.com/in/1saifj'],
}

const JsonLd: React.FC<{ data: object }> = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
)

// Home page only: who the site is about.
export const PersonStructuredData: React.FC = () => (
  <JsonLd data={{
    '@context': 'https://schema.org',
    ...author,
    jobTitle: 'Lead Software Engineer',
    description: 'Lead software engineer in Al-Najaf, Iraq. Builds backend platforms, cloud infrastructure and university systems with TypeScript, Go, PostgreSQL and Flutter.',
    image: `${SITE}/sj_image.jpeg`,
    email: 'saifalialjanahi@gmail.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Al-Najaf', addressCountry: 'IQ' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Kufa', url: 'https://uokufa.edu.iq' },
    knowsAbout: ['Go', 'TypeScript', 'PostgreSQL', 'Google Cloud', 'Flutter', 'Next.js', 'Backend development'],
  }} />
)

interface ArticleStructuredDataProps {
  title: string
  description: string
  publishedDate: string
  modifiedDate?: string
  tags: string[]
  slug: string
  image?: string
  wordCount?: number
}

export const ArticleStructuredData: React.FC<ArticleStructuredDataProps> = ({ title, description, publishedDate, modifiedDate, tags, slug, image, wordCount }) => (
  <JsonLd data={{
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    ...(image && { image: `${SITE}${image}` }),
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author,
    mainEntityOfPage: `${SITE}/blog/${slug}`,
    keywords: tags.join(', '),
    inLanguage: 'en',
    ...(wordCount && { wordCount }),
  }} />
)
