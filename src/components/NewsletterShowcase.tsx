import React, { useState } from 'react'
import { Copy, Check, Eye, Code, Palette, Sparkles } from 'lucide-react'
import { NewsletterTemplates } from './NewsletterTemplates'
import { NewsletterService } from '../services/newsletterService'

export const NewsletterShowcase: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<keyof typeof NewsletterTemplates>('GradientHero')
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview')
  const [copiedCode, setCopiedCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const templates = [
    {
      key: 'GradientHero' as const,
      name: 'Gradient Hero',
      description: 'Eye-catching gradient design with animated elements',
      features: ['Animated backgrounds', 'Modern gradients', 'Strong CTAs'],
      preview: '🌈 Modern & Bold'
    },
    {
      key: 'MinimalistCard' as const,
      name: 'Minimalist Card',
      description: 'Clean, professional design with subtle animations',
      features: ['Professional look', 'Subtle animations', 'Clean layout'],
      preview: '🎨 Clean & Professional'
    },
    {
      key: 'FeatureRich' as const,
      name: 'Feature Rich',
      description: 'Showcases benefits and includes social proof',
      features: ['Feature highlights', 'Social proof', 'Detailed benefits'],
      preview: '⭐ Feature-Packed'
    },
    {
      key: 'CompactInline' as const,
      name: 'Compact Inline',
      description: 'Perfect for embedding in blog posts or sidebars',
      features: ['Space efficient', 'Inline friendly', 'Quick signup'],
      preview: '📝 Compact & Inline'
    },
    {
      key: 'AnimatedInteractive' as const,
      name: 'Animated Interactive',
      description: 'Dynamic template with floating elements and hover effects',
      features: ['Floating animations', 'Interactive hover', 'Modern dynamics'],
      preview: '✨ Dynamic & Interactive'
    },
    {
      key: 'ModernGlass' as const,
      name: 'Modern Glass',
      description: 'Glassmorphism design with mouse tracking and premium aesthetics',
      features: ['Glassmorphism effect', 'Mouse tracking', 'Premium aesthetics'],
      preview: '🔮 Glass & Premium'
    }
  ]

  const handleMockSubscribe = async (email: string) => {
    setIsLoading(true)
    try {
      // Mock delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Mock subscription for:', email)
    } catch (error) {
      console.error('Mock subscription error:', error)
    } finally {
      setIsLoading(false)
    }
  }

     const generateTemplateCode = (templateKey: keyof typeof NewsletterTemplates) => {
     return `import React from 'react'
import { ${templateKey}Newsletter } from './components/NewsletterTemplates'
import { NewsletterService } from './services/newsletterService'

export const MyNewsletterComponent = () => {
  const handleSubscribe = async (email: string) => {
    try {
      const result = await NewsletterService.subscribeEmail(email)
      if (!result.success) {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Subscription error:', error)
      throw error
    }
  }

  return (
    <${templateKey}Newsletter 
      onSubscribe={handleSubscribe}
      isLoading={false}
    />
  )
}`
   }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const ActiveTemplateComponent = NewsletterTemplates[activeTemplate]

  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Beautiful Newsletter Templates</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Newsletter Template Gallery
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Choose from our collection of beautiful, responsive newsletter subscription templates. 
              Each template is designed for maximum conversion and user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Selector */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50 sticky top-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-blue-600" />
                  Choose Template
                </h3>
                
                <div className="space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template.key}
                      onClick={() => setActiveTemplate(template.key)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                        activeTemplate === template.key
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <span className="text-sm opacity-75">{template.preview}</span>
                      </div>
                      <p className={`text-sm mb-3 ${
                        activeTemplate === template.key ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${
                              activeTemplate === template.key
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all ${
                        viewMode === 'preview'
                          ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Preview</span>
                    </button>
                    <button
                      onClick={() => setViewMode('code')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all ${
                        viewMode === 'code'
                          ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Code className="w-4 h-4" />
                      <span className="text-sm font-medium">Code</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Display */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                {viewMode === 'preview' ? (
                  <div className="p-8">
                    <div className="mb-6 text-center">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {templates.find(t => t.key === activeTemplate)?.name} Template
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Interactive preview - try subscribing with any email!
                      </p>
                    </div>
                    
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6">
                      <ActiveTemplateComponent 
                        onSubscribe={handleMockSubscribe}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center justify-between p-4 bg-slate-900 dark:bg-slate-950 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-mono">
                          {activeTemplate}Newsletter.tsx
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(generateTemplateCode(activeTemplate))}
                        className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="p-6 bg-slate-950 text-slate-300 overflow-auto max-h-[600px]">
                      <pre className="text-sm leading-relaxed">
                        <code className="font-mono">
                          {generateTemplateCode(activeTemplate)}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Instructions */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-blue-600" />
                  How to Use
                </h4>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>1. Choose your preferred template from the gallery</p>
                  <p>2. Copy the component code using the "Copy Code" button</p>
                  <p>3. Import the template component in your React application</p>
                  <p>4. Connect it to your newsletter service (Firebase already configured!)</p>
                  <p>5. Customize colors, text, and styling to match your brand</p>
                </div>
                
                <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Pro Tip:</strong> All templates are fully responsive and include dark mode support. 
                    They work seamlessly with your existing Firebase newsletter integration!
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