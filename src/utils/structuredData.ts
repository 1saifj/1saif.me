// Structured Data Utilities for Enhanced SEO
// Based on schema.org standards and Google Search recommendations

export interface Person {
  name: string;
  url: string;
  email?: string;
  jobTitle?: string;
  image?: string;
  sameAs?: string[];
}

export interface Organization {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

export interface Article {
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  author: Person;
  publisher: Organization | Person;
  url: string;
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
  timeRequired?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

// Generate Article Schema (BlogPosting)
export function generateArticleSchema(article: Article): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url,
      ...(article.author.image && { image: article.author.image }),
      ...(article.author.jobTitle && { jobTitle: article.author.jobTitle }),
    },
    publisher: {
      '@type': article.publisher.hasOwnProperty('logo') ? 'Organization' : 'Person',
      name: article.publisher.name,
      ...(article.publisher.url && { url: article.publisher.url }),
      ...((article.publisher as Organization).logo && {
        logo: {
          '@type': 'ImageObject',
          url: (article.publisher as Organization).logo,
        },
      }),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    url: article.url,
    ...(article.keywords && { keywords: article.keywords.join(', ') }),
    ...(article.articleSection && { articleSection: article.articleSection }),
    ...(article.wordCount && { wordCount: article.wordCount }),
    ...(article.timeRequired && { timeRequired: article.timeRequired }),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };
}

// Generate FAQ Schema
export function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate HowTo Schema
export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  totalTime?: string,
  estimatedCost?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(totalTime && { totalTime }),
    ...(estimatedCost && { estimatedCost }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: {
          '@type': 'ImageObject',
          url: step.image,
        },
      }),
      ...(step.url && { url: step.url }),
    })),
  };
}

// Generate Breadcrumb Schema
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.item,
    })),
  };
}

// Generate Person Schema
export function generatePersonSchema(person: Person): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    url: person.url,
    ...(person.email && { email: person.email }),
    ...(person.jobTitle && { jobTitle: person.jobTitle }),
    ...(person.image && { image: person.image }),
    ...(person.sameAs && { sameAs: person.sameAs }),
  };
}

// Generate WebSite Schema with SearchAction
export function generateWebSiteSchema(
  name: string,
  url: string,
  description: string,
  searchUrl?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${searchUrl}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  };
}

// Generate Organization Schema
export function generateOrganizationSchema(org: Organization): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    ...(org.logo && {
      logo: {
        '@type': 'ImageObject',
        url: org.logo,
      },
    }),
    ...(org.sameAs && { sameAs: org.sameAs }),
  };
}

// Generate Video Schema
export function generateVideoSchema(
  name: string,
  description: string,
  thumbnailUrl: string,
  uploadDate: string,
  duration?: string,
  contentUrl?: string,
  embedUrl?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    ...(duration && { duration }),
    ...(contentUrl && { contentUrl }),
    ...(embedUrl && { embedUrl }),
  };
}

// Generate SoftwareApplication Schema (for projects)
export function generateSoftwareSchema(
  name: string,
  description: string,
  url: string,
  applicationCategory: string,
  operatingSystem?: string,
  offers?: {
    price: string;
    priceCurrency: string;
  }
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    ...(operatingSystem && { operatingSystem }),
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency,
      },
    }),
  };
}

// Generate TechArticle Schema (for technical tutorials)
export function generateTechArticleSchema(
  headline: string,
  description: string,
  author: Person,
  datePublished: string,
  dateModified: string,
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Expert',
  dependencies?: string[],
  skillLevel?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline,
    description,
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    },
    datePublished,
    dateModified,
    proficiencyLevel,
    ...(dependencies && { dependencies }),
    ...(skillLevel && { skillLevel }),
  };
}

// Utility to inject structured data into the page
export function injectStructuredData(schema: object, id?: string): void {
  if (typeof window === 'undefined') return;

  const scriptId = id || `structured-data-${Date.now()}`;
  const existingScript = document.getElementById(scriptId);

  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// Validate structured data (basic validation)
export function validateStructuredData(schema: object): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!schema['@context']) {
    errors.push('Missing @context');
  }

  if (!schema['@type']) {
    errors.push('Missing @type');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
