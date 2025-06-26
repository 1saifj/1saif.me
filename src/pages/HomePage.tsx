import React from 'react'
import { Navigation } from '../components/Navigation'
import { Hero } from '../components/Hero'
import { About } from '../components/About'

import { Skills } from '../components/Skills'
import { Projects } from '../components/Projects'
import { Research } from '../components/Research'
import { Blog } from '../components/Blog'
import { Contact } from '../components/Contact'
import { PersonStructuredData, WebsiteStructuredData, OrganizationStructuredData, FAQStructuredData } from '../components/StructuredData'

export const HomePage: React.FC = () => {
  return (
    <>
      <PersonStructuredData />
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <FAQStructuredData />
      <Navigation />
      <main id="main-content" role="main" className="overflow-x-hidden">
        <section id="home" aria-labelledby="hero-heading" className="min-h-screen">
          <Hero />
        </section>
        <section id="about" aria-labelledby="about-heading" className="px-4 sm:px-6 lg:px-8">
          <About />
        </section>
        <section id="skills" aria-labelledby="skills-heading" className="px-4 sm:px-6 lg:px-8">
          <Skills />
        </section>
        <section id="projects" aria-labelledby="projects-heading" className="px-4 sm:px-6 lg:px-8">
          <Projects />
        </section>
        <section id="blog" aria-labelledby="blog-heading" className="px-4 sm:px-6 lg:px-8">
          <Blog />
        </section>
        <section id="research" aria-labelledby="research-heading" className="px-4 sm:px-6 lg:px-8">
          <Research />
        </section>
        <section id="contact" aria-labelledby="contact-heading" className="px-4 sm:px-6 lg:px-8">
          <Contact />
        </section>
      </main>
    </>
  )
}