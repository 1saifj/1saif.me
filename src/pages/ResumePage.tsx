import React from 'react'
import { Navigation } from '../components/Navigation'
import { Resume } from '../components/Resume'
import SEOHead from '../components/SEOHead'

export const ResumePage: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Resume - Saif Aljanahi | Full-Stack Software Engineer"
        description="Professional resume of Saif Aljanahi, Full-Stack Software Engineer with 3+ years of experience in Golang, Python, Flutter, and system architecture."
        url="https://1saif.me/resume"
        type="website"
      />
      <Navigation />
      <main id="main-content" role="main" className="pt-20">
        <section id="resume" aria-labelledby="resume-heading" className="min-h-screen px-4 sm:px-6 lg:px-8">
          <Resume />
        </section>
      </main>
    </>
  )
} 