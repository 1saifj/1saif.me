import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from '@phosphor-icons/react'
import { ContactForm } from './ContactForm'
import { Newsletter } from './Newsletter'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

export const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-100 dark:border-zinc-900">
      
      {/* Container wrapper for header */}
      <div className="container mx-auto px-6 max-w-7xl relative z-10 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="text-4xl sm:text-6xl md:text-8xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none mb-6"
            >
              Let's Build<br/>
              <span className="text-slate-400 dark:text-zinc-600 border-b border-transparent">Something Great.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
              className="text-lg text-slate-600 dark:text-zinc-400 max-w-[50ch] leading-relaxed mt-10"
            >
              Open for new opportunities, technical consultation, and architectural discussions.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full bg-slate-900 dark:bg-white opacity-40"></span>
              <span className="relative inline-flex h-3 w-3 bg-slate-900 dark:bg-white"></span>
            </span>
            <span className="text-slate-900 dark:text-white text-[10px] font-bold tracking-[0.2em] uppercase">Status: Available</span>
          </motion.div>
        </div>
      </div>

      {/* Full Bleed Structural Grid Base */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="w-full border-t border-slate-200 dark:border-zinc-800"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column: Hard Structural Data Rows */}
          <motion.div variants={itemVariants} className="flex flex-col border-r border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/10">
             
            <a href="mailto:saifalialjanahi@gmail.com" className="group flex flex-col md:flex-row md:items-center justify-between p-10 lg:p-16 border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition-colors gap-6">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500">Email Address</span>
              <div className="flex items-center gap-4">
                 <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors">saifalialjanahi@gmail.com</span>
                 <ArrowUpRight className="w-6 h-6 text-slate-400 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </div>
            </a>

            <a href="tel:+96407822084101" className="group flex flex-col md:flex-row md:items-center justify-between p-10 lg:p-16 border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition-colors gap-6">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500">Phone & WhatsApp</span>
              <div className="flex items-center gap-4">
                 <span className="font-mono text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors">+964 782 208 4101</span>
                 <ArrowUpRight className="w-6 h-6 text-slate-400 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </div>
            </a>

            <div className="flex flex-col md:flex-row md:items-center justify-between p-10 lg:p-16 border-b border-slate-200 dark:border-zinc-800 gap-6">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500">Location Base</span>
              <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Al-Najaf, Iraq</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between p-10 lg:p-16 border-b border-slate-200 dark:border-zinc-800 gap-6">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500">Timezone</span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-tight">9 AM - 5 PM (GMT+3)</span>
            </div>

            <div className="flex md:items-center justify-between h-full bg-white dark:bg-[#0a0a0a]">
               <a href="https://github.com/1saifj" target="_blank" rel="noopener noreferrer" className="group flex-1 flex flex-col items-center justify-center py-16 border-r border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/20 transition-colors">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-900 dark:text-white group-hover:-translate-y-1 transition-transform">GitHub</span>
               </a>
               <a href="https://www.linkedin.com/in/1saifj" target="_blank" rel="noopener noreferrer" className="group flex-1 flex flex-col items-center justify-center py-16 hover:bg-slate-50 dark:hover:bg-zinc-900/20 transition-colors">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-900 dark:text-white group-hover:-translate-y-1 transition-transform">LinkedIn</span>
               </a>
            </div>

          </motion.div>

          {/* Right Column: Direct Message Form */}
          <motion.div variants={itemVariants} className="p-10 lg:p-16 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-16">
                 <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white">Direct Message</h3>
                 <a
                    href="https://calendly.com/saifalialjanahi/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 transition-colors hover:text-slate-900 dark:hover:text-white"
                  >
                    Or Schedule a Call
                    <ArrowUpRight strokeWidth="2" className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                 </a>
              </div>
              <ContactForm />
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Newsletter Block */}
      <Newsletter />
      
      {/* Universal Footer Alignment */}
      <div className="border-t border-slate-200 dark:border-zinc-800 py-10 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 dark:text-zinc-600 text-xs font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} Saif Aljanahi.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-600">
             <span className="hidden sm:inline">Engineered with React & Tailwind</span>
             <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
             <span>System Online</span>
          </div>
        </div>
      </div>

    </section>
  )
}
