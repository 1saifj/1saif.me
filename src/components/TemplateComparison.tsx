import React, { useState } from 'react'
import { 
  GradientHeroNewsletter, 
  MinimalistCardNewsletter, 
  FeatureRichNewsletter, 
  CompactInlineNewsletter 
} from './NewsletterTemplates'
import { Sparkles, Layout, Palette, Code } from 'lucide-react'

export const TemplateComparison: React.FC = () => {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})

  const handleMockSubscribe = async (email: string, templateKey: string) => {
    setIsLoading(prev => ({ ...prev, [templateKey]: true }))
    try {
      // Mock delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log(`Mock subscription for ${email} using ${templateKey} template`)
    } catch (error) {
      console.error('Mock subscription error:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, [templateKey]: false }))
    }
  }

  const templates = [
    {
      key: 'gradient-hero',
      name: 'Gradient Hero',
      description: 'Eye-catching gradient design with animated backgrounds',
      component: GradientHeroNewsletter,
      features: ['Animated gradients', 'Bold typography', 'Strong CTAs', 'Premium feel'],
      bestFor: 'Tech startups, SaaS products, modern brands'
    },
    {
      key: 'minimalist-card',
      name: 'Minimalist Card',
      description: 'Clean, professional design with subtle animations',
      component: MinimalistCardNewsletter,
      features: ['Clean layout', 'Professional look', 'Subtle effects', 'High readability'],
      bestFor: 'Corporate blogs, professional services, B2B companies'
    },
    {
      key: 'feature-rich',
      name: 'Feature Rich',
      description: 'Comprehensive template with benefits and social proof',
      component: FeatureRichNewsletter,
      features: ['Feature highlights', 'Social proof', 'Benefit-focused', 'Conversion optimized'],
      bestFor: 'Product launches, educational content, high-conversion needs'
    },
    {
      key: 'compact-inline',
      name: 'Compact Inline',
      description: 'Space-efficient design perfect for embedding',
      component: CompactInlineNewsletter,
      features: ['Space efficient', 'Inline friendly', 'Quick signup', 'Sidebar ready'],
      bestFor: 'Blog sidebars, inline content, space-constrained areas'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Beautiful Newsletter Templates</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Template Showcase
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Compare our beautifully designed newsletter templates. Each one is fully responsive, 
              accessible, and optimized for maximum conversion.
            </p>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {templates.map((template) => {
              const TemplateComponent = template.component
              return (
                <div key={template.key} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                      <div className="flex space-x-1">
                        <Layout className="w-5 h-5 text-blue-600" />
                        <Palette className="w-5 h-5 text-purple-600" />
                        <Code className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {template.description}
                    </p>
                    
                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Best For */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Best For:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                        {template.bestFor}
                      </p>
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4">
                    <div className="mb-3 text-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Interactive Preview
                      </span>
                    </div>
                    <TemplateComponent 
                      onSubscribe={(email) => handleMockSubscribe(email, template.key)}
                      isLoading={isLoading[template.key] || false}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Usage Guide */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-3xl p-8 border border-blue-200 dark:border-blue-800">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                How to Implement
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Choose your favorite template and follow these simple steps to integrate it into your project.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/60 dark:bg-slate-800/60 rounded-2xl backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Choose Template
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Select the template that best fits your brand and use case from our gallery above.
                </p>
              </div>

              <div className="text-center p-6 bg-white/60 dark:bg-slate-800/60 rounded-2xl backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Copy Component
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Import the template component and connect it to your existing Firebase newsletter service.
                </p>
              </div>

              <div className="text-center p-6 bg-white/60 dark:bg-slate-800/60 rounded-2xl backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Customize & Deploy
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Customize colors, text, and styling to match your brand, then deploy with confidence.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    Ready to Use!
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                    All templates are already integrated with your Firebase newsletter service. 
                    They include real-time validation, GDPR compliance, analytics tracking, and error handling. 
                    Simply choose a template and start collecting subscribers!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 