import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, GithubLogo, LinkedinLogo, EnvelopeSimple } from '@phosphor-icons/react'
import { OptimizedImage } from '../utils/imageOptimization'

export const Hero: React.FC = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, 200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -100])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative min-h-[100dvh] w-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-zinc-800 pb-20 pt-32">
      
      {/* Absolute background huge typography purely for aesthetic */}
      <motion.div 
        style={{ y: y2, opacity }}
        className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-bold text-slate-50 dark:text-[#111] whitespace-nowrap pointer-events-none select-none z-0 tracking-tighter"
      >
        ENGINEER
      </motion.div>

      {/* Structural Crosshairs */}
      <div className="absolute left-[10%] top-0 bottom-0 w-px bg-slate-100 dark:bg-zinc-900 z-0"></div>
      <div className="absolute right-[10%] top-0 bottom-0 w-px bg-slate-100 dark:bg-zinc-900 z-0"></div>

      <div className="container mx-auto px-6 relative z-10 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-0 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start justify-center text-left lg:pr-16">
            <motion.div
              initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter leading-[0.9] text-slate-900 dark:text-white mb-8 border-b-8 border-slate-900 dark:border-white pb-4 inline-block">
                SAIF <br/>
                ALJANAHI
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <p className="text-xl md:text-2xl text-slate-600 dark:text-zinc-400 max-w-2xl font-medium leading-relaxed tracking-tight">
                Full-Stack Software Engineer specializing in scalable architecture, raw aesthetics, and fluid system design.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-900 font-bold bg-slate-100 dark:bg-zinc-900 dark:text-white px-3 py-1">Golang</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-900 font-bold bg-slate-100 dark:bg-zinc-900 dark:text-white px-3 py-1">Python</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-900 font-bold bg-slate-100 dark:bg-zinc-900 dark:text-white px-3 py-1">React</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row sm:items-center gap-8 mt-12 w-full pt-8 border-t border-slate-200 dark:border-zinc-800"
            >
              <Link to="/resume" className="group bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-8 py-5 flex items-center justify-between gap-6 w-fit transition-colors shrink-0 border border-slate-900 dark:border-white">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Open Resume</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              
              <div className="flex items-center gap-8 bg-slate-50 dark:bg-zinc-900/40 px-8 py-5 border border-slate-200 dark:border-zinc-800 h-full w-full sm:w-auto overflow-hidden text-slate-400 dark:text-zinc-500">
                <a href="https://github.com/1saifj" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  <GithubLogo className="w-5 h-5" weight="bold" />
                </a>
                <a href="https://www.linkedin.com/in/1saifj" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  <LinkedinLogo className="w-5 h-5" weight="bold" />
                </a>
                <a href="mailto:saifalialjanahi@gmail.com" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  <EnvelopeSimple className="w-5 h-5" weight="bold" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column / Avatar Area */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-16 lg:mt-0 w-full">
            <motion.div 
               style={{ y: y1 }}
               initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
               animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
               transition={{ duration: 1.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
               className="relative w-full max-w-sm aspect-[4/5] group"
             >
                {/* Harsh geometric border offset */}
                <div className="absolute inset-0 border-2 border-slate-900 dark:border-white translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-6 group-hover:translate-y-6"></div>
                
                {/* Structural Image Container */}
                <div className="w-full h-full overflow-hidden border border-slate-200 dark:border-zinc-800 filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700 relative z-10 bg-slate-100 dark:bg-zinc-900">
                  <OptimizedImage
                    src="/sj_image.jpeg"
                    alt="Saif Aljanahi"
                    className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700"
                    preset="avatar"
                    customOptions={{ width: 800, height: 1000, quality: 100 }}
                  />
                  
                  {/* Digital Artifact Badge */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-white border-b-2 border-l-2 border-slate-900 p-3">
                     <OptimizedImage
                       src="/status_badge.png"
                       alt="System Status Indicator"
                       className="w-full h-full object-contain drop-shadow-sm group-hover:rotate-90 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                       preset="badge"
                     />
                  </div>
                </div>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
