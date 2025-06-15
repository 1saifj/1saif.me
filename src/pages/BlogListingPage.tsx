import React from 'react'
import { Navigation } from '../components/Navigation'
import { Blog } from '../components/Blog'
import SEOHead from '../components/SEOHead'

export const BlogListingPage: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Blog | Saif Alqaseh - Software Engineering Insights"
        description="Explore in-depth articles on software engineering, web development, mobile apps, backend systems, and emerging technologies. Technical insights and tutorials by Saif Alqaseh."
        tags={['software engineering', 'web development', 'mobile development', 'golang', 'python', 'flutter', 'react', 'backend', 'frontend', 'tutorials', 'tech blog']}
        type="website"
      />
      <Navigation />
      <main id="main-content" role="main">
        <section id="blog" aria-labelledby="blog-heading">
          <Blog />
        </section>
      </main>
    </>
  )
} 