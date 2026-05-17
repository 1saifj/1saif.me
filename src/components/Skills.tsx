import React from 'react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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

export const Skills: React.FC = () => {
  const skillCategories = [
    {
      id: "languages",
      name: "Programming Languages",
      skills: ["Go", "Python", "JavaScript", "TypeScript", "Dart", "C#"],
    },
    {
      id: "backend",
      name: "Backend & Databases",
      skills: ["PostgreSQL", "Redis", "REST APIs", "gRPC", "Node.js"],
    },
    {
      id: "frontend",
      name: "Frontend Technologies",
      skills: ["React", "Next.js", "Flutter", "HTML/CSS", "Tailwind CSS"],
    },
    {
      id: "tools",
      name: "Tools & DevOps",
      skills: ["Git", "Docker", "Linux", "PCI-DSS", "Architecture"],
    }
  ]

  return (
    <section id="skills" className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-100 dark:border-zinc-900">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header */}
        <div className="mb-12 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500 dark:text-zinc-500 mb-6 flex items-center gap-3"
            >
              <span>§ 02 — Stack</span>
              <span className="h-px w-12 bg-slate-300 dark:bg-zinc-700" />
              <span>{skillCategories.reduce((acc, c) => acc + c.skills.length, 0).toString().padStart(2,'0')} Tools</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-6"
            >
              Technical<br/>
              <span className="text-slate-400 dark:text-zinc-600">Arsenal.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
              className="text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-[55ch] leading-relaxed mt-6"
            >
              The languages, frameworks, and infrastructure I leverage to build resilient, high-performance systems.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex col-span-4 flex-col gap-3 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-zinc-500 pl-6 border-l border-slate-200 dark:border-zinc-800 pb-2"
          >
            {skillCategories.map(c => (
              <div key={c.id} className="flex justify-between">
                <span>{c.name.split('&')[0].trim().split(' ')[0]}</span>
                <span className="text-slate-900 dark:text-white">{c.skills.length}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Brutalist Skills List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full border-t border-slate-200 dark:border-zinc-800"
        >
          {skillCategories.map((category, index) => (
            <motion.div 
              key={category.id}
              variants={itemVariants}
              className="group flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors"
            >
              {/* Category Meta */}
              <div className="w-full lg:w-1/3 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800 flex items-center lg:items-start gap-6">
                <span className="font-mono text-3xl font-bold tracking-tighter text-slate-300 dark:text-zinc-800">
                  0{index + 1}
                </span>
                <div>
                   <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                     {category.name}
                   </h3>
                </div>
              </div>

              {/* Skills Content Grid */}
              <div className="w-full lg:w-2/3 p-8 lg:p-12">
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {category.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="text-sm font-bold tracking-widest uppercase text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </section>
  )
}
