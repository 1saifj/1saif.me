import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Github, Wrench, Calendar, Code, Globe, ChevronRight, Home, Star, Users, Zap, Shield, Database, Layers, Lock, Building2 } from 'lucide-react'
import { projects as projectFiles } from '../utils/contentLoader'
import { projectSchema, Language, SourceType } from '../schemas/projectSchema'
import { findContentBySlug } from '../utils/slugUtils'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'
import SEOHead from '../components/SEOHead'

const languageColors: Record<Language, string> = {
  typescript: 'from-blue-500 to-blue-600',
  rust: 'from-orange-500 to-red-600',
  haskell: 'from-purple-500 to-purple-600',
  go: 'from-cyan-500 to-blue-600',
  ocaml: 'from-emerald-500 to-green-600'
}

const languageIcons: Record<Language, React.ReactNode> = {
  typescript: <Code className="w-5 h-5" />,
  rust: <Zap className="w-5 h-5" />,
  haskell: <Layers className="w-5 h-5" />,
  go: <Database className="w-5 h-5" />,
  ocaml: <Shield className="w-5 h-5" />
}

const languageLabels: Record<Language, string> = {
  typescript: 'TypeScript',
  rust: 'Rust',
  haskell: 'Haskell',
  go: 'Go',
  ocaml: 'OCaml'
}

// Source type configuration
const sourceTypeConfig: Record<SourceType, { icon: React.ReactNode, label: string, color: string }> = {
  'open-source': { icon: <Globe className="w-4 h-4" />, label: 'Open Source', color: 'from-green-500 to-emerald-600' },
  'private': { icon: <Lock className="w-4 h-4" />, label: 'Private', color: 'from-orange-500 to-red-600' },
  'company': { icon: <Building2 className="w-4 h-4" />, label: 'Company', color: 'from-purple-500 to-indigo-600' }
}

