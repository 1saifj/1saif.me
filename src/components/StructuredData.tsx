import React from 'react'

// Person Schema for the homepage
export const PersonStructuredData: React.FC = () => {
  const personData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Saif Aljanahi",
    "alternateName": "Saif Aljanahi",
    "jobTitle": "Full-Stack Software Engineer",
    "description": "Experienced Full-Stack Software Engineer specializing in Golang, Python, Flutter, and modern web technologies. Expert in building scalable backend systems and beautiful mobile applications.",
    "url": "https://1saif.me",
    "sameAs": [
      "https://github.com/saif-alqaseh",
      "https://linkedin.com/in/saif-alqaseh", 
      "https://twitter.com/saif_alqaseh"
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
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance Software Engineer"
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "University of Technology"
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
    "image": `https://1saif.me/og-images/blog/${slug}.png`, // You can generate OG images
    "datePublished": publishedDate,
    "dateModified": modifiedDate || publishedDate,
    "author": {
      "@type": "Person",
      "name": "Saif Aljanahi",
      "url": "https://1saif.me"
    },
    "publisher": {
      "@type": "Person",
      "name": "Saif Aljanahi",
      "url": "https://1saif.me"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://1saif.me/blog/${slug}`
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
    "@type": "Website",
    "name": "Saif Aljanahi - Software Engineer Portfolio",
    "alternateName": "1saif.me",
    "url": "https://1saif.me",
    "description": "Portfolio website of Saif Aljanahi, a Full-Stack Software Engineer specializing in Golang, Python, Flutter, and modern web technologies.",
    "inLanguage": "en-US",
    "author": {
      "@type": "Person",
      "name": "Saif Aljanahi"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://1saif.me/blog?search={search_term_string}",
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
    "@type": "ProfessionalService",
    "name": "Saif Aljanahi Software Engineering Services",
    "image": "https://1saif.me/images/saif-alqaseh.jpg",
    "description": "Professional software engineering services specializing in full-stack development, mobile applications, and backend systems.",
    "founder": {
      "@type": "Person",
      "name": "Saif Aljanahi"
    },
    "areaServed": "Worldwide",
    "serviceType": [
      "Full-Stack Development",
      "Mobile App Development", 
      "Backend Development",
      "API Development",
      "Database Design",
      "System Architecture",
      "Technical Consulting"
    ],
    "url": "https://1saif.me",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://1saif.me/#contact",
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
          "text": "You can contact Saif through the contact form on his portfolio website at 1saif.me, via email, or through his social media profiles on GitHub and LinkedIn."
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