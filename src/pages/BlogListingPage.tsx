import React from 'react'
import { BlogListing } from '../components/BlogListing'
import SEOHead from '../components/SEOHead'

export const BlogListingPage: React.FC = () => (
  <>
    <SEOHead
      title="Writing | Saif Aljanahi"
      description="Notes by Saif Aljanahi on databases, Go, Flutter, and the tools he uses at work."
      tags={['golang', 'postgresql', 'flutter', 'backend', 'system design']}
      url="https://1saif.me/blog"
      type="website"
    />
    <BlogListing />
  </>
)
