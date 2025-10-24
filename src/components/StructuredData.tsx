import React from 'react'

// Person Schema for the homepage
export const PersonStructuredData: React.FC = () => {
  const personData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Saif Aljanahi",
    "alternateName": "1saifj",
    "jobTitle": "Full-Stack Software Engineer",
    "description": "Experienced Full-Stack Software Engineer specializing in Golang, Python, Flutter, and Clean Architecture. Backend Team Lead at AlQaseh with expertise in financial systems and healthcare technology.",
    "url": "https://saifaljanahi.dev",
    "email": "saifalialjanahi@gmail.com",
    "telephone": "+964-7822084101",
    "image": "https://saifaljanahi.dev/sj_image.jpeg",
    "sameAs": [
      "https://github.com/1saifj",
      "https://www.linkedin.com/in/1saifj",
      "https://www.researchgate.net/profile/Saif-Aljanahi"
    ],
    "knowsAbout": [
      "Software Engineering",
      "Full-Stack Development", 
      "Golang",
      "Python",
      "Flutter",
      "React",
      "Node.js",
      "Backend Development",
      "Mobile Development",
      "Database Design",
      "API Development",
      "System Architecture"
    ],
    "worksFor": [
      {
        "@type": "Organization",
        "name": "AlQaseh",
        "url": "https://alqaseh.com"
      },
      {
        "@type": "Organization",
        "name": "University of Kufa",
        "url":"https://uokufa.edu.iq"
      }
    ],
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "University of Kufa",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Al-Najaf",
        "addressCountry": "Iraq"
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personData) }}
    />
  )
}

// Article Schema for blog posts
interface ArticleStructuredDataProps {
  title: string
  description: string
  publishedDate: string
  modifiedDate?: string
  tags: string[]
  slug: string
}

export const ArticleStructuredData: React.FC<ArticleStructuredDataProps> = ({
  title,
  description,
  publishedDate,
  modifiedDate,
  tags,
  slug
}) => {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": {
      "@type": "ImageObject",
      "url": `https://saifaljanahi.dev/articles/${slug}_feat.png`,
      "width": 1200,
      "height": 630
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate || publishedDate,
    "author": {
      "@type": "Person",
      "name": "Saif Aljanahi",
      "url": "https://saifaljanahi.dev",
      "sameAs": [
        "https://github.com/1saifj",
        "https://www.linkedin.com/in/1saifj"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Saif Aljanahi",
      "url": "https://saifaljanahi.dev",
      "logo": {
        "@type": "ImageObject",
        "url": "https://saifaljanahi.dev/sj.png",
        "width": 512,
        "height": 512
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://saifaljanahi.dev/blog/${slug}`
    },
    "keywords": tags.join(", "),
    "articleSection": "Technology",
    "inLanguage": "en-US"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
    />
  )
}

// Website Schema
export const WebsiteStructuredData: React.FC = () => {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Saif Aljanahi - Full-Stack Software Engineer",
    "alternateName": "Saif Aljanahi Portfolio",
    "url": "https://saifaljanahi.dev",
    "description": "Portfolio and blog of Saif Aljanahi, Backend Team Lead specializing in Golang, Python, Flutter, and Clean Architecture. Technical articles on software engineering, system design, and financial systems.",
    "inLanguage": "en-US",
    "author": {
      "@type": "Person",
      "name": "Saif Aljanahi",
      "url": "https://saifaljanahi.dev"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://saifaljanahi.dev/blog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  )
}

// Organization Schema (for professional work)
export const OrganizationStructuredData: React.FC = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://saifaljanahi.dev/#organization",
    "name": "Saif Aljanahi",
    "url": "https://saifaljanahi.dev",
    "logo": {
      "@type": "ImageObject",
      "url": "https://saifaljanahi.dev/sj.png",
      "width": 512,
      "height": 512
    },
    "image": "https://saifaljanahi.dev/sj_image.jpeg",
    "description": "Professional software engineering services specializing in Golang backend development, financial systems, and Clean Architecture. Expert in building scalable, secure applications.",
    "founder": {
      "@type": "Person",
      "name": "Saif Aljanahi",
      "url": "https://saifaljanahi.dev"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Al-Najaf",
      "addressCountry": "Iraq"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "knowsAbout": [
      "Golang",
      "Python",
      "Flutter",
      "Clean Architecture",
      "Backend Development",
      "Financial Systems",
      "PostgreSQL",
      "Microservices",
      "API Development",
      "System Design"
    ],
    "sameAs": [
      "https://github.com/1saifj",
      "https://www.linkedin.com/in/1saifj",
      "https://www.researchgate.net/profile/Saif-Aljanahi"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Professional",
      "email": "saifalialjanahi@gmail.com",
      "telephone": "+964-7822084101",
      "availableLanguage": ["English", "Arabic"]
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  )
}

// FAQ Schema for common questions
export const FAQStructuredData: React.FC = () => {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What programming languages does Saif Aljanahi specialize in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Saif Aljanahi specializes in Golang, Python, Dart (Flutter), JavaScript/TypeScript, and has experience with Rust, Java, and other modern programming languages."
        }
      },
      {
        "@type": "Question", 
        "name": "What types of projects does Saif work on?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Saif works on full-stack web applications, mobile apps (Flutter), backend systems, APIs, database design, and system architecture projects. He has experience with both enterprise and startup environments."
        }
      },
      {
        "@type": "Question",
        "name": "How can I contact Saif Aljanahi for a project?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can contact Saif via email at saifalialjanahi@gmail.com, through the contact form on his website at saifaljanahi.dev, or connect on LinkedIn and GitHub."
        }
      },
      {
        "@type": "Question",
        "name": "Does Saif Aljanahi work remotely?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Saif Aljanahi works remotely and collaborates with teams worldwide. He has experience working with distributed teams and modern collaboration tools."
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  )
} 