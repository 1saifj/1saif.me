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
import { comma, Language, pick, useLanguage } from '../i18n/language'

const copy = {
  en: {
    back: '← All work', inProgress: 'in progress', visit: 'Visit site', repo: 'Source code', next: 'Next project',
    bodyNote: 'This case study is in English.',
    notFound: 'Project not found', notFoundBody: "The project you're looking for doesn't exist or has moved.", invalid: 'Invalid project URL', invalidBody: 'No project identifier was provided in the URL.',
    unavailable: 'Project data unavailable', unavailableBody: 'This project has invalid metadata and cannot be displayed yet.', viewWork: 'See all work',
  },
  ar: {
    back: '→ كل الأعمال', inProgress: 'قيد التطوير', visit: 'زيارة الموقع', repo: 'الكود المصدري', next: 'المشروع التالي',
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

  return (
    <div className="site-shell site-project-page">
      <SEOHead title={`${name} | ${language === 'ar' ? 'سيف الجناحي' : 'Saif Aljanahi'}`} description={description} url={`https://1saif.me/project/${slug}`} image="/sj_image.jpeg" />
      <BreadcrumbStructuredData items={[[language === 'ar' ? 'الصفحة الرئيسية' : 'Home', language === 'ar' ? '/ar' : '/'], [name, `${language === 'ar' ? '/ar' : ''}/project/${slug}`]]} />
      <SiteHeader current="work" />

      <main id="main-content" className="plain-page">
        <p className="plain-back"><Link to="/#work">{t.back}</Link></p>
        <h1>{name}</h1>
        <p className="plain-lede">{description}</p>
        <p className="plain-meta">
          {pick(language, project.role, entry?.ar?.role)}{project.wip && <>{comma(language)}{t.inProgress}</>} · {languageNames.get(project.language)}
          {project.url && <> · <a href={project.url} target="_blank" rel="noreferrer">{project.isPrivate ? t.visit : t.repo}</a></>}
        </p>

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

const languageNames = new Map([['typescript', 'TypeScript'], ['javascript', 'JavaScript'], ['go', 'Go'], ['dart', 'Dart'], ['rust', 'Rust'], ['haskell', 'Haskell'], ['ocaml', 'OCaml']])

const ErrorView: React.FC<{ title: string; desc: string; language: Language }> = ({ title, desc, language }) => (
  <div className="site-shell site-error-page">
    <SiteHeader current="work" />
    <main id="main-content" className="plain-page"><h1>{title}</h1><p className="plain-lede">{desc}</p><p className="plain-ways"><Link to="/#work">{copy[language].viewWork}</Link></p></main>
    <SiteFooter />
  </div>
)
