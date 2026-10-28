import { BlogPost } from '../schemas/blogSchema'

// Homepage metadata stays small; full markdown remains lazy on article routes.
const blogs: BlogPost[] = [
  {
    "title": "The VPN Gateway That Was Running on Luck",
    "description": "Twelve IPsec tunnels were up, traffic was flowing, and systemd said strongSwan wasn't running at all. How I found out, and the one-time script I used to fix it on production in about three seconds of downtime.",
    "titleAr": "بوابة VPN كانت تعمل بالحظ",
    "descriptionAr": "اثنا عشر نفق IPsec تعمل، والحركة تمرّ، وsystemd يقول إن strongSwan متوقف تماماً. كيف اكتشفت ذلك، والسكربت الذي لا يعمل إلا مرة واحدة وأصلحت به الإنتاج بانقطاع قرابة ثلاث ثوانٍ.",
    "createdAt": 1793221200000,
    "updatedAt": 1793221200000,
    "draft": false,
    "tags": [
      "linux",
      "devops",
      "networking",
      "ipsec",
      "systemd"
    ],
    "file": "the_vpn_gateway_running_on_luck",
    "words": 1197
  },
  {
    "title": "OpenTelemetry in Go: Traces You Can Actually Read",
    "description": "What OpenTelemetry is, what traces, metrics, logs and baggage each give you, and a small Go setup that sends traces to a local Jaeger in a few minutes.",
    "titleAr": "OpenTelemetry في Go: تتبّعات تستطيع قراءتها فعلاً",
    "descriptionAr": "ما هو OpenTelemetry، وما الذي تقدّمه كلٌّ من التتبّعات والمقاييس والسجلات والـbaggage، مع إعداد صغير في Go يرسل التتبّعات إلى Jaeger محلياً خلال دقائق.",
    "createdAt": 1738530000000,
    "updatedAt": 1738530000000,
    "draft": false,
    "tags": [
      "golang",
      "observability",
      "opentelemetry",
      "devops"
    ],
    "featuredImage": "/articles/otel_traces_feat.jpg",
    "file": "opentelemetry_in_go",
    "words": 916
  },
  {
    "title": "Transaction Isolation Levels in PostgreSQL, With Examples",
    "description": "Strange bugs from concurrent requests often come down to how the database isolates transactions. What each PostgreSQL level protects you from, a lost update you can reproduce in two terminals, and how to retry when the database says no.",
    "titleAr": "مستويات عزل المعاملات في PostgreSQL مع أمثلة",
    "descriptionAr": "كثير من الأخطاء الغريبة في الطلبات المتزامنة سببها طريقة عزل المعاملات في قاعدة البيانات. ما الذي يحميك منه كل مستوى في PostgreSQL، وتحديث مفقود تستطيع تكراره في نافذتين، وكيف تعيد المحاولة حين ترفض قاعدة البيانات.",
    "createdAt": 1743541200000,
    "updatedAt": 1743541200000,
    "draft": false,
    "tags": [
      "postgresql",
      "database",
      "concurrency",
      "golang"
    ],
    "featuredImage": "/articles/isolation_levels_feat.jpg",
    "file": "postgres_transaction_isolation_levels",
    "words": 1131
  },
  {
    "title": "Retry Strategies That Don't Make Outages Worse",
    "description": "Fixed delay, linear and exponential backoff, and why jitter matters most of all. With a small Go retry function and the rules that decide when you should retry in the first place.",
    "titleAr": "استراتيجيات إعادة المحاولة التي لا تزيد الأعطال سوءاً",
    "descriptionAr": "التأخير الثابت، والتراجع الخطي والأُسّي، ولماذا يهمّ الـjitter أكثر من كل ذلك. مع دالة إعادة محاولة صغيرة في Go، والقواعد التي تحدد متى تعيد المحاولة أصلاً.",
    "createdAt": 1742418000000,
    "updatedAt": 1742418000000,
    "draft": false,
    "tags": [
      "golang",
      "backend",
      "reliability",
      "system-design"
    ],
    "featuredImage": "/articles/retry_jitter_feat.jpg",
    "file": "retry_strategies_and_jitter",
    "words": 909
  },
  {
    "title": "Rate Limiting with a Token Bucket",
    "description": "How the token bucket allows short bursts while holding a steady average rate, a twenty-line Go version to understand it, and what to use in production when you have more than one instance.",
    "titleAr": "تحديد معدل الطلبات بخوارزمية Token Bucket",
    "descriptionAr": "كيف تسمح خوارزمية token bucket بدفعات قصيرة مع الحفاظ على معدل ثابت، ونسخة من عشرين سطراً في Go لفهمها، وما الذي تستخدمه في الإنتاج حين تشغّل أكثر من نسخة من الخدمة.",
    "createdAt": 1739134800000,
    "updatedAt": 1739134800000,
    "draft": false,
    "tags": [
      "golang",
      "backend",
      "rate-limiting",
      "system-design"
    ],
    "featuredImage": "/articles/token_bucket_feat.jpg",
    "file": "token_bucket_rate_limiting",
    "words": 770
  },
  {
    "title": "Keeping Flutter Smooth with Isolates",
    "description": "Heavy work on the main isolate freezes the UI. When to move it off with Isolate.run, what you can and can't send across, a long-lived worker for repeated jobs, and the web caveat.",
    "titleAr": "إبقاء تطبيق Flutter سلساً باستخدام Isolates",
    "descriptionAr": "العمل الثقيل على الـisolate الرئيسي يجمّد الواجهة. متى تنقله بـ Isolate.run، وما الذي يمكن إرساله بين الـisolates وما لا يمكن، وعامل طويل العمر للمهام المتكررة، وما يختلف على الويب.",
    "createdAt": 1749502800000,
    "updatedAt": 1749502800000,
    "draft": false,
    "tags": [
      "flutter",
      "dart",
      "performance",
      "mobile"
    ],
    "featuredImage": "/articles/flutter_isolates_feat.jpg",
    "file": "flutter_isolates_for_heavy_work",
    "words": 831
  },
  {
    "title": "What Happens When Your Database Crashes Mid-Transaction",
    "description": "The write-ahead log is why a committed transaction survives a power cut. How PostgreSQL uses it to recover, why it has no undo step, and how the same log powers replication and tools like Supabase Realtime.",
    "titleAr": "ماذا يحدث حين تتعطل قاعدة البيانات في منتصف معاملة؟",
    "descriptionAr": "سجل الكتابة المسبقة (WAL) هو سبب نجاة المعاملة المؤكَّدة من انقطاع الكهرباء. كيف يستخدمه PostgreSQL للتعافي، ولماذا لا يحتاج خطوة تراجع، وكيف يغذّي السجل نفسه النسخ المتماثل وأدوات مثل Supabase Realtime.",
    "createdAt": 1748638800000,
    "updatedAt": 1748638800000,
    "draft": false,
    "tags": [
      "postgresql",
      "database",
      "backend"
    ],
    "featuredImage": "/articles/wal_recovery_feat.jpg",
    "file": "what_happens_when_postgres_crashes",
    "words": 991
  },
  {
    "title": "Metaprogramming in Go: Generate, Reflect, or Generics",
    "description": "Go has no macros, but it does have three ways to write code that works on other code. What go generate, the reflect package and generics are each good at, with a small example of each.",
    "titleAr": "البرمجة الوصفية في Go: التوليد أم الانعكاس أم الأنواع العامة",
    "descriptionAr": "لا يوجد ماكرو في Go، لكن فيها ثلاث طرق لكتابة كود يعمل على كود آخر. فيمَ يتفوّق كلٌّ من go generate وحزمة reflect والـgenerics، مع مثال صغير لكل منها.",
    "createdAt": 1744664400000,
    "updatedAt": 1744664400000,
    "draft": false,
    "tags": [
      "golang",
      "code-generation",
      "software-design"
    ],
    "featuredImage": "/articles/go_metaprogramming_feat.jpg",
    "file": "metaprogramming_in_go",
    "words": 790
  },
  {
    "title": "Stress Testing a REST API with k6",
    "description": "How I use k6 to find out where an API breaks before users do. A first script, stages and thresholds that fail the build, the difference between virtual users and requests per second, and what to watch while it runs.",
    "titleAr": "اختبار تحمّل واجهة برمجية REST باستخدام k6",
    "descriptionAr": "كيف أستخدم k6 لأعرف أين تنهار الواجهة البرمجية قبل أن يكتشف ذلك المستخدمون. سكربت أول، ومراحل وعتبات تُفشل البناء، والفرق بين المستخدمين الافتراضيين والطلبات في الثانية، وما الذي تراقبه أثناء التشغيل.",
    "createdAt": 1743627600000,
    "updatedAt": 1743627600000,
    "draft": false,
    "tags": [
      "testing",
      "performance",
      "backend",
      "api"
    ],
    "featuredImage": "/articles/k6_load_feat.jpg",
    "file": "load_testing_apis_with_k6",
    "words": 934
  },
  {
    "title": "git checkout, switch, or restore?",
    "description": "git checkout does two unrelated jobs, and that's why it surprises people. What git switch and git restore split out, the commands you'll actually use, and the one checkout habit worth dropping.",
    "titleAr": "git checkout أم switch أم restore؟",
    "descriptionAr": "يقوم git checkout بمهمتين لا علاقة بينهما، ولهذا يفاجئ الناس. ما الذي فصله git switch وgit restore، والأوامر التي ستستخدمها فعلاً، والعادة الوحيدة المرتبطة بـ checkout التي تستحق أن تتركها.",
    "createdAt": 1744664400000,
    "updatedAt": 1744664400000,
    "draft": false,
    "tags": [
      "git",
      "version-control",
      "developer-tools"
    ],
    "featuredImage": "/articles/git_switch_restore_feat.jpg",
    "file": "git_switch_and_restore",
    "words": 504
  },
  {
    "title": "My Coding Agent Was Slow, and It Was grep",
    "description": "I blamed the model, the context window and the API. The real problem was the search tool the agent used for code search. What I changed, why aliasing grep needs care, and why the harness matters more than the model.",
    "titleAr": "كان وكيل البرمجة بطيئاً، والسبب grep",
    "descriptionAr": "ظننت أن المشكلة في النموذج أو نافذة السياق أو واجهته البرمجية. المشكلة الحقيقية كانت أداة البحث التي يستخدمها الوكيل في الكود. ما الذي غيّرته، ولماذا يحتاج استبدال grep بأداة أخرى إلى حذر، ولماذا تهمّ بيئة الوكيل أكثر من النموذج.",
    "createdAt": 1770411600000,
    "updatedAt": 1782680400000,
    "draft": false,
    "tags": [
      "ai",
      "developer-tools",
      "productivity",
      "macos"
    ],
    "featuredImage": "/articles/agent_ripgrep_feat.jpg",
    "file": "my_coding_agent_was_slow_it_was_grep",
    "words": 560
  },
  {
    "title": "Audit Logs Are Built for a Different Job",
    "description": "Who did what, to which record, and when. How an audit log differs from application logs, a PostgreSQL design that records every change in the same transaction, and how to keep the log append-only.",
    "titleAr": "سجلات التدقيق تُبنى لمهمة مختلفة",
    "descriptionAr": "من فعل ماذا، وعلى أي سجل، ومتى. كيف يختلف سجل التدقيق عن سجلات التطبيق، وتصميم في PostgreSQL يسجّل كل تغيير ضمن المعاملة نفسها، وكيف تُبقي السجل للإضافة فقط.",
    "createdAt": 1753218000000,
    "updatedAt": 1753218000000,
    "draft": false,
    "tags": [
      "security",
      "postgresql",
      "backend",
      "compliance"
    ],
    "featuredImage": "/articles/audit_log_feat.jpg",
    "file": "audit_logging_in_postgres",
    "words": 929
  },
  {
    "title": "Being Good at Code Isn't Enough",
    "description": "Every team wants clean code and strong delivery. The part that gets ignored is being easy to work with. What that looks like in code reviews, and why it decides how a team performs.",
    "titleAr": "إتقان الكود وحده لا يكفي",
    "descriptionAr": "كل فريق يريد كوداً نظيفاً وتسليماً قوياً. الجزء الذي يُهمَل هو أن تكون شخصاً يسهل العمل معه. كيف يبدو ذلك في مراجعات الكود، ولماذا يحدد أداء الفريق.",
    "createdAt": 1744405200000,
    "updatedAt": 1744405200000,
    "draft": false,
    "tags": [
      "engineering-culture",
      "teamwork",
      "code-review"
    ],
    "featuredImage": "/articles/teamwork_review_feat.jpg",
    "file": "being_good_at_code_is_not_enough",
    "words": 457
  },
  {
    "title": "Locking Down a Small VM Without Spending Money",
    "description": "The baseline I use for production VMs. SSH keys, no root login, a private WireGuard path for admin access, fail2ban, a firewall, and a way back in if I lock myself out.",
    "titleAr": "تأمين خادم افتراضي صغير دون أن تدفع شيئاً",
    "descriptionAr": "الحد الأدنى الذي أطبّقه على خوادم الإنتاج: مفاتيح SSH، ومنع الدخول بحساب root، ومسار WireGuard خاص للإدارة، وfail2ban، وجدار حماية، وطريق للعودة إذا أغلقت الباب على نفسي.",
    "createdAt": 1773435600000,
    "updatedAt": 1773435600000,
    "draft": false,
    "tags": [
      "security",
      "linux",
      "devops",
      "wireguard",
      "ssh"
    ],
    "featuredImage": "/articles/locking_down_vm_feat.jpg",
    "file": "locking_down_a_small_vm",
    "words": 1075
  },
  {
    "title": "API Errors in Arabic and English with RFC 9457",
    "description": "How I return errors that a user can read in their own language and a developer can still trace, using Problem Details, a small message catalog and the Accept-Language header.",
    "titleAr": "أخطاء الواجهة البرمجية بالعربية والإنجليزية مع RFC 9457",
    "descriptionAr": "كيف أعيد أخطاءً يقرؤها المستخدم بلغته ويتتبّعها المطوّر في الوقت نفسه، باستخدام Problem Details وفهرس رسائل صغير وترويسة Accept-Language.",
    "createdAt": 1765832400000,
    "updatedAt": 1765832400000,
    "draft": false,
    "tags": [
      "api",
      "backend",
      "i18n",
      "nodejs",
      "typescript"
    ],
    "featuredImage": "/articles/rfc9457_errors_feat.jpg",
    "file": "bilingual_api_errors_with_rfc_9457",
    "words": 1199
  },
  {
    "title": "Running a Cron Job Once When You Have Many Instances",
    "description": "Scale a Go service to three instances and every scheduled job runs three times. How a Redis key fixes that, the two holes in the simple SETNX version, and why the job should still be safe to run twice.",
    "titleAr": "تشغيل مهمة مجدولة مرة واحدة حين تشغّل عدة نسخ من الخدمة",
    "descriptionAr": "وسّع خدمة Go إلى ثلاث نسخ، وستعمل كل مهمة مجدولة ثلاث مرات. كيف يحلّ مفتاح في Redis ذلك، والثغرتان في نسخة SETNX البسيطة، ولماذا يجب أن تبقى المهمة آمنة إن عملت مرتين.",
    "createdAt": 1744059600000,
    "updatedAt": 1744059600000,
    "draft": false,
    "tags": [
      "golang",
      "redis",
      "backend",
      "concurrency"
    ],
    "featuredImage": "/articles/cron_lock_feat.jpg",
    "file": "one_cron_run_across_many_instances",
    "words": 1045
  },
  {
    "title": "A Simple CI/CD Pipeline for a Small VPS",
    "description": "The pipeline I used for the University of Kufa graduate tracking system. GitHub Actions builds the image, GHCR stores it, Watchtower deploys it, Shoutrrr tells me what happened, and Infisical keeps the secrets out of the repo.",
    "titleAr": "خط CI/CD بسيط لخادم VPS صغير",
    "descriptionAr": "الخط الذي استخدمته لنظام متابعة خريجي جامعة الكوفة: GitHub Actions يبني الصورة، وGHCR يخزّنها، وWatchtower ينشرها، وShoutrrr يخبرني بما حدث، وInfisical يُبقي الأسرار خارج المستودع.",
    "createdAt": 1756155600000,
    "updatedAt": 1792270800000,
    "draft": false,
    "tags": [
      "devops",
      "ci-cd",
      "docker",
      "github-actions"
    ],
    "featuredImage": "/articles/vps_pipeline_feat.jpg",
    "file": "ci_cd_on_a_small_vps",
    "words": 1108
  },
  {
    "title": "Idempotency Keys, or How Not to Charge Someone Twice",
    "description": "A customer taps \"Pay\", the connection drops, and they tap again. How idempotency keys make that retry safe, and the race in the obvious implementation that lets the double charge through anyway.",
    "titleAr": "مفاتيح Idempotency، أو كيف لا تخصم المبلغ مرتين",
    "descriptionAr": "يضغط العميل «ادفع»، فينقطع الاتصال، فيضغط مرة أخرى. كيف تجعل إعادة المحاولة آمنةً بمفاتيح idempotency، وحالة التسابق في التنفيذ البديهي الذي يسمح بالخصم المزدوج رغم ذلك.",
    "createdAt": 1742677200000,
    "updatedAt": 1742677200000,
    "draft": false,
    "tags": [
      "backend",
      "golang",
      "postgresql",
      "payments",
      "system-design"
    ],
    "featuredImage": "/articles/idempotency_feat.jpg",
    "file": "idempotency_keys_for_payments",
    "words": 1136
  },
  {
    "title": "Getting Your Work Back After git reset --hard",
    "description": "Git keeps more than you think. How to use the reflog to undo a reset, what it can't bring back, and a few habits that make these moments boring.",
    "titleAr": "استعادة عملك بعد git reset --hard",
    "descriptionAr": "يحتفظ Git بأكثر مما تظن. كيف تستخدم reflog للتراجع عن reset، وما الذي لا يمكنه استعادته، وعادات قليلة تجعل هذه اللحظات مملة.",
    "createdAt": 1759784400000,
    "updatedAt": 1759784400000,
    "draft": false,
    "tags": [
      "git",
      "version-control",
      "developer-tools"
    ],
    "featuredImage": "/articles/git_reflog_feat.jpg",
    "file": "recover_from_git_reset_hard",
    "words": 796
  },
  {
    "title": "Give Every Request an ID You Can Follow",
    "description": "When a strange bug shows up in production, the first question is what happened to that one request. A request ID in the context, a logger that carries it, and cancellation that actually stops work.",
    "titleAr": "امنح كل طلب معرّفاً تستطيع تتبّعه",
    "descriptionAr": "حين يظهر خطأ غريب في الإنتاج، يكون السؤال الأول: ماذا حدث لذلك الطلب تحديداً؟ معرّف طلب داخل الـcontext، ومسجّل يحمله معه، وإلغاء يوقف العمل فعلاً.",
    "createdAt": 1762722000000,
    "updatedAt": 1762722000000,
    "draft": false,
    "tags": [
      "golang",
      "backend",
      "observability",
      "logging"
    ],
    "featuredImage": "/articles/request_id_feat.jpg",
    "file": "request_context_and_request_ids_in_go",
    "words": 1031
  },
  {
    "title": "Interfaces in Go: Keep Them Small",
    "description": "A refactor that started with a nine-method IKeycloakConfig interface. What was wrong with it, what replaced it, and the Go habits behind the change.",
    "titleAr": "الواجهات في Go: اجعلها صغيرة",
    "descriptionAr": "إعادة هيكلة بدأت بواجهة IKeycloakConfig من تسع دوال. ما الخطأ فيها، وما الذي حلّ محلها، وعادات Go وراء هذا التغيير.",
    "createdAt": 1744491600000,
    "updatedAt": 1744491600000,
    "draft": false,
    "tags": [
      "golang",
      "software-design",
      "refactoring"
    ],
    "featuredImage": "/articles/go_interfaces_feat.jpg",
    "file": "small_interfaces_in_go",
    "words": 794
  },
  {
    "title": "Preventing Duplicate Transactions with Database Locking Strategies in Financial Systems",
    "description": "A card-issuing service that sometimes processed the same request twice. How optimistic and pessimistic locking stopped the duplicates, and when to use each.",
    "titleAr": "منع المعاملات المكررة في الأنظمة المالية بأقفال قاعدة البيانات",
    "descriptionAr": "خدمة إصدار بطاقات كانت تعالج الطلب نفسه مرتين أحياناً. كيف أوقف هذا التكرار بالقفل المتفائل والقفل المتشائم، ومتى تستخدم كلاً منهما.",
    "createdAt": 1744232400000,
    "updatedAt": 1744232400000,
    "draft": false,
    "tags": [
      "database",
      "concurrency",
      "optimistic-locking",
      "financial-systems",
      "redis"
    ],
    "featuredImage": "/articles/database-locking/db_locks_feat.jpg",
    "file": "prevent_duplicates_trx_with_database_locking_strategies",
    "words": 1090
  },
  {
    "title": "Database Migrations Done Right: Git-Style Version Control for Your Schema",
    "description": "Keep every schema change in Git next to the code, apply it with a migration tool, and test it in CI before it touches production. The tools, the rules that keep migrations safe, and the PostgreSQL details that bite.",
    "titleAr": "ترحيلات قاعدة البيانات بالطريقة الصحيحة: إدارة إصدارات المخطط مثل Git",
    "descriptionAr": "احفظ كل تغيير في المخطط داخل Git بجانب الكود، وطبّقه بأداة ترحيل، واختبره في CI قبل أن يصل إلى الإنتاج. الأدوات، والقواعد التي تُبقي الترحيلات آمنة، وتفاصيل PostgreSQL التي تفاجئك.",
    "createdAt": 1737493200000,
    "updatedAt": 1753131600000,
    "draft": false,
    "tags": [
      "database",
      "migrations",
      "postgresql",
      "devops",
      "ci-cd"
    ],
    "featuredImage": "/articles/db_cicd_feat.jpg",
    "file": "best_cicd_for_databases_migrations",
    "words": 1480
  },
  {
    "title": "Setting Up a Local Development Environment with a Webhook Service using Docker Compose",
    "description": "One docker-compose file that runs a Node.js app, a webhook service, MongoDB and Nginx as a reverse proxy, so every developer starts the same stack with one command.",
    "titleAr": "بيئة تطوير محلية مع خدمة Webhook باستخدام Docker Compose",
    "descriptionAr": "ملف docker-compose واحد يشغّل تطبيق Node.js وخدمة webhook وMongoDB وNginx كوكيل عكسي، فيبدأ كل مطوّر البيئة نفسها بأمر واحد.",
    "createdAt": 1725224400000,
    "updatedAt": 1725224400000,
    "draft": false,
    "tags": [
      "docker",
      "docker-compose",
      "nodejs",
      "webhook",
      "development"
    ],
    "featuredImage": "/articles/docker_feat.jpg",
    "file": "setting_up_a_local_development_environment_with_a_webhook_service_using_docker_compose",
    "words": 770
  },
  {
    "title": "Cherry-Pick: A Useful GitHub Tool for Managing Commits",
    "description": "How to copy a single commit to another branch with cherry-pick in GitHub Desktop, and when a merge or a rebase is the better choice.",
    "titleAr": "Cherry-Pick: نقل commit واحد بين الفروع في GitHub Desktop",
    "descriptionAr": "كيف تنسخ commit واحداً إلى فرع آخر باستخدام cherry-pick في GitHub Desktop، ومتى يكون merge أو rebase خياراً أفضل.",
    "createdAt": 1720818000000,
    "updatedAt": 1720818000000,
    "draft": false,
    "tags": [
      "github",
      "version-control",
      "git",
      "development"
    ],
    "featuredImage": "/articles/git_cherry_pick_feat.jpg",
    "file": "cherry-pick-github-tool-for-managing-commits",
    "words": 521
  },
  {
    "title": "Microservices Architecture with Go and Docker",
    "description": "How I split a system into Go services, run them with Docker, and connect them with REST and gRPC. Service discovery with Consul, and why starting with fewer services is safer.",
    "titleAr": "معمارية الخدمات المصغّرة باستخدام Go وDocker",
    "descriptionAr": "كيف أقسّم نظاماً إلى خدمات Go، وأشغّلها بـ Docker، وأربطها بـ REST وgRPC. اكتشاف الخدمات باستخدام Consul، ولماذا من الأفضل أن تبدأ بعدد قليل من الخدمات.",
    "createdAt": 1713733200000,
    "updatedAt": 1713733200000,
    "draft": false,
    "tags": [
      "backend",
      "go",
      "microservices",
      "docker"
    ],
    "featuredImage": "/articles/go_micro_feat.jpg",
    "file": "microservices-architecture-with-go",
    "words": 591
  },
  {
    "title": "Flutter State Management: Comparing Provider, Riverpod, and Bloc",
    "description": "Provider, Riverpod and Bloc compared from real projects: how each one works, where it fits, and which one I would pick for a new app.",
    "titleAr": "إدارة الحالة في Flutter: مقارنة بين Provider وRiverpod وBloc",
    "descriptionAr": "مقارنة بين Provider وRiverpod وBloc من مشاريع حقيقية: كيف يعمل كلٌّ منها، وأين يناسب، وأيّها أختار لتطبيق جديد.",
    "createdAt": 1710018000000,
    "updatedAt": 1710018000000,
    "draft": false,
    "tags": [
      "mobile",
      "flutter",
      "dart",
      "state-management"
    ],
    "featuredImage": "/articles/flutter_state_mgt_feat.jpg",
    "file": "flutter-state-management-comparison",
    "words": 762
  },
  {
    "title": "Managing Multiple Database Schemas with Gorm",
    "description": "How to keep tables in two PostgreSQL schemas, app and auth, behind one GORM connection, using table names.",
    "titleAr": "إدارة عدة مخططات لقاعدة البيانات باستخدام GORM",
    "descriptionAr": "كيف تُبقي جداول في مخططين من PostgreSQL، هما app وauth، خلف اتصال GORM واحد، باستخدام أسماء الجداول.",
    "createdAt": 1688850000000,
    "updatedAt": 1688850000000,
    "draft": false,
    "tags": [
      "golang",
      "gorm",
      "database"
    ],
    "featuredImage": "/articles/gorm_schema_feat.jpg",
    "file": "managing_multiple_database_schemas_with_gorm",
    "words": 607
  },
  {
    "title": "Most Effective Design Patterns In Golang",
    "description": "Two classic design patterns that still earn their place in Go, Observer and Singleton, with Go code for each.",
    "titleAr": "أنماط التصميم الأكثر فائدة في Go",
    "descriptionAr": "نمطان كلاسيكيان ما زالا يستحقان مكانهما في Go، هما Observer وSingleton، مع كود Go لكل منهما.",
    "createdAt": 1687640400000,
    "updatedAt": 1687640400000,
    "draft": false,
    "tags": [
      "golang",
      "design-patterns"
    ],
    "featuredImage": "/articles/go_design_patterns_feat.jpg",
    "file": "most_effective_design_patterns_in_golang",
    "words": 688
  },
  {
    "title": "An Introduction to API Management with Apiman",
    "description": "What an API manager does, how Apiman models it with organizations, plans, client apps and contracts, and what you get from putting a gateway in front of your APIs.",
    "titleAr": "مقدمة في إدارة الواجهات البرمجية باستخدام Apiman",
    "descriptionAr": "ما الذي يفعله مدير الواجهات البرمجية، وكيف يمثّله Apiman بالمؤسسات والخطط والتطبيقات العميلة والعقود، وما الذي تكسبه من وضع بوابة أمام واجهاتك.",
    "createdAt": 1685048400000,
    "updatedAt": 1685048400000,
    "draft": false,
    "tags": [
      "apiman",
      "api-management",
      "api-gateway"
    ],
    "featuredImage": "/articles/api_mgt_feat.jpg",
    "file": "getting_started with_apimaan_Introduction_to_api_management",
    "words": 743
  },
  {
    "title": "How to Cancel HTTP Requests in React using Axios",
    "description": "Stop stale requests when a user clicks quickly between categories. How to cancel Axios requests with AbortController in React, so old responses never overwrite new ones.",
    "titleAr": "إلغاء طلبات HTTP في React باستخدام Axios",
    "descriptionAr": "أوقف الطلبات القديمة حين ينتقل المستخدم بسرعة بين التصنيفات. كيف تلغي طلبات Axios بـ AbortController في React، حتى لا تكتب الاستجابات القديمة فوق الجديدة.",
    "createdAt": 1674334800000,
    "updatedAt": 1678568400000,
    "draft": false,
    "tags": [
      "react",
      "axios",
      "http-client"
    ],
    "featuredImage": "/articles/http_cancel_feat.jpg",
    "file": "cancel_http_requests_in_react",
    "words": 722
  },
  {
    "title": "How to Mock an API in ONE minute",
    "description": "Quick ways to stand up a mock API for tests and development: JSON Server for JavaScript, httptest in Go, mockito in Dart, and unittest.mock in Python.",
    "titleAr": "إنشاء واجهة برمجية وهمية في دقيقة واحدة",
    "descriptionAr": "طرق سريعة لتشغيل واجهة برمجية وهمية للاختبار والتطوير: JSON Server في JavaScript، وhttptest في Go، وmockito في Dart، وunittest.mock في Python.",
    "createdAt": 1671224400000,
    "updatedAt": 1671224400000,
    "draft": false,
    "tags": [
      "api",
      "testing"
    ],
    "featuredImage": "/articles/api_mock_feat.jpg",
    "file": "mocking_an_api_in_dart",
    "words": 877
  }
]

// The title and summary to list a post with: Arabic on Arabic pages, when a translation exists.
export const postText = (post: BlogPost, language: 'en' | 'ar') =>
  language === 'ar' && post.titleAr
    ? { title: post.titleAr, description: post.descriptionAr ?? post.description, lang: 'ar' as const }
    : { title: post.title, description: post.description, lang: 'en' as const }

export const publishedBlogs = blogs.filter(blog => !blog.draft).sort((a, b) => b.createdAt - a.createdAt)
