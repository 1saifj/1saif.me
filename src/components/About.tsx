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
      title: "Backend systems",
      description: "Go services on Postgres + Redis. Typed boundaries, idempotent writes, careful migrations."
    },
    {
      title: "Payment infrastructure",
      description: "Money-movement code: card issuing, reconciliation, dedup, PCI-DSS scope. Optimistic and pessimistic locking where each belongs."
    },
    {
      title: "API design",
      description: "REST + gRPC contracts with explicit schemas. OpenAPI for partners, generated clients, versioned without breaking callers."
    },
    {
      title: "Team leadership",
      description: "Backend team lead at AlQaseh. Code review, on-call rotation, hiring loops, technical mentorship."
    },
    {
      title: "Frontend depth",
      description: "React + TypeScript for product UIs; Flutter for mobile. Design-system thinking and accessibility as defaults."
    },
    {
      title: "DevOps & delivery",
      description: "Docker, GitHub Actions, blue/green deploys, structured logs, alerting that paged me only when it should."
    }
  ]

  return (
    <section id="about" className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-100 dark:border-zinc-900">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left Column - Big Text & Narrative */}
          <motion.div variants={itemVariants} className="lg:col-span-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800 pb-12 lg:pb-0 lg:pr-16">
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500 dark:text-zinc-500 mb-6 flex items-center gap-3">
                <span>§ 01 — About</span>
                <span className="h-px w-12 bg-slate-300 dark:bg-zinc-700" />
                <span>Operating Manual</span>
              </div>
              <motion.h2
                className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-10"
              >
                Lead.<br/>
                <span className="text-slate-400 dark:text-zinc-600">Architect.</span><br/>
                <span className="opacity-50" style={{ WebkitTextStroke: '1px', WebkitTextFillColor: 'transparent' }}>Execute.</span>
              </motion.h2>
              
              <div className="space-y-6 text-base md:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                <p>
                  I write the parts of the system that have to keep working — payment
                  rails, identity, ledgers, the boundaries between services. Mostly
                  <strong className="text-slate-900 dark:text-white"> Go and Postgres</strong>,
                  with TypeScript on the edges and Flutter when something has to ship to a phone.
                </p>
                <p>
                  Backend lead at <strong className="text-slate-900 dark:text-white">AlQaseh</strong>,
                  building card-issuing and reconciliation infrastructure under PCI-DSS scope.
                  Part-time at <strong className="text-slate-900 dark:text-white">Salasto</strong>
                  {' '}on backend delivery and team support. Previously: graduate
                  tracking platform for the University of Kufa, internal tooling, and one
                  published paper on CNN-LSTM fall detection.
                </p>
                <p>
                  Style: small reviewable PRs, strict types at the boundary, observability
                  before optimization, no clever code where a boring solution works.
                </p>
              </div>
            </div>

            {/* Numeric anchor block — aligned with hero */}
            <div className="grid grid-cols-3 border-t border-l border-slate-200 dark:border-zinc-800 mt-12">
              <div className="p-6 border-r border-b border-slate-200 dark:border-zinc-800">
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter mb-1 tabular-nums">2020</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Shipping since</div>
              </div>
              <div className="p-6 border-r border-b border-slate-200 dark:border-zinc-800">
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter mb-1 tabular-nums">2</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Concurrent roles</div>
              </div>
              <div className="p-6 border-r border-b border-slate-200 dark:border-zinc-800">
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter mb-1 tabular-nums">Lead</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Backend team</div>
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
