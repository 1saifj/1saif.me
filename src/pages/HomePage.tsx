import React from 'react'
import { Navigation } from '../components/Navigation'
import { Hero } from '../components/Hero'
import { About } from '../components/About'
import { Resume } from '../components/Resume'
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
      <main id="main-content" role="main">
        <section id="home" aria-labelledby="hero-heading">
          <Hero />
        </section>
        <section id="about" aria-labelledby="about-heading">
          <About />
        </section>
        <section id="resume" aria-labelledby="resume-heading">
          <Resume />
        </section>
        <section id="skills" aria-labelledby="skills-heading">
          <Skills />
        </section>
        <section id="projects" aria-labelledby="projects-heading">
          <Projects />
        </section>
        <section id="blog" aria-labelledby="blog-heading">
          <Blog />
        </section>
        <section id="research" aria-labelledby="research-heading">
          <Research />
        </section>
        <section id="contact" aria-labelledby="contact-heading">
          <Contact />
        </section>
      </main>
    </>
  )
}