export const ProjectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [isScrolled, setIsScrolled] = useState(false)
  const [contentHtml, setContentHtml] = useState<string>('')
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const processContent = async () => {
      const projectFile = findContentBySlug(projectFiles, slug || '')
      if (projectFile?.content) {
        const html = await convertMarkdownToHtml(projectFile.content)
        setContentHtml(html)
      }
    }
    processContent()
  }, [slug])
  
  if (!slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-500/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-red-500/30">
            <Code className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">Invalid URL</h1>
          <p className="text-slate-300 mb-8 leading-relaxed text-lg">No project identifier was provided in the URL.</p>
          <Link 
            to="/"
            className="inline-flex items-center space-x-3 bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-slate-100 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    )
  }

  const projectFile = findContentBySlug(projectFiles, slug)
  
  if (!projectFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-yellow-500/30">
            <Code className="w-12 h-12 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">Project Not Found</h1>
          <p className="text-slate-300 mb-8 leading-relaxed text-lg">The project you're looking for doesn't exist or has been moved.</p>
          <div className="space-y-4">
            <Link 
              to="/#projects"
              className="block bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-slate-100 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl"
            >
              Browse All Projects
            </Link>
            <Link 
              to="/"
              className="block bg-slate-700/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-slate-600/50 transition-all duration-300 font-medium border border-slate-600"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  let project
  try {
    project = projectSchema.parse({
      order: projectFile.frontmatter.order || -1,
      name: projectFile.frontmatter.name,
      description: projectFile.frontmatter.description,
      url: projectFile.frontmatter.url,
      language: projectFile.frontmatter.language,
      wip: projectFile.frontmatter.wip || false,
      isPrivate: projectFile.frontmatter.isPrivate || false,
      sourceType: projectFile.frontmatter.sourceType || 'open-source'
    })
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-500/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-red-500/30">
            <Code className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">Invalid Project Data</h1>
          <p className="text-slate-300 mb-8 leading-relaxed text-lg">This project has corrupted or invalid metadata.</p>
          <Link 
            to="/"
            className="inline-flex items-center space-x-3 bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-slate-100 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
              <Link 
                to="/"
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <Link 
                to="/#projects"
                className="text-slate-300 hover:text-white transition-colors bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm"
              >
                Projects
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span className="text-white font-medium truncate max-w-xs bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">{project.name}</span>
            </nav>
            <Link 
              to="/"
              className="text-3xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              SA
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
          <div className="text-center mb-12">
            {/* Project Badge */}
            <div className="inline-flex items-center space-x-4 mb-8 flex-wrap justify-center">
              <div className={`flex items-center space-x-3 bg-gradient-to-r ${languageColors[project.language]} text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-sm border border-white/20`}>
                {languageIcons[project.language]}
                <span className="font-semibold">{languageLabels[project.language]}</span>
              </div>
              <div className={`flex items-center space-x-3 bg-gradient-to-r ${sourceTypeConfig[project.sourceType].color} text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-sm border border-white/20`}>
                {sourceTypeConfig[project.sourceType].icon}
                <span className="font-semibold">{sourceTypeConfig[project.sourceType].label}</span>
              </div>
              {project.wip && (
                <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-500/30">
                  <Wrench className="w-4 h-4" aria-hidden="true" />
                  <span className="font-medium">Work in Progress</span>
                </div>
              )}
              <div className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                <Star className="w-4 h-4" />
                <span className="font-medium">Featured</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight tracking-tight">
              {project.name}
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-12 leading-relaxed max-w-4xl mx-auto">
              {project.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {(project.sourceType === 'open-source' && !project.isPrivate) ? (
                <>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-4 bg-white text-slate-900 px-10 py-5 rounded-2xl hover:bg-slate-100 transition-all duration-300 font-bold shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
                    aria-label={`View ${project.name} source code on GitHub`}
                  >
                    <Github className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <span>View Source Code</span>
                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </a>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-bold shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
                      aria-label={`Visit ${project.name} live demo`}
                    >
                      <Globe className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      <span>Live Demo</span>
                      <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </a>
                  )}
                </>
              ) : (
                <div className="group inline-flex items-center space-x-4 bg-gray-500 text-gray-200 px-10 py-5 rounded-2xl cursor-not-allowed opacity-75 font-bold shadow-2xl text-lg">
                  <Lock className="w-6 h-6" aria-hidden="true" />
                  <span>Source Code Unavailable</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 max-w-6xl">
          {/* Project Details Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden mb-12 border border-white/20">
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-8">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <Code className="w-8 h-8 mr-4 text-blue-400" />
                Project Overview
              </h2>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 mb-12">
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                      Technology Stack
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center space-x-3">
                          {languageIcons[project.language]}
                          <span className="text-slate-700 font-semibold">Primary Language</span>
                        </div>
                        <div className={`flex items-center space-x-2 bg-gradient-to-r ${languageColors[project.language]} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                          <span>{languageLabels[project.language]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-50 to-green-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <Users className="w-6 h-6 mr-3 text-green-600" />
                      Development Status
                    </h3>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-semibold">Current Status</span>
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${
                          project.wip 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                        }`}>
                          {project.wip ? (
                            <>
                              <Wrench className="w-4 h-4" />
                              <span>In Development</span>
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4" />
                              <span>Production Ready</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <ExternalLink className="w-6 h-6 mr-3 text-purple-600" />
                      Quick Links
                    </h3>
                    <div className="space-y-4">
                      {(project.sourceType === 'open-source' && !project.isPrivate) ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-xl transition-all duration-200 shadow-sm border border-slate-100 hover:shadow-md hover:scale-105"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-slate-100 group-hover:bg-slate-200 rounded-lg p-3 transition-colors">
                              <Github className="w-6 h-6 text-slate-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">Source Code</span>
                              <span className="text-slate-500 text-sm">View on GitHub</span>
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                        </a>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200 opacity-75">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gray-200 rounded-lg p-3">
                              <Lock className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600 block">Source Code</span>
                              <span className="text-gray-500 text-sm">{project.sourceType === 'company' ? 'Company Project' : 'Private Repository'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <Shield className="w-6 h-6 mr-3 text-cyan-600" />
                      Project Highlights
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-700 font-medium">Clean Architecture</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-100">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-700 font-medium">Production Ready</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-100">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-slate-700 font-medium">Scalable Design</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Content */}
              {projectFile.content && (
                <div className="border-t border-slate-200 pt-12">
                  <h3 className="text-3xl font-bold text-slate-900 mb-8 flex items-center">
                    <Layers className="w-8 h-8 mr-4 text-blue-600" />
                    Detailed Information
                  </h3>
                  <div 
                    className="prose prose-xl max-w-none
                      prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
                      prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12
                      prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10
                      prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                      prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
                      prose-strong:text-slate-900 prose-strong:font-bold
                      prose-code:bg-slate-100 prose-code:px-3 prose-code:py-1 prose-code:rounded-lg prose-code:text-sm prose-code:font-mono prose-code:border prose-code:border-slate-200
                      prose-pre:bg-slate-900 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:shadow-2xl
                      prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-8 prose-ol:pl-8
                      prose-li:text-slate-700 prose-li:mb-3 prose-li:leading-relaxed
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-8 prose-blockquote:py-4 prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-xl prose-blockquote:shadow-sm"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-12 border-t border-white/20">
            <Link 
              to="/#projects"
              className="group inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold border border-white/20 shadow-xl hover:shadow-2xl"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Projects</span>
            </Link>
            
            <div className="text-slate-300 text-center">
              <p className="text-lg">Want to discuss this project or explore collaboration? 
                <a href="mailto:saifalialjanahi@gmail.com" className="text-blue-400 hover:text-blue-300 font-semibold ml-2 underline decoration-2 underline-offset-4">
                  Let's connect
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}