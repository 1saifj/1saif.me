import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Item = {
  status: 'shipping' | 'building' | 'reading' | 'open'
  label: string
  detail: string
}

const ITEMS: Item[] = [
  {
    status: 'shipping',
    label: 'AlQaseh',
    detail: 'Card-issuing service hardening — idempotency, reconciliation, PCI-DSS scope.',
  },
  {
    status: 'building',
    label: 'Salasto',
    detail: 'Backend infra: PIN auth, Redis-backed sessions, Drizzle migrations on Postgres.',
  },
  {
    status: 'reading',
    label: 'On the desk',
    detail: 'Designing Data-Intensive Applications · Kleppmann; payment-rail postmortems.',
  },
  {
    status: 'open',
    label: 'Open to',
    detail: 'Staff/Principal backend roles · payments, fintech, infra teams.',
  },
]

const statusStyles: Record<Item['status'], string> = {
  shipping: 'bg-emerald-500',
  building: 'bg-sky-500',
  reading: 'bg-amber-500',
  open: 'bg-slate-900 dark:bg-white',
}

export const Now: React.FC = () => {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="now"
      aria-labelledby="now-heading"
      className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] relative overflow-hidden border-t border-slate-100 dark:border-zinc-900"
    >
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-12 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-8">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500 dark:text-zinc-500 mb-6 flex items-center gap-3">
              <span>§ 00 — Now</span>
              <span className="h-px w-12 bg-slate-300 dark:bg-zinc-700" />
              <span>Last updated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            <h2
              id="now-heading"
              className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tighter leading-[0.95]"
            >
              In flight<span className="text-slate-400 dark:text-zinc-600">.</span>
            </h2>
            <p className="mt-6 max-w-[55ch] text-base md:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
              A snapshot of what I'm shipping and learning this quarter — updated as work moves.
              Inspired by <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-4 hover:text-slate-900 dark:hover:text-white">Derek Sivers' /now</a>.
            </p>
          </div>
          <div className="hidden lg:flex col-span-4 flex-col gap-3 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-zinc-500 pl-6 border-l border-slate-200 dark:border-zinc-800">
            <div className="flex justify-between"><span>Active roles</span><span className="text-slate-900 dark:text-white">2</span></div>
            <div className="flex justify-between"><span>Open to</span><span className="text-slate-900 dark:text-white">Staff / Principal</span></div>
            <div className="flex justify-between"><span>Timezone</span><span className="text-slate-900 dark:text-white">UTC+3</span></div>
          </div>
        </div>

        {/* Item grid */}
        <motion.ul
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800"
        >
          {ITEMS.map((item, i) => (
            <motion.li
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
              }}
              className="bg-white dark:bg-[#0a0a0a] p-8 md:p-10 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500 dark:text-zinc-500">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inset-0 rounded-full ${statusStyles[item.status]} opacity-50 motion-safe:animate-ping`} />
                  <span className={`relative inline-block h-2 w-2 rounded-full ${statusStyles[item.status]}`} />
                </span>
                <span className="text-slate-900 dark:text-white">{item.status}</span>
                <span className="h-px w-6 bg-slate-300 dark:bg-zinc-700" />
                <span className="tabular-nums">{(i + 1).toString().padStart(2, '0')}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tighter leading-tight">
                {item.label}
              </h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
                {item.detail}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
