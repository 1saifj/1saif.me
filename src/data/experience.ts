import { dateLocale, Language } from '../i18n/language'

export type Localized = { role: string; location: string; mode: string; summary: string; highlights: string[] }

export type Experience = Localized & {
  start: string // YYYY-MM
  end?: string // YYYY-MM; absent while current
  company: string
  companyAr?: string
  skills: string[]
  ar: Localized
}

export const experience: Experience[] = [
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
    companyAr: 'القاصّة',
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
    companyAr: 'القاصّة',
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

// Months parse and format in local time on both server and browser, so the prerender and hydration agree.
export const formatMonth = (value: string, language: Language) => new Intl.DateTimeFormat(dateLocale(language), { month: 'short', year: 'numeric' }).format(new Date(`${value}-01T00:00:00`))

export type Job = { company: string; companyAr?: string; start: string; end?: string; roles: Experience[] }

// One entry per employer, newest first; roles at the same employer (Al Qaseh had two) stay together.
export const jobs: Job[] = experience.reduce<Job[]>((list, role) => {
  const last = list[list.length - 1]

  if (last?.company === role.company) {
    last.roles.push(role)

    if (role.start < last.start) last.start = role.start

    if (!role.end || (last.end && role.end > last.end)) last.end = role.end
  } else {
    list.push({ company: role.company, companyAr: role.companyAr, start: role.start, end: role.end, roles: [role] })
  }

  return list
}, [])
