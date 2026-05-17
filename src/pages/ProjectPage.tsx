import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, ArrowUpRight, GithubLogo, Wrench, CodeBlock, 
  GlobeHemisphereWest, House, LockKey, Buildings 
} from '@phosphor-icons/react'
import { projects as projectFiles } from '../utils/contentLoader'
import { projectSchema, Language, SourceType } from '../schemas/projectSchema'
import { findContentBySlug } from '../utils/slugUtils'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'

const SourceConfigMap: Record<SourceType, { icon: React.ReactNode, label: string }> = {
  'open-source': { icon: <GlobeHemisphereWest weight="duotone" className="w-5 h-5" />, label: 'Open Source' },
  'private': { icon: <LockKey weight="duotone" className="w-5 h-5" />, label: 'Private' },
  'company': { icon: <Buildings weight="duotone" className="w-5 h-5" />, label: 'Company' }
}

export const ProjectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [isScrolled, setIsScrolled] = useState(false)
  const [contentHtml, setContentHtml] = useState<string>('')
  
  useEffect(() => {
    window.scrollTo(0, 0)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
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
  
  if (!slug) return <ErrorView title="Invalid URL" desc="No project identifier was provided in the URL." />
  const projectFile = findContentBySlug(projectFiles, slug)
  if (!projectFile) return <ErrorView title="Project Not Found" desc="The project you're looking for doesn't exist or has been moved." />

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
    return <ErrorView title="Invalid Project Data" desc="This project has corrupted or invalid metadata." />
  }

  const SourceConfig = SourceConfigMap[project.sourceType]

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#0a0a0a] border-x border-slate-200 dark:border-zinc-800 max-w-[100vw] overflow-x-hidden">
      
      {/* Brutalist Top Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all border-b border-slate-200 dark:border-zinc-800 ${
        isScrolled ? 'bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md' : 'bg-white dark:bg-[#0a0a0a]'
      }`}>
        <div className="container mx-auto px-6 max-w-7xl h-14 flex items-center justify-between">
          <nav className="flex items-center text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500">
            <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
            <span className="mx-4 text-slate-300 dark:text-zinc-700">/</span>
            <Link to="/#projects" className="hover:text-slate-900 dark:hover:text-white transition-colors">Projects</Link>
            <span className="mx-4 text-slate-300 dark:text-zinc-700">/</span>
            <span className="text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-xs block">
              {project.name}
            </span>
          </nav>
          <Link to="/" className="hidden sm:block font-mono text-sm tracking-tighter uppercase text-slate-900 dark:text-white hover:opacity-70 transition-opacity">
            [ SA ]
          </Link>
        </div>
      </header>

      {/* Hero Header Area */}
      <section className="pt-24 md:pt-28 pb-12 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="grid grid-cols-12 gap-6 items-end"
          >
            <div className="col-span-12 lg:col-span-9">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500 dark:text-zinc-500 mb-6 flex items-center gap-3">
                <span>§ Case Study</span>
                <span className="h-px w-10 bg-slate-300 dark:bg-zinc-700" />
                <span>{project.language}</span>
                <span className="h-px w-10 bg-slate-300 dark:bg-zinc-700" />
                <span>{SourceConfig.label}</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-6">
                {project.name}
              </h1>
              <div className="h-px w-24 bg-slate-900 dark:bg-white mb-6" />
              <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 font-medium leading-relaxed max-w-[60ch] mb-10">
                {project.description}
              </p>
            </div>
            <div className="hidden lg:flex col-span-3 flex-col gap-3 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-zinc-500 pl-6 border-l border-slate-200 dark:border-zinc-800 pb-6">
              <div className="flex justify-between"><span>Status</span><span className="text-slate-900 dark:text-white">{project.wip ? 'In Progress' : 'Shipped'}</span></div>
              <div className="flex justify-between"><span>Source</span><span className="text-slate-900 dark:text-white">{SourceConfig.label}</span></div>
              <div className="flex justify-between"><span>Stack</span><span className="text-slate-900 dark:text-white">{project.language}</span></div>
            </div>
            <div className="col-span-12">

            {/* Flat Action Buttons */}
            <div className="flex flex-col sm:flex-row border-y sm:border-r border-l border-slate-200 dark:border-zinc-800 w-full sm:w-auto">
              {(project.sourceType === 'open-source' && !project.isPrivate) ? (
                <>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none group flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 border-b sm:border-b-0 sm:border-r border-slate-900 dark:border-white transition-colors hover:bg-slate-800 dark:hover:bg-slate-200"
                  >
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Repository</span>
                    <ArrowUpRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none group flex items-center justify-center gap-3 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white px-8 py-5 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900"
                    >
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Live Build</span>
                      <ArrowUpRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                  )}
                </>
              ) : (
                <div className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-slate-50 dark:bg-zinc-900/40 text-slate-400 dark:text-zinc-600 px-8 py-5 border-y sm:border-y-0 sm:border-r border-slate-200 dark:border-zinc-800 cursor-not-allowed">
                  <LockKey weight="bold" className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Private Source</span>
                </div>
              )}
            </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <main className="border-t border-slate-200 dark:border-zinc-800">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Sidebar Meta */}
            <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800 flex flex-col pt-12 pr-6 pb-12 lg:pb-0">
               <div className="flex flex-col gap-12">
                 <div>
                   <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-zinc-600 mb-4">
                     Core Technology
                   </span>
                   <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                      <CodeBlock className="w-6 h-6" />
                      <span className="font-mono text-sm tracking-wide uppercase font-bold">{project.language}</span>
                   </div>
                 </div>

                 <div>
                   <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-zinc-600 mb-4">
                     System Status
                   </span>
                   <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                      <Wrench className="w-6 h-6" />
                      <span className="font-mono text-sm tracking-wide uppercase font-bold">
                        {project.wip ? 'In Development' : 'Production Active'}
                      </span>
                   </div>
                 </div>

                 <div>
                   <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-zinc-600 mb-4">
                     Context Segment
                   </span>
                   <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                      {SourceConfig.icon}
                      <span className="font-mono text-sm tracking-wide uppercase font-bold">{SourceConfig.label}</span>
                   </div>
                 </div>
               </div>
            </aside>

            {/* Markdown Content */}
            <article className="lg:col-span-9 pt-12 pb-24 lg:pl-16">
              {projectFile.content && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:tracking-tighter prose-headings:text-slate-900 dark:prose-headings:text-white
                    prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-slate-900 dark:prose-h2:border-white
                    prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6
                    prose-p:text-slate-600 dark:prose-p:text-zinc-400 prose-p:font-medium prose-p:leading-relaxed prose-p:mb-6
                    prose-a:text-slate-900 dark:prose-a:text-white prose-a:underline hover:prose-a:no-underline
                    prose-strong:text-slate-900 dark:prose-strong:text-white
                    prose-code:text-slate-900 dark:prose-code:text-white prose-code:bg-slate-100 dark:prose-code:bg-zinc-900 prose-code:px-2 prose-code:py-1 prose-code:font-mono prose-code:text-sm
                    prose-pre:bg-slate-50 dark:prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-zinc-800 prose-pre:rounded-none
                    prose-ul:text-slate-600 dark:prose-ul:text-zinc-400 prose-ul:font-medium
                    prose-blockquote:border-l-4 prose-blockquote:border-slate-900 dark:prose-blockquote:border-white prose-blockquote:pl-6 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-zinc-900/50 prose-blockquote:py-4 prose-blockquote:italic
                    prose-img:border prose-img:border-slate-200 dark:prose-img:border-zinc-800 prose-img:grayscale-[50%] hover:prose-img:grayscale-0 prose-img:transition-all prose-img:duration-500"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              )}
            </article>

          </div>
        </div>
      </main>

      {/* Flat Footer */}
      <div className="border-t border-slate-200 dark:border-zinc-800">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center border-x border-slate-200 dark:border-zinc-800">
           <Link 
              to="/#projects"
              className="flex-1 w-full group flex items-center justify-center p-8 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                 <ArrowLeft weight="bold" className="w-5 h-5 text-slate-900 dark:text-white transition-transform group-hover:-translate-x-1" />
                 <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-900 dark:text-white">Return to Projects</span>
              </div>
           </Link>
           <a 
             href="mailto:saifalialjanahi@gmail.com" 
             className="flex-1 w-full flex items-center justify-center p-8 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors"
           >
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">Discuss Architecture</span>
           </a>
        </div>
      </div>
    </div>
  )
}

const ErrorView = ({ title, desc }: { title: string, desc: string }) => (
  <div className="min-h-[100dvh] bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 border-x border-slate-200 dark:border-zinc-800">
    <div className="text-center max-w-md mx-auto border border-slate-200 dark:border-zinc-800 p-12">
      <CodeBlock weight="duotone" className="w-12 h-12 text-slate-900 dark:text-white mx-auto mb-8" />
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">{title}</h1>
      <p className="text-slate-500 dark:text-zinc-500 mb-12 font-medium">{desc}</p>
      <Link to="/#projects" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 font-bold text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
        <House weight="bold" className="w-4 h-4" />
        Return Home
      </Link>
    </div>
  </div>
)
