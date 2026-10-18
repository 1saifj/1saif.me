import { Project } from '../schemas/projectSchema'

// Homepage metadata stays small; full markdown remains lazy on case-study routes.
// Every entry must trace to real commits. Employer work is described by what it does, never by internal names.
export const projects: Project[] = [
  {
    "order": 1,
    "name": "Backend Platform and Cloud Infrastructure",
    "description": "Backend, cloud infrastructure and edge services for a product that partners and their customers use every day: integrations, billing callbacks, a content API, reporting, partner dashboards, and apps in Arabic, English and Kurdish.",
    "language": "typescript",
    "wip": false,
    "isPrivate": true,
    "sourceType": "company",
    "role": "Lead engineer",
    "impact": "TypeScript and Go services, Pulumi infrastructure on Google Cloud, load tests before launch",
    "ar": {
      "name": "منصة الأنظمة الخلفية والبنية السحابية",
      "description": "الأنظمة الخلفية والبنية السحابية وخدمات الحافة لمنتج يستخدمه الشركاء وعملاؤهم يومياً: التكاملات، واستدعاءات الفوترة، وواجهة برمجية للمحتوى، والتقارير، ولوحات تحكم للشركاء، وتطبيقات بالعربية والإنجليزية والكردية.",
      "role": "قائد هندسة البرمجيات",
      "impact": "خدمات بـ TypeScript وGo، وبنية تحتية على Google Cloud عبر Pulumi، واختبارات حمل قبل الإطلاق"
    }
  },
  {
    "order": 4,
    "name": "Al Qaseh Financial Services",
    "description": "Go and PostgreSQL services for financial operations, card issuing among them, and a year leading the backend team. A Redis lock per order with optimistic locking in PostgreSQL stopped duplicate approvals across instances.",
    "language": "go",
    "wip": false,
    "isPrivate": true,
    "sourceType": "company",
    "role": "Software engineer, backend team lead",
    "impact": "Go and PostgreSQL services, 2022 to 2025",
    "ar": {
      "name": "برمجيات مالية في القاصّة",
      "description": "خدمات بـ Go وPostgreSQL للعمليات المالية، ومنها إصدار البطاقات، وعامٌ في قيادة فريق الأنظمة الخلفية. أوقف قفلٌ في Redis لكل طلب، مع قفل تفاؤلي في PostgreSQL، تكرارَ الموافقات بين النسخ.",
      "role": "مهندس برمجيات، وقائد فريق الأنظمة الخلفية",
      "impact": "خدمات بـ Go وPostgreSQL، من 2022 إلى 2025"
    }
  },
  {
    "order": 3,
    "name": "Wusool",
    "description": "Smart campus transport for University of Kufa students and staff: live bus tracking, digital tickets and clear routes, with a Flutter passenger app, a Flutter driver app that scans QR tickets, and a .NET API.",
    "url": "https://wusool.to/en",
    "language": "dart",
    "wip": true,
    "isPrivate": true,
    "sourceType": "private",
    "role": "Tech lead and founding engineer",
    "impact": "Took it from the idea and the plan to the product and its launch, inside the University of Kufa technology incubator, and trained its 15-student team",
    "ar": {
      "name": "وصول",
      "description": "نقل جامعي ذكي لطلبة جامعة الكوفة ومنتسبيها: تتبّع مباشر للحافلات، وتذاكر رقمية، ومسارات واضحة، عبر تطبيق Flutter للركّاب، وتطبيق Flutter للسائقين يمسح التذاكر برمز QR، وواجهة برمجية بـ .NET.",
      "role": "قائد تقني ومهندس مؤسس",
      "impact": "أخذته من الفكرة والخطة إلى المنتج والإطلاق، ضمن الحاضنة التكنولوجية في جامعة الكوفة، ودرّبت فريقه المكوّن من 15 طالباً"
    }
  },
  {
    "order": 1,
    "name": "Kufa Grad Tracking Platform",
    "description": "Graduate tracking and jobs platform for the University of Kufa: a Go API with notifications, chat and scheduled jobs, a bilingual Next.js web app, and a QA portal for testers.",
    "url": "https://grads.uokufa.edu.iq",
    "language": "go",
    "wip": false,
    "isPrivate": true,
    "sourceType": "company",
    "role": "Main author",
    "impact": "Built and maintained since 2023: Go API, Next.js app, FastAPI QA portal, Sentry, Playwright",
    "ar": {
      "name": "منصة متابعة خريجي جامعة الكوفة",
      "description": "منصة لمتابعة خريجي جامعة الكوفة وربطهم بفرص العمل: واجهة برمجية بلغة Go تشمل الإشعارات والمحادثة والمهام المجدولة، وتطبيق ويب ثنائي اللغة بـ Next.js، وبوابة لضمان الجودة يستخدمها المختبِرون.",
      "role": "المطوّر الرئيسي",
      "impact": "أبنيها وأصونها منذ 2023: واجهة Go، وتطبيق Next.js، وبوابة جودة بـ FastAPI، مع Sentry وPlaywright"
    }
  },
  {
    "order": 2,
    "name": "RelayRook",
    "description": "An Agent Skill and CLI that lets one coding agent hand work to Claude Code, Codex, Kiro, OpenCode or Devin, hold their permission prompts, and get typed results back.",
    "url": "https://github.com/1saifj/relayrook",
    "language": "javascript",
    "wip": false,
    "isPrivate": false,
    "sourceType": "open-source",
    "role": "Author",
    "impact": "Activity-based watchdogs, one permission vocabulary across five CLIs, end-to-end tested",
    "ar": {
      "description": "مهارة وكيل (Agent Skill) وأداة سطر أوامر تتيح لوكيل برمجة واحد إسناد العمل إلى Claude Code أو Codex أو Kiro أو OpenCode أو Devin، واحتجاز طلبات الأذونات، واستلام نتائج محدّدة الأنواع.",
      "role": "المطوّر",
      "impact": "مراقبة تعتمد على نشاط الأداة، ومفردات أذونات موحّدة لخمس أدوات، واختبارات طرف إلى طرف"
    }
  },
  {
    "order": 2,
    "name": "Kufa Hackathon Platform",
    "description": "The platform that runs the University of Kufa hackathon: team sign-up, submissions, judge assignment, and notifications.",
    "url": "https://hackathon.uokufa.edu.iq",
    "language": "typescript",
    "wip": false,
    "isPrivate": true,
    "sourceType": "company",
    "role": "Sole author",
    "impact": "Next.js and Supabase, realtime updates and FCM push notifications, unit and end-to-end tests",
    "ar": {
      "name": "منصة هاكاثون جامعة الكوفة",
      "description": "المنصة التي يُدار بها هاكاثون جامعة الكوفة: تسجيل الفرق، وتسليم المشاريع، وتوزيع المحكّمين، والإشعارات.",
      "role": "المطوّر الوحيد",
      "impact": "Next.js وSupabase، وتحديثات فورية عبر Realtime وإشعارات FCM، مع اختبارات وحدات واختبارات طرف إلى طرف"
    }
  },
  {
    "order": 3,
    "name": "Najaf Guide",
    "description": "A city guide for Najaf: a NestJS API, a Flutter app, and a Next.js web app in Arabic and English.",
    "language": "typescript",
    "wip": true,
    "isPrivate": true,
    "sourceType": "private",
    "role": "Main engineer",
    "impact": "Domain-driven NestJS API with Drizzle and Better Auth; web app on Cloudflare",
    "ar": {
      "name": "دليل النجف",
      "description": "دليل لزوّار مدينة النجف: واجهة برمجية بـ NestJS، وتطبيق Flutter، وتطبيق ويب بـ Next.js بالعربية والإنجليزية.",
      "role": "المطوّر الرئيسي",
      "impact": "واجهة NestJS بتصميم موجَّه بالنطاق (DDD) مع Drizzle وBetter Auth، وتطبيق ويب على Cloudflare"
    }
  },
  {
    "order": 5,
    "name": "reqpretty",
    "description": "Go middleware that logs HTTP requests and responses in a structured, readable format.",
    "url": "https://github.com/1saifj/reqpretty",
    "language": "go",
    "wip": true,
    "isPrivate": false,
    "sourceType": "open-source",
    "role": "Author",
    "impact": "Open-source Go middleware for readable request and response logs",
    "ar": {
      "description": "وسيط (middleware) بلغة Go يسجّل طلبات HTTP واستجاباتها بصيغة منظّمة سهلة القراءة.",
      "role": "المطوّر",
      "impact": "مكتبة Go مفتوحة المصدر لسجلات طلبات واستجابات مقروءة"
    }
  },
  {
    "order": 5,
    "name": "arabic_roman_conv",
    "description": "A Flutter package that romanizes Arabic names and phrases into Latin script, for example سيف to Saif.",
    "url": "https://pub.dev/packages/arabic_roman_conv",
    "language": "dart",
    "wip": true,
    "isPrivate": false,
    "sourceType": "open-source",
    "role": "Author",
    "impact": "Published on pub.dev",
    "ar": {
      "description": "حزمة Flutter تكتب الأسماء والعبارات العربية بالحروف اللاتينية، فتحوّل مثلاً «سيف» إلى Saif.",
      "role": "المطوّر",
      "impact": "منشورة على pub.dev"
    }
  }
]
