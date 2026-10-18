import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PersonStructuredData } from '../components/StructuredData'
import SEOHead from '../components/SEOHead'
import { BrandLink, LanguageButton, ThemeButton } from '../components/SiteHeader'
import { PostThumb } from '../components/PostThumb'
import { SearchButton } from '../components/SearchButton'
import { projects } from '../data/projects'
import { formatMonth, Job, jobs } from '../data/experience'
import { postText, publishedBlogs } from '../data/blogs'
import { createSlugFromTitle } from '../utils/slugUtils'
import { comma, dateLocale, Language, pick, SITE_TIME_ZONE, useLanguage } from '../i18n/language'

const copy = {
  en: {
    work: 'Work',
    blog: 'Writing',
    about: 'About',
    contact: 'Contact',
    menuLabel: 'Sections',
    name: 'Saif Aljanahi',
    intro: 'I’m a lead software engineer in Al-Najaf, Iraq. I build backend systems, the cloud infrastructure they run on, and the web and mobile apps that use them.',
    bio: <>Since 2021 I have worked on financial software, platforms for the <a href="https://grads.uokufa.edu.iq" target="_blank" rel="noreferrer">University of Kufa</a>, and backend platforms for partner businesses. I also <a href="#blog">write about</a> databases and Go, and I maintain <a href="https://github.com/1saifj/relayrook" target="_blank" rel="noreferrer">RelayRook</a>, an open-source tool for coding agents.</>,
    resume: 'Résumé',
    email: 'Email',
    experience: 'Experience',
    projects: 'Projects',
    present: 'Present',
    fullResume: 'Full résumé',
    moreWork: 'Other projects',
    allPosts: 'All posts',
    postsNote: '',
    inProgress: 'in progress',
    visit: 'Visit site',
    source: 'Source code',
    about1: 'Most of my work is on the backend and the infrastructure under it. I care about how a system behaves after it ships, so I spend real time on load tests and on keeping infrastructure in code where the team can review it.',
    about2: 'I currently lead an engineering team and work on RelayRook in my spare time. The tools I reach for most are TypeScript, Go and PostgreSQL, with Flutter for mobile.',
    contactBody: 'The best way to reach me is email:',
    footer: 'Built with React and hosted on Cloudflare Pages.',
    privacy: 'Privacy',
    portraitAlt: 'Saif Aljanahi',
    seoTitle: 'Saif Aljanahi | Lead Software Engineer in Al-Najaf, Iraq',
    seoDescription: 'Saif Aljanahi is a lead software engineer in Al-Najaf, Iraq. He builds backend platforms, cloud infrastructure and university systems with TypeScript, Go, PostgreSQL and Flutter.',
  },
  ar: {
    work: 'الأعمال',
    blog: 'المقالات',
    about: 'عنّي',
    contact: 'التواصل',
    menuLabel: 'الأقسام',
    name: 'سيف الجناحي',
    intro: 'قائد هندسة برمجيات في النجف بالعراق. أبني الأنظمة الخلفية والبنية السحابية التي تعمل عليها، وتطبيقات الويب والأجهزة المحمولة التي تستخدمها.',
    bio: <>أعمل منذ عام 2021 على برمجيات مالية، ومنصات لـ<a href="https://grads.uokufa.edu.iq" target="_blank" rel="noreferrer">جامعة الكوفة</a>، ومنصات خلفية لشركات شريكة. <a href="#blog">وأكتب</a> عن قواعد البيانات وGo، وأتولّى صيانة <a href="https://github.com/1saifj/relayrook" target="_blank" rel="noreferrer">RelayRook</a>، وهي أداة مفتوحة المصدر لوكلاء البرمجة.</>,
    resume: 'السيرة الذاتية',
    email: 'البريد الإلكتروني',
    experience: 'الخبرة',
    projects: 'المشاريع',
    present: 'حتى الآن',
    fullResume: 'السيرة الذاتية كاملة',
    moreWork: 'مشاريع أخرى',
    allPosts: 'كل المقالات',
    postsNote: 'المقالات مكتوبة بالإنجليزية.',
    inProgress: 'قيد التطوير',
    visit: 'زيارة الموقع',
    source: 'الكود المصدري',
    about1: 'يتركّز معظم عملي على الأنظمة الخلفية والبنية التحتية التي تعمل عليها. ويهمّني سلوك النظام بعد إطلاقه، لذلك أخصّص وقتاً حقيقياً لاختبارات الحمل، ولكتابة البنية التحتية ككود يراجعه الفريق.',
    about2: 'أقود حالياً فريقاً هندسياً، وأعمل على RelayRook في وقت فراغي. وأكثر ما أستخدمه TypeScript وGo وPostgreSQL، مع Flutter لتطبيقات الأجهزة المحمولة.',
    contactBody: 'أفضل طريقة للتواصل معي هي البريد الإلكتروني:',
    footer: 'بُني باستخدام React ومستضاف على Cloudflare Pages.',
    privacy: 'الخصوصية',
    portraitAlt: 'سيف الجناحي',
    seoTitle: 'سيف الجناحي | قائد هندسة برمجيات في النجف، العراق',
    seoDescription: 'سيف الجناحي قائد هندسة برمجيات في النجف، العراق. يبني المنصات الخلفية والبنية السحابية والأنظمة الجامعية باستخدام TypeScript وGo وPostgreSQL وFlutter.',
  },
}

