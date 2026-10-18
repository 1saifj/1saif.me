import React from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import SEOHead from '../components/SEOHead'
import { comma, useLanguage } from '../i18n/language'
import { experience, formatMonth } from '../data/experience'

const copy = {
  en: {
    seoTitle: 'Résumé | Saif Aljanahi, Lead Software Engineer',
    seoDescription: 'Résumé of Saif Aljanahi, a lead software engineer building backend systems, cloud infrastructure, and web and mobile apps with TypeScript, Go, PostgreSQL, and Flutter.',
    name: 'Saif Aljanahi',
    lede: 'Lead software engineer in Al-Najaf, Iraq. I have built backend systems, cloud infrastructure, and web and mobile apps since 2021.',
    contactLinks: 'Contact links',
    downloadCv: 'Download CV (English)',
    experience: 'Experience',
    present: 'Present',
    skills: 'Skills',
    selected: 'Selected work',
    work: [
      ['/project/backend-platform-and-cloud-infrastructure', 'Backend Platform and Cloud Infrastructure'],
      ['/project/kufa-grad-tracking-platform', 'Kufa Grad Tracking Platform'],
      ['/project/relayrook', 'RelayRook'],
    ],
    privacy: 'Privacy',
  },
  ar: {
    seoTitle: 'السيرة الذاتية | سيف الجناحي، قائد هندسة برمجيات',
    seoDescription: 'السيرة الذاتية لسيف الجناحي، قائد هندسة برمجيات يبني الأنظمة الخلفية والبنية السحابية وتطبيقات الويب والأجهزة المحمولة باستخدام TypeScript وGo وPostgreSQL وFlutter.',
    name: 'سيف الجناحي',
    lede: 'قائد هندسة برمجيات في النجف بالعراق. أبني منذ عام 2021 الأنظمة الخلفية والبنية السحابية وتطبيقات الويب والأجهزة المحمولة.',
    contactLinks: 'روابط التواصل',
    downloadCv: 'تحميل السيرة الذاتية (بالإنجليزية)',
    experience: 'الخبرة',
    present: 'حتى الآن',
    skills: 'المهارات',
    selected: 'أعمال مختارة',
    work: [
      ['/project/backend-platform-and-cloud-infrastructure', 'منصة الأنظمة الخلفية والبنية السحابية'],
      ['/project/kufa-grad-tracking-platform', 'منصة متابعة خريجي جامعة الكوفة'],
      ['/project/relayrook', 'RelayRook'],
    ],
    privacy: 'الخصوصية',
  },
}


export const ResumePage: React.FC = () => {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <>
      <SEOHead title={t.seoTitle} description={t.seoDescription} url="https://1saif.me/resume" type="website" />
      <div className="site-shell site-resume-page">
        <SiteHeader current="resume" />

        <main id="main-content" className="site-container plain-page">
          <h1>{t.name}</h1>
          <p className="plain-lede">{t.lede}</p>
          <p className="plain-links" aria-label={t.contactLinks}>
            <a href="mailto:hello@1saif.me" dir="ltr">hello@1saif.me</a>
            <a href="https://www.linkedin.com/in/1saifj/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://github.com/1saifj" target="_blank" rel="noreferrer">GitHub</a>
            <a href="/cv.html" target="_blank" rel="noreferrer">{t.downloadCv}</a>
          </p>

          <h2>{t.experience}</h2>
          {experience.map(item => {
            const text = language === 'ar' ? item.ar : item

            return (
              <article className="plain-role" key={`${item.company}-${item.role}-${item.start}`}>
                <h3>{text.role}{comma(language)}{language === 'ar' && item.companyAr ? item.companyAr : item.company}</h3>
                <p className="plain-meta">{formatMonth(item.start, language)} – {item.end ? formatMonth(item.end, language) : t.present} · {text.mode} · {text.location}</p>
                <p>{text.summary}</p>
                <ul>{text.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>
                <p className="plain-meta">{t.skills}: <span dir="ltr">{item.skills.join(', ')}</span></p>
              </article>
            )
          })}

          <h2>{t.selected}</h2>
          <ul className="plain-list">
            {t.work.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}
          </ul>
        </main>

        <footer className="site-container plain-footer">
          <span>© {new Date().getFullYear()} {t.name}</span>
          <Link to="/privacy">{t.privacy}</Link>
        </footer>
      </div>
    </>
  )
}
