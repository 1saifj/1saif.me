import React from 'react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
}

export const About: React.FC = () => {
  const expertises = [
    {
      title: "Full-Stack Development",
      description: "Expert in Golang, TypeScript, React, and modern web technologies for building scalable applications"
    },
    {
      title: "Backend Architecture", 
      description: "Specialized in PostgreSQL, microservices, and clean architecture principles for enterprise systems"
    },
    {
      title: "Security & Performance",
      description: "PCI DSS compliance, end-to-end encryption, and performance optimization achieving 99.9% uptime"
    },
    {
      title: "Team Leadership",
      description: "Led teams of 5+ developers, mentored junior staff, and improved code quality by 60%"
    },
    {
      title: "System Architecture",
      description: "Designed systems handling 10,000+ concurrent users and $1M+ monthly transaction volume"
    },
    {
      title: "DevOps & Testing",
      description: "CI/CD pipelines, automated testing, and comprehensive E2E testing practices"
    }
  ]

  return (
    <section id="about" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-100 dark:border-zinc-900">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left Column - Big Text & Narrative */}
          <motion.div variants={itemVariants} className="lg:col-span-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800 pb-16 lg:pb-0 lg:pr-16">
            <div>
              <motion.h2 
                className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none mb-12"
              >
                Lead.<br/>
                <span className="text-slate-400 dark:text-zinc-600">Architect.</span><br/>
                <span className="opacity-50" style={{ WebkitTextStroke: '1px', WebkitTextFillColor: 'transparent' }}>Execute.</span>
              </motion.h2>
              
              <div className="space-y-8 text-base md:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                <p>
                  As a Full-Stack Engineer with deep expertise in <strong className="text-slate-900 dark:text-white">Golang, TypeScript, and Clean Architecture</strong>, 
                  I specialize in building mission-critical financial systems that process millions of dollars 
                  in transactions while maintaining the strictest security standards.
                </p>
                <p>
                  Currently serving as Backend Team Lead at AlQaseh, I architect and maintain enterprise-grade 
                  financial systems while mentoring developers and driving technical innovation. My absolute focus on 
                  performance optimization has resulted in systems serving thousands of concurrent users with sub-200ms response times globally.
                </p>
              </div>
            </div>

            {/* Brutalist KPI Block */}
            <div className="flex border-t border-l border-slate-200 dark:border-zinc-800 mt-16">
              <div className="flex-1 p-8 border-r border-b border-slate-200 dark:border-zinc-800">
                <div className="text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter mb-2">3+</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Years Expertise</div>
              </div>
              <div className="flex-1 p-8 border-r border-b border-slate-200 dark:border-zinc-800">
                <div className="text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter mb-2">99.9%</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">System Uptime</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Matrix List of Capabilities */}
          <motion.div variants={itemVariants} className="lg:col-span-6 border-b border-slate-200 dark:border-zinc-800">
            {expertises.map((expertise, index) => (
              <div 
                key={index}
                className="group p-8 lg:p-12 border-t border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors flex flex-col md:flex-row md:items-start gap-4 md:gap-8"
              >
                <span className="font-mono text-xl font-bold text-slate-300 dark:text-zinc-700 tracking-tighter shrink-0 mt-1">
                  0{index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-xl md:text-2xl text-slate-900 dark:text-white mb-2 tracking-tight">
                    {expertise.title}
                  </h4>
                  <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    {expertise.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
