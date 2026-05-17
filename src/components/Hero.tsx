import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, GithubLogo, LinkedinLogo, EnvelopeSimple } from '@phosphor-icons/react'
import { OptimizedImage } from '../utils/imageOptimization'

const STACK_TICKER = [
  'GO',
  'POSTGRES',
  'TYPESCRIPT',
  'REACT',
  'GRPC',
  'REDIS',
  'PCI-DSS',
  'FLUTTER',
  'DOCKER',
  'CLEAN-ARCH',
]

const FormatNajafTime = () => {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Baghdad',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(now)
      const hh = parts.find(p => p.type === 'hour')?.value ?? '--'
      const mm = parts.find(p => p.type === 'minute')?.value ?? '--'
      setTime(`${hh}:${mm}`)
    }
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])

  return <span className="font-mono tabular-nums">{time || '--:--'}</span>
}

export const Hero: React.FC = () => {
  const { scrollY } = useScroll()
  const portraitY = useTransform(scrollY, [0, 1000], [0, 120])
  const ghostY = useTransform(scrollY, [0, 1000], [0, -80])
  const ghostOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const reduceMotion = useReducedMotion()

  return (
    <section
      aria-label="Introduction"
      className="relative min-h-[100dvh] w-full bg-white dark:bg-[#0a0a0a] overflow-hidden border-b border-slate-200 dark:border-zinc-800 pb-12 lg:pb-16 pt-24 lg:pt-28"
    >
      {/* Hairline column rails — 12 vertical guides */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden lg:block z-0 text-slate-100 dark:text-zinc-900"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, transparent 0 calc(8.3333% - 1px), currentColor calc(8.3333% - 1px) 8.3333%)',
        }}
      />

      {/* Aesthetic ghost word */}
      <motion.div
        aria-hidden
        style={{ y: ghostY, opacity: ghostOpacity }}
        className="pointer-events-none select-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 text-[22vw] leading-none font-bold tracking-tighter text-slate-50 dark:text-zinc-900 whitespace-nowrap z-0"
      >
        DOSSIER
      </motion.div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Top status rail */}
        <div className="grid grid-cols-12 gap-4 items-center font-mono text-[10px] tracking-[0.22em] uppercase text-slate-500 dark:text-zinc-500 mb-12 lg:mb-16">
          <div className="col-span-12 lg:col-span-8 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-block h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available
            </span>
            <span className="h-px w-8 bg-slate-300 dark:bg-zinc-700" />
            <span>Najaf · UTC+3</span>
            <span className="h-px w-8 bg-slate-300 dark:bg-zinc-700" />
            <span>Local <FormatNajafTime /></span>
          </div>
          <div className="hidden lg:flex col-span-4 justify-end items-center gap-3">
            <span>File 001 · Identity</span>
            <span className="h-px w-8 bg-slate-300 dark:bg-zinc-700" />
            <span className="text-slate-900 dark:text-white">/index</span>
          </div>
        </div>

        {/* Asymmetric main lockup — 5fr / 3fr */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_3fr] gap-12 lg:gap-16 items-start">
          {/* LEFT — Identity block */}
          <div className="flex flex-col">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.05 }}
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500 dark:text-zinc-500 mb-6 flex flex-wrap items-center gap-3"
            >
              <span>§ Subject</span>
              <span className="h-px w-10 bg-slate-300 dark:bg-zinc-700" />
              <span className="text-slate-900 dark:text-white">Lead Software Engineer</span>
              <span className="h-px w-10 bg-slate-300 dark:bg-zinc-700" />
              <span>Backend · Financial Systems</span>
            </motion.div>

            <h1 className="text-[clamp(3rem,9vw,8rem)] font-bold tracking-tighter leading-[0.86] text-slate-900 dark:text-white">
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.1 }}
                className="block"
              >
                Saif
              </motion.span>
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.2 }}
                className="block text-slate-300 dark:text-zinc-700"
                style={{ WebkitTextStroke: '1px currentColor', WebkitTextFillColor: 'transparent' }}
              >
                Aljanahi.
              </motion.span>
            </h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.32 }}
              className="mt-8 max-w-[58ch] text-base md:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed border-l-2 border-slate-900 dark:border-white pl-5"
            >
              Backend engineer working on the parts banks can't afford to get wrong —
              payments, identity, ledgers. Go + Postgres, type-safe APIs, PCI-DSS in scope.
              Leading backend at AlQaseh; contributing part-time at Salasto.
            </motion.p>

            {/* Numeric readout — durable, verifiable signals */}
            <motion.dl
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.42 }}
              className="mt-10 grid grid-cols-3 gap-px bg-slate-200 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 max-w-xl"
            >
              <div className="bg-white dark:bg-[#0a0a0a] p-5">
                <dt className="font-mono text-[9px] tracking-[0.22em] uppercase text-slate-500 dark:text-zinc-500">Shipping since</dt>
                <dd className="mt-2 text-3xl font-bold tracking-tighter text-slate-900 dark:text-white tabular-nums">2020</dd>
              </div>
              <div className="bg-white dark:bg-[#0a0a0a] p-5">
                <dt className="font-mono text-[9px] tracking-[0.22em] uppercase text-slate-500 dark:text-zinc-500">Production systems</dt>
                <dd className="mt-2 text-3xl font-bold tracking-tighter text-slate-900 dark:text-white tabular-nums">04</dd>
              </div>
              <div className="bg-white dark:bg-[#0a0a0a] p-5">
                <dt className="font-mono text-[9px] tracking-[0.22em] uppercase text-slate-500 dark:text-zinc-500">Peer-reviewed</dt>
                <dd className="mt-2 text-3xl font-bold tracking-tighter text-slate-900 dark:text-white tabular-nums">01<span className="text-slate-400 dark:text-zinc-700"> paper</span></dd>
              </div>
            </motion.dl>

            {/* Inline action row — no card box */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-6"
            >
              <Link
                to="/resume"
                className="group inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 transition-transform duration-200 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#0a0a0a]"
              >
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase">Open Résumé</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" weight="bold" />
              </Link>

              <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-600">
                <a
                  href="https://github.com/1saifj"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2.5 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
                >
                  <GithubLogo className="w-4 h-4" weight="bold" />
                </a>
                <a
                  href="https://www.linkedin.com/in/1saifj"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2.5 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
                >
                  <LinkedinLogo className="w-4 h-4" weight="bold" />
                </a>
                <a
                  href="mailto:saifalialjanahi@gmail.com"
                  aria-label="Email"
                  className="p-2.5 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
                >
                  <EnvelopeSimple className="w-4 h-4" weight="bold" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Portrait dossier card */}
          <motion.aside
            style={reduceMotion ? undefined : { y: portraitY }}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 22, delay: 0.15 }}
            className="relative w-full max-w-md justify-self-start lg:justify-self-end"
            aria-label="Portrait"
          >
            {/* Top meta strip */}
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-slate-500 dark:text-zinc-500 mb-3">
              <span>Plate 02 · Subject</span>
              <span className="text-slate-900 dark:text-white">SA-001</span>
            </div>

            <figure className="relative aspect-[4/5] group">
              {/* Registration marks */}
              <CornerMark className="absolute -top-1 -left-1" />
              <CornerMark className="absolute -top-1 -right-1 rotate-90" />
              <CornerMark className="absolute -bottom-1 -left-1 -rotate-90" />
              <CornerMark className="absolute -bottom-1 -right-1 rotate-180" />

              <div className="relative w-full h-full overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900">
                <OptimizedImage
                  src="/sj_image.jpeg"
                  alt="Portrait of Saif Aljanahi"
                  className="w-full h-full object-cover object-center filter grayscale contrast-[1.05] group-hover:grayscale-0 transition-[filter] duration-700"
                  preset="avatar"
                  customOptions={{ width: 800, height: 1000, quality: 92 }}
                />

                {/* Scanline overlay */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.0) 2px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 3px)',
                  }}
                />

                {/* Tiny ID badge */}
                <div className="absolute bottom-0 inset-x-0 px-3 py-2 flex items-center justify-between font-mono text-[9px] tracking-[0.2em] uppercase text-white bg-black/55 backdrop-blur-[2px]">
                  <span>F · 1.4</span>
                  <span>ISO 400</span>
                  <span>1/125</span>
                  <span>SA</span>
                </div>
              </div>
            </figure>

            {/* Footer meta */}
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.22em] uppercase text-slate-500 dark:text-zinc-500">
              <div className="flex justify-between">
                <dt>Filed</dt>
                <dd className="text-slate-900 dark:text-white">2026</dd>
              </div>
              <div className="flex justify-between">
                <dt>Field</dt>
                <dd className="text-slate-900 dark:text-white">Backend</dd>
              </div>
              <div className="flex justify-between">
                <dt>Rank</dt>
                <dd className="text-slate-900 dark:text-white">Lead</dd>
              </div>
              <div className="flex justify-between">
                <dt>Cell</dt>
                <dd className="text-slate-900 dark:text-white">AlQaseh</dd>
              </div>
            </dl>
          </motion.aside>
        </div>
      </div>

      {/* Bottom focus marquee */}
      <div className="relative z-10 mt-16 lg:mt-20 border-y border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl flex items-center gap-6 py-4">
          <span className="shrink-0 font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500 dark:text-zinc-500">
            Focus ↳
          </span>
          <div className="relative flex-1 overflow-hidden">
            <motion.div
              className="flex gap-10 whitespace-nowrap"
              animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
              transition={{ duration: 38, ease: 'linear', repeat: Infinity }}
              aria-hidden
            >
              {[...STACK_TICKER, ...STACK_TICKER].map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="font-mono text-[11px] tracking-[0.25em] uppercase text-slate-900 dark:text-white flex items-center gap-3"
                >
                  <span className="inline-block w-1 h-1 bg-slate-900 dark:bg-white rotate-45" />
                  {t}
                </span>
              ))}
            </motion.div>
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white dark:from-[#0a0a0a] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white dark:from-[#0a0a0a] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}

const CornerMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    aria-hidden
    viewBox="0 0 12 12"
    className={`w-3 h-3 text-slate-900 dark:text-white ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M0 0 H6 M0 0 V6" />
  </svg>
)