type Copy = (typeof copy)['en']

const sectionIds = ['work', 'blog', 'about', 'contact'] as const

function formatDate(timestamp: number, language: Language): string {
  return new Intl.DateTimeFormat(dateLocale(language), { month: 'short', year: 'numeric', timeZone: SITE_TIME_ZONE }).format(new Date(timestamp))
}

export const HomePage: React.FC = () => {
  const { language } = useLanguage()
  // 'top' is the intro: no nav link is current there.
  const [activeSection, setActiveSection] = useState<(typeof sectionIds)[number] | 'top'>('top')
  const t: Copy = copy[language]
  const visiblePosts = useMemo(() => publishedBlogs.slice(0, 6), [])
  const featuredProjects = projects.slice(0, 4)
  const otherProjects = projects.slice(4)

  useEffect(() => {
    const id = window.location.hash.slice(1)

    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])

  useEffect(() => {
    const sections = ['top', ...sectionIds].flatMap(id => {
      const section = document.getElementById(id)

      return section ? [section] : []
    })

    if (!('IntersectionObserver' in window) || sections.length === 0) return undefined

    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible) {
        const visibleId = (['top', ...sectionIds] as const).find(id => id === visible.target.id)

        if (visibleId) setActiveSection(visibleId)
      }
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0.1, 0.35, 0.7] })

    sections.forEach(section => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#${id}`)
  }

  const renderNav = (className: string) => <nav className={className} aria-label={t.menuLabel}>
    {sectionIds.map(id => <a key={id} href={`#${id}`} className={activeSection === id ? 'is-active' : ''} onClick={event => { event.preventDefault(); goTo(id) }}>{t[id]}</a>)}
  </nav>

  return (
    <div className="notebook-shell">
      <SEOHead title={t.seoTitle} description={t.seoDescription} url="https://1saif.me/" image="/sj_image.jpeg" />
      <PersonStructuredData />

      <header className="notebook-header">
        <div className="notebook-header-inner">
          <BrandLink />
          {renderNav('notebook-desktop-nav')}
          <div className="notebook-header-actions">
            <SearchButton />
            <LanguageButton />
            <ThemeButton />
          </div>
        </div>
        {renderNav('notebook-mobile-nav')}
      </header>

      <main id="main-content" className="notebook-main">
        <div className="notebook-layout">
          <section id="top" className="notebook-intro" aria-labelledby="intro-title">
            <div className="notebook-hero-copy">
              <h1 id="intro-title">{t.name}</h1>
              <p className="notebook-intro-lede">{t.intro}</p>
              <p className="notebook-intro-description">{t.bio}</p>
              <p className="notebook-link-row">
                <a href="https://github.com/1saifj" target="_blank" rel="noreferrer">GitHub</a>
                <a href="https://www.linkedin.com/in/1saifj" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="mailto:saifalialjanahi@gmail.com">{t.email}</a>
                <Link to="/resume">{t.resume}</Link>
              </p>
            </div>
            <div className="notebook-portrait">
              <picture>
                <source media="(min-width: 621px)" srcSet="/sj_image-4x5.webp 480w, /sj_image.webp 800w" sizes="min(34vw, 360px)" />
                <img src="/sj_image-192.webp" alt={t.portraitAlt} width="192" height="240" {...{ fetchpriority: 'high' }} />
              </picture>
            </div>
          </section>

          <section id="work" className="notebook-section" aria-labelledby="work-title">
            <h2 id="work-title" className="notebook-section-title">{t.work}</h2>
            <div className="notebook-section-head">
              <h3 className="notebook-subtitle notebook-subtitle-first">{t.experience}</h3>
              <Link to="/resume">{t.fullResume}</Link>
            </div>
            <ol className="notebook-timeline">
              {jobs.map(job => <JobRow key={job.company} job={job} t={t} language={language} />)}
            </ol>
            <h3 className="notebook-subtitle">{t.projects}</h3>
            <div className="notebook-work-featured">
              {featuredProjects.map(project => <WorkFeature key={project.name} project={project} t={t} language={language} />)}
            </div>
            <h3 className="notebook-subtitle">{t.moreWork}</h3>
            <ul className="notebook-work-list">
              {otherProjects.map(project => <WorkItem key={project.name} project={project} t={t} language={language} />)}
            </ul>
          </section>

          <section id="blog" className="notebook-section" aria-labelledby="blog-title">
            <div className="notebook-section-head">
              <h2 id="blog-title" className="notebook-section-title">{t.blog}</h2>
              <Link to="/blog">{t.allPosts}</Link>
            </div>
            {t.postsNote && <p className="notebook-section-note">{t.postsNote}</p>}
            <div className="notebook-post-list">
              {visiblePosts.map(post => {
                const text = postText(post, language)

                return <Link className="notebook-post-row" to={`/blog/${createSlugFromTitle(post.title)}`} key={post.title}>
                <time dateTime={new Date(post.createdAt).toISOString()}>{formatDate(post.createdAt, language)}</time>
                <div lang={text.lang} dir={text.lang === 'ar' ? 'rtl' : 'ltr'}><h3>{text.title}</h3>{text.description && <p>{text.description}</p>}</div>
                <PostThumb src={post.featuredImage} />
              </Link>
              })}
            </div>
          </section>

          <section id="about" className="notebook-section" aria-labelledby="about-title">
            <h2 id="about-title" className="notebook-section-title">{t.about}</h2>
            <div className="notebook-prose">
              <p>{t.about1}</p>
              <p>{t.about2}</p>
            </div>
          </section>

          <section id="contact" className="notebook-section notebook-contact" aria-labelledby="contact-title">
            <h2 id="contact-title" className="notebook-section-title">{t.contact}</h2>
            <p>{t.contactBody} <a href="mailto:saifalialjanahi@gmail.com" dir="ltr">saifalialjanahi@gmail.com</a></p>
          </section>
        </div>
      </main>

      <footer className="notebook-footer">
        <p>© {new Date().getFullYear()} {t.name}. {t.footer}</p>
        <p className="notebook-footer-links"><a href="https://github.com/1saifj" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/1saifj" target="_blank" rel="noreferrer">LinkedIn</a><a href="/rss.xml">RSS</a><Link to="/privacy">{t.privacy}</Link></p>
      </footer>
    </div>
  )
}

