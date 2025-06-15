import React, { useState } from 'react'
import { Download, FileText, Search, Globe, CheckCircle, AlertCircle, Settings, Zap, Target } from 'lucide-react'
import { generateSitemap, downloadSitemap, generateRobotsTxt, downloadRobotsTxt } from '../utils/sitemapGenerator'

export const SEOAdmin: React.FC = () => {
  const [showPreview, setShowPreview] = useState<'sitemap' | 'robots' | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSitemap = async () => {
    setIsGenerating(true)
    try {
      downloadSitemap()
      setShowPreview('sitemap')
    } catch (error) {
      console.error('Error generating sitemap:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateRobots = async () => {
    setIsGenerating(true)
    try {
      downloadRobotsTxt()
      setShowPreview('robots')
    } catch (error) {
      console.error('Error generating robots.txt:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const seoTasks = [
    {
      title: 'Structured Data',
      description: 'Schema.org markup for rich snippets',
      status: 'completed',
      icon: Target,
      items: ['Person Schema', 'Article Schema', 'Website Schema', 'Organization Schema', 'FAQ Schema']
    },
    {
      title: 'Meta Tags',
      description: 'Open Graph and Twitter Card optimization',
      status: 'completed',
      icon: Globe,
      items: ['Open Graph Tags', 'Twitter Cards', 'Meta Descriptions', 'Canonical URLs']
    },
    {
      title: 'Technical SEO',
      description: 'Core web vitals and performance',
      status: 'completed',
      icon: Zap,
      items: ['Fast Loading', 'Mobile Responsive', 'HTTPS', 'Clean URLs', 'Semantic HTML']
    },
    {
      title: 'Content SEO',
      description: 'Optimized content and navigation',
      status: 'completed',
      icon: FileText,
      items: ['Keyword Optimization', 'Internal Linking', 'Blog System', 'XML Sitemap']
    }
  ]

  return (
    <div className="bg-white dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              SEO Administration
            </h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage SEO settings, generate sitemaps, and monitor optimization status for better search engine visibility.
          </p>
        </div>

        {/* SEO Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {seoTasks.map((task, index) => {
            const IconComponent = task.icon
            return (
              <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                      <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  {task.items.map((item, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* File Generation Tools */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">SEO File Generation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sitemap Generator */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">XML Sitemap</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate an XML sitemap including all pages, blog posts, and projects for search engines.
              </p>
              <button
                onClick={handleGenerateSitemap}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download Sitemap'}
              </button>
            </div>

            {/* Robots.txt Generator */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Robots.txt</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate a robots.txt file to guide search engine crawlers and improve indexing.
              </p>
              <button
                onClick={handleGenerateRobots}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download Robots.txt'}
              </button>
            </div>
          </div>
        </div>

        {/* SEO Tips */}
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">SEO Best Practices</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Content Optimization</h4>
              <ul className="space-y-1">
                <li>• Use descriptive page titles (50-60 characters)</li>
                <li>• Write compelling meta descriptions (150-160 characters)</li>
                <li>• Include relevant keywords naturally</li>
                <li>• Create high-quality, original content</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Technical Optimization</h4>
              <ul className="space-y-1">
                <li>• Ensure fast page loading speeds</li>
                <li>• Optimize for mobile devices</li>
                <li>• Use semantic HTML structure</li>
                <li>• Implement proper URL structure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {showPreview === 'sitemap' ? 'Sitemap Preview' : 'Robots.txt Preview'}
            </h3>
            <pre className="bg-gray-100 dark:bg-slate-900 p-4 rounded-lg text-xs overflow-auto max-h-64">
              {showPreview === 'sitemap' ? generateSitemap() : generateRobotsTxt()}
            </pre>
            <button
              onClick={() => setShowPreview(null)}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Close Preview
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 