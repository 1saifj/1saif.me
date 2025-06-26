import React from 'react'
import { NewsletterShowcase } from '../components/NewsletterShowcase'

const TemplateDemo: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        <NewsletterShowcase />
      </div>
    </div>
  )
}

export default TemplateDemo 