const JobRow: React.FC<{ job: Job; t: Copy; language: Language }> = ({ job, t, language }) => (
  <li className={job.end ? undefined : 'is-current'}>
    <p className="notebook-timeline-period"><time dateTime={job.start}>{formatMonth(job.start, language)}</time> – {job.end ? <time dateTime={job.end}>{formatMonth(job.end, language)}</time> : t.present}</p>
    <div>
      <h4>{pick(language, job.company, job.companyAr)}</h4>
      {job.roles.map((role, index) => <p key={role.role} className="notebook-timeline-role">
        {pick(language, role.role, role.ar.role)}
        <span> · {pick(language, role.mode, role.ar.mode)}{index > 0 && <> · {formatMonth(role.start, language)} – {role.end ? formatMonth(role.end, language) : t.present}</>}</span>
      </p>)}
      <p className="notebook-timeline-summary">{pick(language, job.roles[0].summary, job.roles[0].ar.summary)}</p>
    </div>
  </li>
)

const WorkFeature: React.FC<{ project: (typeof projects)[number]; t: Copy; language: Language }> = ({ project, t, language }) => (
  <article className="notebook-feature">
    <h3><Link to={`/project/${createSlugFromTitle(project.name)}`}>{pick(language, project.name, project.ar?.name)}</Link></h3>
    <p>{pick(language, project.description, project.ar?.description)}</p>
    <p className="notebook-muted">
      {pick(language, project.role, project.ar?.role)}
      {project.wip && <>{comma(language)}{t.inProgress}</>}
      {project.url && <> · <a href={project.url} target="_blank" rel="noreferrer">{project.isPrivate ? t.visit : t.source}</a></>}
    </p>
  </article>
)

const WorkItem: React.FC<{ project: (typeof projects)[number]; t: Copy; language: Language }> = ({ project, t, language }) => (
  <li>
    <Link to={`/project/${createSlugFromTitle(project.name)}`}>{pick(language, project.name, project.ar?.name)}</Link>
    <span className="notebook-muted">{pick(language, project.role, project.ar?.role)}{project.wip && <>{comma(language)}{t.inProgress}</>}</span>
  </li>
)
