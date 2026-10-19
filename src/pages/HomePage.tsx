import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PersonStructuredData } from '../components/StructuredData'
import SEOHead from '../components/SEOHead'
import { BrandLink, LanguageButton, ThemeButton } from '../components/SiteHeader'
import { PostThumb } from '../components/PostThumb'
import { SearchButton } from '../components/SearchButton'
import { SiteFooter } from '../components/SiteFooter'
import { ContactForm } from '../components/ContactForm'
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
    contactBody: 'Send me a message with this form, or email me at',
    copyEmail: 'Copy',
    copiedEmail: 'Copied',
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
    bio: <>أعمل منذ عام 2021 على برمجيات مالية، ومنصات لـ<a href="https://grads.uokufa.edu.iq" target="_blank" rel="noreferrer">جامعة الكوفة</a>، وأنظمة خلفية لشركات شريكة. <a href="#blog">وأكتب</a> عن قواعد البيانات وGo، وأتولّى صيانة <a href="https://github.com/1saifj/relayrook" target="_blank" rel="noreferrer">RelayRook</a>، وهي أداة مفتوحة المصدر لوكلاء البرمجة.</>,
    resume: 'السيرة الذاتية',
    email: 'البريد الإلكتروني',
    experience: 'الخبرة',
    projects: 'المشاريع',
    present: 'حتى الآن',
    fullResume: 'السيرة الذاتية الكاملة',
    moreWork: 'مشاريع أخرى',
    allPosts: 'كل المقالات',
    postsNote: 'المقالات مكتوبة بالإنجليزية.',
    inProgress: 'قيد التطوير',
    visit: 'زيارة الموقع',
    source: 'الكود المصدري',
    about1: 'يتركّز معظم عملي على الأنظمة الخلفية والبنية التحتية التي تعمل عليها. ويهمّني سلوك النظام بعد إطلاقه، لذلك أخصّص وقتاً حقيقياً لاختبارات الحمل، ولكتابة البنية التحتية ككود يراجعه الفريق.',
    about2: 'أقود حالياً فريقاً هندسياً، وأعمل على RelayRook في وقت فراغي. وأكثر ما أستخدمه TypeScript وGo وPostgreSQL، مع Flutter لتطبيقات الأجهزة المحمولة.',
    contactBody: 'أرسل لي رسالة عبر هذا النموذج، أو راسلني على',
    copyEmail: 'نسخ',
    copiedEmail: 'تم النسخ',
    portraitAlt: 'سيف الجناحي',
    seoTitle: 'سيف الجناحي | قائد هندسة برمجيات في النجف، العراق',
    seoDescription: 'سيف الجناحي قائد هندسة برمجيات في النجف، العراق. يبني الأنظمة الخلفية والبنية السحابية والأنظمة الجامعية باستخدام TypeScript وGo وPostgreSQL وFlutter.',
  },
}

type Copy = (typeof copy)['en']

const sectionIds = ['work', 'blog', 'about', 'contact'] as const

const CONTACT_EMAIL = 'hello@1saif.me'

function formatDate(timestamp: number, language: Language): string {
  return new Intl.DateTimeFormat(dateLocale(language), { month: 'short', year: 'numeric', timeZone: SITE_TIME_ZONE }).format(new Date(timestamp))
}

export const HomePage: React.FC = () => {
  const { language } = useLanguage()
  // 'top' is the intro: no nav link is current there.
  const [activeSection, setActiveSection] = useState<(typeof sectionIds)[number] | 'top'>('top')
  const emailLink = useRef<HTMLAnchorElement>(null)
  const t: Copy = copy[language]
  const visiblePosts = useMemo(() => publishedBlogs.slice(0, 6), [])
  const featuredProjects = projects.slice(0, 4)
  const otherProjects = projects.slice(4)

  useEffect(() => {
    const id = window.location.hash.slice(1)

    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])

  // The current section is the last one whose top has passed 30% of the screen; at the bottom of the page it is
  // the last section, which can never scroll that far up. A ratio-based observer missed both the tall Work section
  // and Contact.
  // Set while a nav click scrolls: the clicked section stays marked even when the page cannot scroll it to the top.
  const pinned = useRef(false)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0

      if (pinned.current) return
      const line = window.innerHeight * 0.3
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      const passed = (['top', ...sectionIds] as const).filter(id => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= line)

      setActiveSection(atEnd ? sectionIds[sectionIds.length - 1] : passed[passed.length - 1] ?? 'top')
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const goTo = (id: (typeof sectionIds)[number]) => {
    setActiveSection(id)
    pinned.current = true

    const release = () => {
      pinned.current = false
      window.removeEventListener('scrollend', release)
    }

    // scrollend where supported; the timeout covers browsers without it and clicks that do not scroll.
    window.addEventListener('scrollend', release)
    window.setTimeout(release, 1200)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#${id}`)
  }

  const renderNav = (className: string) => <nav className={className} aria-label={t.menuLabel}>
    {sectionIds.map(id => <a key={id} href={`#${id}`} className={activeSection === id ? 'is-active' : ''} onClick={event => { event.preventDefault(); goTo(id) }}>{t[id]}</a>)}
  </nav>

  return (
    <div className="notebook-shell">
      <SEOHead title={t.seoTitle} description={t.seoDescription} url="https://1saif.me/" />
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
                <a href="mailto:hello@1saif.me">{t.email}</a>
                <Link to="/resume">{t.resume}</Link>
              </p>
            </div>
            <div className="notebook-portrait">
              <picture>
                <source media="(min-width: 621px)" srcSet="/sj_image-4x5-240.webp 240w, /sj_image-4x5.webp 480w, /sj_image.webp 800w" sizes="min(28vw, 240px)" />
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
            <div className="notebook-contact-body">
              <p>{t.contactBody} <a ref={emailLink} href={`mailto:${CONTACT_EMAIL}`} dir="ltr">{CONTACT_EMAIL}</a> <CopyEmailButton address={CONTACT_EMAIL} linkRef={emailLink} label={t.copyEmail} copiedLabel={t.copiedEmail} /></p>
              <ContactForm language={language} />
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

const CopyEmailButton: React.FC<{ address: string; linkRef: React.RefObject<HTMLAnchorElement>; label: string; copiedLabel: string }> = ({ address, linkRef, label, copiedLabel }) => {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const showCopied = () => {
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  // The clipboard needs a secure context and permission; selecting the address is the fallback.
  const selectAddress = () => {
    const link = linkRef.current

    if (!link) return

    const range = document.createRange()
    range.selectNodeContents(link)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const copy = async () => {
    const clipboard = navigator.clipboard

    if (!clipboard) {
      selectAddress()

      return
    }

    try {
      await clipboard.writeText(address)
      showCopied()
    } catch {
      selectAddress()
    }
  }

  return <>
    <button type="button" className="notebook-copy-email" onClick={() => void copy()}>{copied ? copiedLabel : label}</button>
    <span className="sr-only" aria-live="polite">{copied ? copiedLabel : ''}</span>
  </>
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
