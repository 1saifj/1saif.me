import React from 'react'
import { Navigation } from '../components/Navigation'
import { BlogListing } from '../components/BlogListing'
import SEOHead from '../components/SEOHead'

export const BlogListingPage: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Blog | Saif Aljanahi - Software Engineering Insights"
        description="Explore in-depth articles on software engineering, web development, mobile apps, backend systems, and emerging technologies. Technical insights and tutorials by Saif Aljanahi."
        tags={['software engineering', 'web development', 'mobile development', 'golang', 'python', 'flutter', 'react', 'backend', 'frontend', 'tutorials', 'tech blog']}
        type="website"
      />
      <Navigation />
      <main id="main-content" role="main">
        <section id="blog" aria-labelledby="blog-heading">
          <BlogListing />
        </section>
      </main>
    </>
  )
} 