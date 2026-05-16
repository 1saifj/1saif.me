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
    <section id="skills" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-100 dark:border-zinc-900">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header */}
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="text-5xl sm:text-6xl md:text-8xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none mb-6"
            >
              Technical<br/>
              <span className="text-slate-400 dark:text-zinc-600 border-b border-transparent">Arsenal.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
              className="text-lg text-slate-600 dark:text-zinc-400 max-w-[50ch] leading-relaxed mt-10"
            >
              The languages, frameworks, and infrastructure I leverage to build resilient, high-performance systems.
            </motion.p>
          </div>
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
