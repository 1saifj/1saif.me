import React, { useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { arabicBodies, projects as projectFiles } from '../utils/projectContent'
import { projectSchema } from '../schemas/projectSchema'
import { createSlugFromTitle, findContentBySlug } from '../utils/slugUtils'
import { projects as projectList } from '../data/projects'
import { convertMarkdownToHtml } from '../utils/markdownProcessor'
import { enhanceCodeBlocks } from '../utils/codeBlocks'
import SEOHead from '../components/SEOHead'
import { BreadcrumbStructuredData } from '../components/StructuredData'
import { ContentSkeleton } from '../components/ContentSkeleton'
import { SiteFooter } from '../components/SiteFooter'
import { Language, pick, useLanguage } from '../i18n/language'
import { buildGlanceItems } from '../utils/projectGlance'

const copy = {
  en: {
    back: '← All work', inProgress: 'in progress', visit: 'Visit site', source: 'Source code', next: 'Next project',
    role: 'Role', status: 'Status', type: 'Type', language: 'Main language', links: 'Links', stack: 'Stack',
    shipped: 'Shipped', openSource: 'Open source', company: 'Company', private: 'Private',
    bodyNote: 'This case study is in English.',
    notFound: 'Project not found', notFoundBody: "The project you're looking for doesn't exist or has moved.", invalid: 'Invalid project URL', invalidBody: 'No project identifier was provided in the URL.',
    unavailable: 'Project data unavailable', unavailableBody: 'This project has invalid metadata and cannot be displayed yet.', viewWork: 'See all work',
  },
  ar: {
    back: '→ كل الأعمال', inProgress: 'قيد التطوير', visit: 'زيارة الموقع', source: 'الكود المصدري', next: 'المشروع التالي',
    role: 'الدور', status: 'الحالة', type: 'النوع', language: 'اللغة الأساسية', links: 'الروابط', stack: 'التقنيات',
    shipped: 'مكتمل', openSource: 'مفتوح المصدر', company: 'شركة', private: 'خاص',
    bodyNote: 'تفاصيل دراسة الحالة متاحة باللغة الإنجليزية.',
    notFound: 'المشروع غير موجود', notFoundBody: 'المشروع الذي تبحث عنه غير موجود أو نُقل إلى مكان آخر.', invalid: 'رابط مشروع غير صالح', invalidBody: 'لم يتضمن الرابط معرّف مشروع.',
    unavailable: 'بيانات المشروع غير متاحة', unavailableBody: 'بيانات هذا المشروع غير صالحة ولا يمكن عرضها حالياً.', viewWork: 'عرض كل الأعمال',
  },
}

export const ProjectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { language } = useLanguage()
  const t = copy[language]
  const projectFile = slug ? findContentBySlug(projectFiles, slug) : undefined

  // Bodies are bundled with the page, so they render during prerendering too.
  const markdown = (language === 'ar' && projectFile && arabicBodies.get(projectFile.slug)) || projectFile?.content
  const contentHtml = useMemo(() => (markdown ? convertMarkdownToHtml(markdown) : ''), [markdown])
  const body = useRef<HTMLElement>(null)

  useEffect(() => (body.current && contentHtml ? enhanceCodeBlocks(body.current) : undefined), [contentHtml])


  if (!projectFile) {
    return <ErrorView language={language} title={slug ? t.notFound : t.invalid} desc={slug ? t.notFoundBody : t.invalidBody} />
  }

  const parsed = projectSchema.safeParse({
    order: projectFile.frontmatter.order || -1,
    name: projectFile.frontmatter.name,
    description: projectFile.frontmatter.description,
    url: projectFile.frontmatter.url,
    language: projectFile.frontmatter.language,
    wip: projectFile.frontmatter.wip || false,
    isPrivate: projectFile.frontmatter.isPrivate || false,
    sourceType: projectFile.frontmatter.sourceType || 'open-source',
    role: projectFile.frontmatter.role,
    impact: projectFile.frontmatter.impact,
    stack: projectFile.frontmatter.stack,
    image: projectFile.frontmatter.image,
    imageAlt: projectFile.frontmatter.imageAlt,
    imageWidth: projectFile.frontmatter.imageWidth,
    imageHeight: projectFile.frontmatter.imageHeight,
  })

  if (!parsed.success) {
    return <ErrorView language={language} title={t.unavailable} desc={t.unavailableBody} />
  }

  const project = parsed.data
  // Same order as the home page work list, wrapping at the end. Arabic text lives in data/projects.ts.
  const index = projectList.findIndex(item => item.name === project.name)
  const entry = projectList[index]
  const next = projectList[(index + 1) % projectList.length]
  const name = pick(language, project.name, entry?.ar?.name)
  const arabicBody = language === 'ar' && arabicBodies.has(projectFile.slug)
  const description = pick(language, project.description, entry?.ar?.description)
  const role = pick(language, project.role, entry?.ar?.role)
  const glance = buildGlanceItems(project, role, t)

  const image = project.image && project.imageAlt && project.imageWidth && project.imageHeight
    ? { src: project.image, alt: pick(language, project.imageAlt, entry?.ar?.imageAlt), width: project.imageWidth, height: project.imageHeight }
    : undefined

  return (
    <div className="site-shell site-project-page">
      <SEOHead title={name} description={description} url={`https://1saif.me/project/${slug}`} />
      <BreadcrumbStructuredData items={[[language === 'ar' ? 'الصفحة الرئيسية' : 'Home', language === 'ar' ? '/ar' : '/'], [name, `${language === 'ar' ? '/ar' : ''}/project/${slug}`]]} />
      <SiteHeader current="work" />

      <main id="main-content" className="plain-page">
        <p className="plain-back"><Link to="/#work">{t.back}</Link></p>
        <h1>{name}</h1>
        <p className="plain-lede">{description}</p>
        <dl className="plain-glance">
          {glance.map(item => (
            <div key={item.key}>
              <dt>{item.label}</dt>
              <dd>{item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.value}</a> : item.value}</dd>
            </div>
          ))}
          {project.stack && project.stack.length > 0 && (
            <div className="plain-glance-stack">
              <dt>{t.stack}</dt>
              <dd><ul className="plain-stack">{project.stack.map(tech => <li key={tech}>{tech}</li>)}</ul></dd>
            </div>
          )}
        </dl>
        {image && <figure className="plain-figure"><img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" /></figure>}

        {language === 'ar' && !arabicBody && <p className="site-translation-note">{t.bodyNote}</p>}
        {contentHtml
          ? <article ref={body} className="site-project-content article-content plain-body" lang={arabicBody ? 'ar' : 'en'} dir={arabicBody ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ __html: contentHtml }} />
          : <ContentSkeleton />}

        <p className="plain-next"><span>{t.next}</span><Link to={`/project/${createSlugFromTitle(next.name)}`}>{pick(language, next.name, next.ar?.name)} <span aria-hidden="true">{language === 'ar' ? '←' : '→'}</span></Link></p>
      </main>
      <SiteFooter />
    </div>
  )
}

const ErrorView: React.FC<{ title: string; desc: string; language: Language }> = ({ title, desc, language }) => (
  <div className="site-shell site-error-page">
    <SiteHeader current="work" />
    <main id="main-content" className="plain-page"><h1>{title}</h1><p className="plain-lede">{desc}</p><p className="plain-ways"><Link to="/#work">{copy[language].viewWork}</Link></p></main>
    <SiteFooter />
  </div>
)
