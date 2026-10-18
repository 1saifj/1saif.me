import React from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import SEOHead from '../components/SEOHead'
import { comma, dateLocale, Language, useLanguage } from '../i18n/language'

type Localized = { role: string; location: string; mode: string; summary: string; highlights: string[] }

type Experience = Localized & {
  start: string // YYYY-MM
  end?: string // YYYY-MM; absent while current
  company: string
  companyAr?: string
  skills: string[]
  ar: Localized
}

const experience: Experience[] = [
  {
    start: '2025-11',
    company: 'Salasto',
    location: 'Remote',
    role: 'Lead Software Engineer',
    mode: 'Part-time',
    summary: 'I lead engineering for the company’s backend, its cloud infrastructure, and the web and mobile products built on them.',
    highlights: [
      'Main author of the backend: integrations with partner platforms, billing callbacks, a content API, and reporting.',
      'Built the Google Cloud infrastructure as code with Pulumi, and a Go service that terminates TLS at the edge.',
      'Set up CI that runs only the affected database tests, k6 load tests before launches, and production alerting.',
      'Built partner dashboards and timed apps in Arabic, English, and Kurdish.',
    ],
    skills: ['TypeScript', 'Go', 'PostgreSQL', 'Google Cloud', 'Pulumi', 'Next.js'],
    ar: {
      location: 'عن بُعد',
      role: 'قائد هندسة البرمجيات',
      mode: 'دوام جزئي',
      summary: 'أقود الهندسة للأنظمة الخلفية للشركة، وبنيتها السحابية، ومنتجات الويب والأجهزة المحمولة المبنية عليها.',
      highlights: [
        'المطوّر الرئيسي للأنظمة الخلفية: التكامل مع منصات الشركاء، واستدعاءات الفوترة، وواجهة برمجية للمحتوى، والتقارير.',
        'بنيت البنية التحتية على Google Cloud ككود باستخدام Pulumi، وخدمة بلغة Go تتولّى TLS على الحافة.',
        'أعددت مسار تكامل مستمر (CI) يشغّل اختبارات قاعدة البيانات المتأثرة بالتغيير فقط، واختبارات حمل بـ k6 قبل كل إطلاق، وتنبيهات للإنتاج.',
        'بنيت لوحات تحكم للشركاء، وتطبيقات بمؤقّت زمني بالعربية والإنجليزية والكردية.',
      ],
    },
  },
  {
    start: '2023-04',
    company: 'University of Kufa',
    companyAr: 'جامعة الكوفة',
    location: 'Al-Najaf, Iraq',
    role: 'Software Engineer',
    mode: 'Full-time · On-site',
    summary: 'Software engineering and graduate services support across university operations.',
    highlights: [
      'Develop and maintain applications for graduate employment tracking and career development.',
      'Built the graduate tracking platform (Go API, Next.js app, QA portal), the university hackathon platform, and a contest app for students.',
      'Provide technical support for Electronic and Communications Engineering laboratory initiatives.',
      'Member of the central organizing committee of Kufa Hackathon 2025.',
    ],
    skills: ['Go', 'Next.js', 'Supabase', 'FastAPI', 'Playwright'],
    ar: {
      location: 'النجف، العراق',
      role: 'مهندس برمجيات',
      mode: 'دوام كامل · حضوري',
      summary: 'هندسة البرمجيات ودعم خدمات الخريجين في عمليات الجامعة.',
      highlights: [
        'أطوّر وأصون تطبيقات لمتابعة توظيف الخريجين وتطويرهم المهني.',
        'بنيت منصة متابعة الخريجين (واجهة Go، وتطبيق Next.js، وبوابة لضمان الجودة)، ومنصة هاكاثون الجامعة، وتطبيق مسابقات للطلبة.',
        'أقدّم الدعم التقني لمبادرات مختبرات هندسة الإلكترونيك والاتصالات.',
        'عضو اللجنة المركزية المنظِّمة لهاكاثون الكوفة 2025.',
      ],
    },
  },
  {
    start: '2022-08',
    end: '2025-07',
    company: 'Al Qaseh',
    location: 'Al-Najaf, Iraq',
    role: 'Software Engineer',
    mode: 'Full-time · On-site',
    summary: 'Backend and product engineering for secure financial software.',
    highlights: [
      'Built and maintained Go and PostgreSQL services for financial operations, including card issuing.',
      'Stopped duplicate approvals in a card-issuing job that ran on several instances, with a Redis lock per order and optimistic locking in PostgreSQL.',
      'Worked on the Flutter, React, and Next.js clients so the services and the interfaces fit together.',
    ],
    skills: ['Go', 'PostgreSQL', 'Flutter', 'React', 'Next.js', 'Security'],
    ar: {
      location: 'النجف، العراق',
      role: 'مهندس برمجيات',
      mode: 'دوام كامل · حضوري',
      summary: 'هندسة الأنظمة الخلفية والمنتجات لبرمجيات مالية آمنة.',
      highlights: [
        'بنيت خدمات بـ Go وPostgreSQL للعمليات المالية وأدمتها، ومنها إصدار البطاقات.',
        'أوقفت تكرار الموافقات في مهمة إصدار البطاقات التي تعمل على عدة نسخ، بقفل في Redis لكل طلب وقفل تفاؤلي في PostgreSQL.',
        'عملت على تطبيقات Flutter وReact وNext.js حتى تتوافق الخدمات مع الواجهات.',
      ],
    },
  },
  {
    start: '2023-10',
    end: '2024-07',
    company: 'Al Qaseh',
    location: 'Al-Najaf, Iraq',
    role: 'Backend Team Lead',
    mode: 'Part-time · On-site',
    summary: 'Backend leadership focused on reliable APIs, quality, and team growth.',
    highlights: [
      'Ran design and code reviews for the backend team and mentored its developers.',
      'Set the team’s expectations for code quality and reliability of the financial services.',
    ],
    skills: ['Backend leadership', 'APIs', 'Reliability', 'Mentoring'],
    ar: {
      location: 'النجف، العراق',
      role: 'قائد فريق الأنظمة الخلفية',
      mode: 'دوام جزئي · حضوري',
      summary: 'قيادة الأنظمة الخلفية مع التركيز على واجهات برمجية موثوقة، والجودة، وتطوير الفريق.',
      highlights: [
        'أدرت مراجعات التصميم والكود لفريق الأنظمة الخلفية، وأرشدت مطوّريه.',
        'وضعت معايير الفريق لجودة الكود وموثوقية الخدمات المالية.',
      ],
    },
  },
  {
    start: '2022-01',
    end: '2022-07',
    company: 'Morabaa Software Solutions',
    location: 'Al-Najaf, Iraq',
    role: 'Web Developer',
    mode: 'Full-time · On-site',
    summary: 'Responsive frontend development with a focus on structure, usability, and speed.',
    highlights: [
      'Built reusable interfaces across JavaScript, React, Next.js, and Svelte.',
      'Improved smartphone experiences, page speed, and visual consistency across deliverables.',
    ],
    skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Next.js', 'Svelte'],
    ar: {
      location: 'النجف، العراق',
      role: 'مطوّر ويب',
      mode: 'دوام كامل · حضوري',
      summary: 'تطوير واجهات أمامية متجاوبة مع التركيز على البنية وسهولة الاستخدام والسرعة.',
      highlights: [
        'بنيت واجهات قابلة لإعادة الاستخدام باستخدام JavaScript وReact وNext.js وSvelte.',
        'حسّنت التجربة على الهواتف الذكية، وسرعةَ الصفحات، والاتساقَ البصري في المشاريع المسلَّمة.',
      ],
    },
  },
  {
    start: '2021-08',
    end: '2021-10',
    company: 'Al-Aaml',
    location: 'Al-Najaf, Iraq',
    role: 'Frontend Developer',
    mode: 'Full-time · On-site',
    summary: 'Flutter interface development for product delivery.',
    highlights: ['Contributed Flutter-based interface implementation in an on-site product team.'],
    skills: ['Flutter'],
    ar: {
      location: 'النجف، العراق',
      role: 'مطوّر واجهات أمامية',
      mode: 'دوام كامل · حضوري',
      summary: 'تطوير واجهات المنتجات بـ Flutter.',
      highlights: ['ساهمت في تنفيذ واجهات بـ Flutter ضمن فريق منتج يعمل حضورياً.'],
    },
  },
]

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
    seoTitle: 'السيرة الذاتية | سيف الجناحي، قائد هندسة البرمجيات',
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

const formatMonth = (value: string, language: Language) => new Intl.DateTimeFormat(dateLocale(language), { month: 'short', year: 'numeric' }).format(new Date(`${value}-01T00:00:00`))

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
