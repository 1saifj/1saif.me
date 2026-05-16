import React from 'react'
import { motion } from 'framer-motion'

interface TimelineItem {
  id: string
  title: string
  company: string
  location: string
  period: string
  employmentType: string
  workMode: string
  description: string
  highlights: string[]
  focusAreas: string[]
}

export const CareerTimeline: React.FC = () => {
  const timelineItems: TimelineItem[] = [
    {
      id: 'salasto-lead',
      title: 'Lead Software Engineer',
      company: 'Salasto',
      location: 'Remote',
      period: 'Nov 2025 – Present',
      employmentType: 'Part-time',
      workMode: 'Remote',
      description:
        'Part-time engineering leadership role focused on product delivery across TypeScript, Flutter, databases, DevOps, and systems design.',
      highlights: [
        'Lead engineering work across active product initiatives in a remote part-time capacity.',
        'Contribute hands-on development across TypeScript and Flutter codebases.',
        'Support delivery decisions spanning database work, DevOps, systems design, and engineering leadership.',
      ],
      focusAreas: ['TypeScript', 'Flutter', 'Databases', 'DevOps', 'Systems Design', 'Engineering Leadership'],
    },
    {
      id: 'uok-software-engineer',
      title: 'Software Engineer',
      company: 'University of Kufa',
      location: 'Al-Najaf, Iraq',
      period: 'Apr 2023 – Present',
      employmentType: 'Full-time',
      workMode: 'On-site',
      description:
        'Dual-role position combining software engineering work with graduate services support at one of Iraq’s leading universities.',
      highlights: [
        'Support graduate employment tracking and career development initiatives.',
        'Assist graduate follow-up programs, rehabilitation services, and alumni support efforts.',
        'Develop and maintain software applications used in university operations.',
        'Provide technical support for Electronic and Communications Engineering laboratory initiatives.',
        'Built the Kufa Grad Tracking Platform and the Information Bank Smart App to support graduate monitoring and university competitions.',
      ],
      focusAreas: ['Graduate Tracking', 'University Systems', 'Career Services', 'Technical Support'],
    },
    {
      id: 'alqaseh-software-engineer',
      title: 'Software Engineer',
      company: 'Al Qaseh',
      location: 'Al-Najaf, Iraq',
      period: 'Aug 2022 – Jul 2025',
      employmentType: 'Full-time',
      workMode: 'On-site',
      description:
        'Full-time software engineering role spanning backend systems and user-facing product delivery for financial solutions.',
      highlights: [
        'Specialized in backend development with Go, PostgreSQL, and related databases, with a strong emphasis on security.',
        'Worked across backend and frontend delivery using Flutter, React, and Next.js.',
        'Built robust systems and applications designed to remain secure against operational and product risks.',
        'Combined backend reliability with user-friendly interfaces to deliver practical software solutions for clients and end users.',
      ],
      focusAreas: ['Go', 'PostgreSQL', 'Flutter', 'React', 'Next.js', 'Security'],
    },
    {
      id: 'alqaseh-backend-team-lead',
      title: 'Backend Team Lead',
      company: 'Al Qaseh',
      location: 'Najaf, Iraq',
      period: 'Oct 2023 – Jul 2024',
      employmentType: 'Part-time',
      workMode: 'On-site',
      description:
        'Part-time leadership responsibility within the same organization, focused on backend execution and team development.',
      highlights: [
        'Guided the backend team in designing, building, and maintaining systems for financial solutions.',
        'Set expectations for code quality, system reliability, and collaboration with adjacent teams.',
        'Led development of scalable APIs and services aligned with changing client needs.',
        'Mentored team members and supported a productive engineering environment.',
      ],
      focusAreas: ['Backend Leadership', 'APIs', 'System Reliability', 'Mentoring'],
    },
    {
      id: 'morabaa-web-developer',
      title: 'Web Developer',
      company: 'Morabaa Software Solutions',
      location: 'Al-Najaf, Iraq',
      period: 'Jan 2022 – Jul 2022',
      employmentType: 'Full-time',
      workMode: 'On-site',
      description:
        'Frontend web development role focused on structure, usability, performance, and responsive implementation.',
      highlights: [
        'Structured and designed web pages with close attention to usability and clarity.',
        'Built features to improve the user experience while balancing functional and visual design.',
        'Optimized interfaces for smartphones and responsive behavior.',
        'Developed reusable frontend code and maintained brand consistency across pages.',
        'Improved page speed and scalability across web deliverables.',
      ],
      focusAreas: ['JavaScript', 'React', 'HTML', 'CSS', 'Next.js', 'Svelte'],
    },
    {
      id: 'alaaml-frontend-developer',
      title: 'Frontend Developer',
      company: 'Al-Aaml',
      location: 'Al-Najaf, Iraq',
      period: 'Aug 2021 – Oct 2021',
      employmentType: 'Full-time',
      workMode: 'On-site',
      description: 'Early frontend role centered on Flutter-based interface development.',
      highlights: [
        'Worked as a frontend developer in an on-site capacity.',
        'Contributed Flutter-based interface implementation for product delivery.',
      ],
      focusAreas: ['Flutter'],
    },
  ]

  return (
    <div className="w-full border-t border-slate-200 dark:border-zinc-800">
      <div className="flex flex-col">
        {timelineItems.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.08 }}
            className="group flex flex-col lg:flex-row border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors"
          >
            <div className="relative lg:w-[280px] shrink-0 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800 flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-zinc-500 block">
                {item.period}
              </span>
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-slate-900 dark:text-white block">
                {item.company}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-500">
                {item.employmentType} · {item.workMode}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-500">{item.location}</span>
            </div>

            <div className="p-8 lg:p-10 flex-1">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-4 group-hover:translate-x-1 transition-transform duration-300">
                {item.title}
              </h3>

              <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-3xl">
                {item.description}
              </p>

              <div className="grid grid-cols-1 gap-8">
                <div>
                  <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-zinc-600 mb-4">
                    Key Highlights
                  </span>
                  <ul className="flex flex-col gap-3">
                    {item.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed flex items-start gap-3"
                      >
                        <span className="shrink-0 mt-1.5 w-1.5 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded-full"></span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-zinc-800/70 flex flex-wrap gap-2">
                {item.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
