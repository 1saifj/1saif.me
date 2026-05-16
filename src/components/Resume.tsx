import React from 'react'
import {
  CodeBlock,
  Database,
  DownloadSimple,
  EnvelopeSimple,
  GithubLogo,
  GlobeHemisphereWest,
  LinkedinLogo,
  MapPin,
  Phone,
  Wrench,
  ArrowUpRight
} from '@phosphor-icons/react'
import { CareerTimeline } from './CareerTimeline'

interface SkillCategory {
  name: string
  icon: React.ReactNode
  skills: string[]
}

interface SelectedProject {
  title: string
  context: string
  description: string
  tags: string[]
}

export const Resume: React.FC = () => {
  const handleDownloadResume = () => {
    const link = document.createElement('a')
    link.href = '/cv.html'
    link.target = '_blank'
    link.click()
  }

  const skillCategories: SkillCategory[] = [
    {
      name: 'Languages',
      icon: <CodeBlock weight="bold" className="w-5 h-5" />,
      skills: ['TypeScript', 'Go', 'Dart', 'JavaScript'],
    },
    {
      name: 'Frontend',
      icon: <GlobeHemisphereWest weight="bold" className="w-5 h-5" />,
      skills: ['Flutter', 'React', 'Next.js'],
    },
    {
      name: 'Backend & Data',
      icon: <Database weight="bold" className="w-5 h-5" />,
      skills: ['Express.js', 'Databases', 'BFF'],
    },
    {
      name: 'Engineering',
      icon: <Wrench weight="bold" className="w-5 h-5" />,
      skills: ['DevOps', 'Systems Design', 'Security', 'Engineering Leadership', 'I2C'],
    },
  ]

  const selectedProjects: SelectedProject[] = [
    {
      title: 'Kufa Grad Tracking Platform',
      context: 'University of Kufa',
      description:
        'Graduate monitoring platform built to track career outcomes and support alumni development across university follow-up programs.',
      tags: ['Graduate Tracking', 'Career Outcomes', 'Alumni Support'],
    },
    {
      title: 'Information Bank Smart App',
      context: 'University of Kufa',
      description:
        'Application system for university contests and competitions, created to improve student engagement and support institutional activities.',
      tags: ['Competitions', 'Student Engagement', 'Institutional Tools'],
    },
  ]

  return (
    <section
      id="resume"
      className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-200 dark:border-zinc-800"
    >
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Block */}
        <div className="mb-16 border-b-2 border-slate-900 dark:border-white pb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 font-mono block mb-6">
              [ Document: Curriculum Vitae ]
            </span>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
              SAIF <br/>
              ALJANAHI
            </h2>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase mb-6">
              Lead Software Engineer
            </p>
            <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-[62ch] font-medium leading-relaxed border-l-4 border-slate-200 dark:border-zinc-800 pl-6">
              Lead software engineer with experience across startup and university environments. Currently
              contributing part-time at Salasto and full-time at the University of Kufa, with stronger depth
              in backend systems and hands-on work spanning TypeScript, Go, Flutter, databases, DevOps, and
              systems design.
            </p>
          </div>

          <button
            onClick={handleDownloadResume}
            className="group flex flex-col items-center justify-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 h-40 w-40 shrink-0 transition-all hover:bg-slate-800 dark:hover:bg-slate-200 hover:-translate-y-2 relative"
          >
            <DownloadSimple weight="bold" className="w-8 h-8" />
            <span className="text-[10px] text-center font-bold tracking-[0.2em] uppercase">Export RAW</span>
            <div className="absolute inset-0 border border-slate-900 dark:border-white translate-x-2 translate-y-2 -z-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300"></div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 dark:bg-zinc-800 border-x border-slate-200 dark:border-zinc-800">
          
          {/* Sidebar Area */}
          <div className="lg:col-span-4 flex flex-col gap-px bg-slate-200 dark:bg-zinc-800">
            
            {/* Contact Matrix */}
            <div className="p-8 lg:p-12 bg-slate-50 dark:bg-[#050505]">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-zinc-800 pb-4">
                Identity Nodes
              </h3>
              <ul className="space-y-6 text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase font-mono">
                <li className="flex items-center gap-4">
                  <MapPin weight="bold" className="w-5 h-5 text-slate-400 dark:text-zinc-600" />
                  <span>Najaf, Iraq</span>
                </li>
                <li className="flex items-center gap-4">
                  <Phone weight="bold" className="w-5 h-5 text-slate-400 dark:text-zinc-600" />
                  <span>+964 782 208 4101</span>
                </li>
                <li className="flex items-center gap-4 group">
                  <EnvelopeSimple weight="bold" className="w-5 h-5 text-slate-400 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  <a href="mailto:saifalialjanahi@gmail.com" className="group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors">
                    saifalialjanahi@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-4 group">
                  <GlobeHemisphereWest weight="bold" className="w-5 h-5 text-slate-400 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  <a href="https://www.1saif.me" className="group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors">
                    www.1saif.me
                  </a>
                </li>
                <li className="flex items-center gap-4 group">
                  <LinkedinLogo weight="bold" className="w-5 h-5 text-slate-400 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  <a href="https://linkedin.com/in/1saifj" target="_blank" rel="noopener noreferrer" className="group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors">
                    linkedin.com/in/1saifj
                  </a>
                </li>
                <li className="flex items-center gap-4 group">
                  <GithubLogo weight="bold" className="w-5 h-5 text-slate-400 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  <a href="https://github.com/1saifj" target="_blank" rel="noopener noreferrer" className="group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors">
                    github.com/1saifj
                  </a>
                </li>
              </ul>
            </div>

            {/* Linguistics */}
            <div className="p-8 lg:p-12 bg-slate-50 dark:bg-[#050505]">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-zinc-800 pb-4">
                Languages
              </h3>
              <div className="space-y-6 text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase font-mono">
                <div className="flex flex-col gap-2 border-l border-slate-200 dark:border-zinc-800 pl-4">
                  <span className="text-slate-500 dark:text-zinc-500 text-[10px] tracking-widest">Arabic</span>
                  <span>Native Implementation</span>
                </div>
                <div className="flex flex-col gap-2 border-l border-slate-200 dark:border-zinc-800 pl-4">
                  <span className="text-slate-500 dark:text-zinc-500 text-[10px] tracking-widest">English</span>
                  <span>Professional Output</span>
                </div>
              </div>
            </div>

            {/* Index Grid */}
            <div className="p-8 lg:p-12 bg-slate-50 dark:bg-[#050505] flex-1">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-zinc-800 pb-4">
                Systems & Capabilities
              </h3>
              <div className="space-y-12">
                {skillCategories.map((category) => (
                  <div key={category.name}>
                     <div className="flex items-center gap-3 mb-6 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-widest font-mono">
                      {category.icon}
                      <span>{category.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-zinc-400 bg-white dark:bg-[#0a0a0a]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Core Timeline Content */}
          <div className="lg:col-span-8 flex flex-col gap-px bg-slate-200 dark:bg-zinc-800">
            
            {/* Timeline */}
            <div className="p-8 lg:p-12 bg-white dark:bg-[#0a0a0a]">
              <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 dark:text-white mb-12 uppercase leading-none border-b border-slate-200 dark:border-zinc-800 pb-8">
                Execution Timeline
              </h3>
              <div className="-mt-8">
               <CareerTimeline />
              </div>
            </div>

            {/* Selected Ops */}
            <div className="p-8 lg:p-12 bg-white dark:bg-[#0a0a0a]">
              <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 dark:text-white mb-12 uppercase leading-none border-b border-slate-200 dark:border-zinc-800 pb-8">
                Selected Ops
              </h3>
              <div className="flex flex-col border border-slate-200 dark:border-zinc-800">
                {selectedProjects.map((project, idx) => (
                  <article
                    key={project.title}
                    className={`p-8 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors flex flex-col lg:flex-row gap-6 lg:gap-12 ${idx !== 0 ? 'border-t border-slate-200 dark:border-zinc-800' : ''}`}
                  >
                     <div className="lg:w-48 shrink-0 font-mono font-bold uppercase text-[10px] tracking-widest text-slate-400 dark:text-zinc-500 flex flex-col gap-4">
                        <span className="block border-b-2 border-slate-900 dark:border-white pb-2 w-fit">
                          {project.context}
                        </span>
                     </div>
                     <div className="flex-1">
                        <h4 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">
                          {project.title}
                        </h4>
                        <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-8">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-zinc-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                     </div>
                  </article>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
