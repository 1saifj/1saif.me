import React from 'react'
import { SiteHeader } from '../components/SiteHeader'
import SEOHead from '../components/SEOHead'
import { SiteFooter } from '../components/SiteFooter'
import { dateLocale, useLanguage } from '../i18n/language'

// Change this date whenever the policy text changes.
const lastUpdated = new Date('2026-10-29T00:00:00')

const copy = {
  en: {
    seoTitle: 'Privacy | Saif Aljanahi',
    seoDescription: "A clear explanation of the personal data collected by Saif Aljanahi's portfolio website and how it is used.",
    updated: 'Last updated:',
    title: 'Privacy policy',
    intro: 'This policy describes what happens to information shared with Saif Aljanahi through this personal portfolio. The site is designed to collect as little as possible and to make every use clear.',
    sections: ['Introduction', 'Data collected', 'How it is used', 'Services', 'Your rights', 'Contact'],
    introBody: ['This policy applies to 1saif.me and its related pages. “I”, “me”, and “my” refer to Saif Ali Aljanahi. I do not sell, rent, or trade personal information.', 'When a third-party service is used for hosting or email, it receives only the information needed to provide that service.'],
    what: 'What:', why: 'Why:', kept: 'Kept:',
    dataTypes: [
      ['Contact details', 'Name, email address, and anything you choose to include when you get in touch.', 'To reply to your message or provide a requested service.', 'Three years from the last contact.'],
      ['Technical data', 'IP address, browser type, and referring website. The IP address is also used for a short time to limit how many sign-ins and messages one visitor can send, and by Cloudflare Turnstile on the contact form. It is not stored with likes, comments or page views.', 'To keep the site secure and diagnose delivery issues.', 'Twelve months.'],
      ['GitHub account', 'When you sign in with GitHub to like or comment: your GitHub account ID, username and display name, from your public profile. Your picture loads from GitHub. Two cookies keep you signed in for 30 days: a signed session cookie, and one that holds your public profile so the page can show it. A third signed cookie lasts 10 minutes while you sign in, to check that the answer from GitHub belongs to your request. The GitHub access token is used once and never stored.', 'To show who wrote each comment, to count one like per account, and to let you delete your comments and remove your likes.', 'Until you ask for removal. Signing out removes the cookies.'],
      ['Comments', 'The comment you post under an article. It is shown publicly on that article with your GitHub name, username and picture. Each new comment is also emailed to me, so I can remove abuse.', 'To show the discussion under each article and to remove abuse.', 'Until you delete it or ask for removal, or the article is removed.'],
      ['Likes', 'That your GitHub account likes an article. Only the total count is shown.', 'To count each like once and to let you remove it.', 'Until you remove the like or ask for removal.'],
      ['Page views and speed', 'The page address, the site that sent you (its domain only), language, country, device type (from the screen width) and page speed measurements. No cookie, no ID and no IP address is stored. Nothing is sent when your browser sends Do Not Track or Global Privacy Control.', 'To learn which pages people read and to keep the site fast.', 'Three months.'],
    ],
    uses: ['Reply to contact messages and provide requested information.', 'Show comments and like counts on articles.', 'Understand site usage and improve performance and clarity.', 'Protect the site from abuse and keep the service reliable.', 'Meet legal obligations when they apply.'],
    services: [['Email service', 'Delivers replies to contact messages, and sends me each new comment.'], ['Spam protection', 'Cloudflare Turnstile checks that the contact form is sent by a person. It loads on the home page after the page has loaded.'], ['GitHub', 'Signs you in to like and comment, and serves the profile pictures shown with comments. GitHub sees your IP address when your browser loads a picture.'], ['Database and analytics', 'Cloudflare D1 stores likes and comments. Cloudflare Workers Analytics Engine stores the anonymous page views.'], ['Hosting provider', 'Serves the site and its static assets.'], ['Legal requirements', 'Information may be shared when required by law or to protect rights.']],
    rights: [['Access', 'Ask what personal data is held about you.'], ['Rectification', 'Ask for inaccurate information to be corrected.'], ['Erasure', 'Ask for your personal data to be deleted.'], ['Portability', 'Request a copy of your data in a machine-readable format.'], ['Object', 'Object to particular types of processing.'], ['Restriction', 'Ask for how your data is used to be limited.']],
    contactBody: 'If you want to ask about this policy or exercise one of these rights, email me. I aim to respond within 30 days.',
    name: 'Saif Aljanahi',
  },
  ar: {
    seoTitle: 'الخصوصية | سيف الجناحي',
    seoDescription: 'شرح واضح للبيانات الشخصية التي يجمعها موقع سيف الجناحي وكيفية استخدامها.',
    updated: 'آخر تحديث:',
    title: 'سياسة الخصوصية',
    intro: 'توضّح هذه السياسة ما يحدث للمعلومات التي تشاركها مع سيف الجناحي عبر هذا الموقع الشخصي. صُمّم الموقع ليجمع أقل قدر ممكن من البيانات، وليوضّح كل استخدام لها.',
    sections: ['مقدمة', 'البيانات المجمَّعة', 'كيفية الاستخدام', 'الخدمات', 'حقوقك', 'التواصل'],
    introBody: ['تنطبق هذه السياسة على 1saif.me والصفحات المرتبطة به. تشير ضمائر المتكلم إلى سيف علي الجناحي. لا أبيع المعلومات الشخصية ولا أؤجّرها ولا أتاجر بها.', 'عند استخدام خدمة خارجية للاستضافة أو البريد الإلكتروني، فإنها لا تتلقى إلا المعلومات اللازمة لتقديم تلك الخدمة.'],
    what: 'الوصف:', why: 'لماذا:', kept: 'مدة الاحتفاظ:',
    dataTypes: [
      ['بيانات التواصل', 'الاسم، وعنوان البريد الإلكتروني، وأي معلومات تختار إرسالها عند التواصل.', 'للرد على رسالتك أو تقديم خدمة طلبتها.', 'ثلاث سنوات من آخر تواصل.'],
      ['البيانات التقنية', 'عنوان IP، ونوع المتصفح، والموقع الذي أحالك. ويُستخدم عنوان IP أيضاً لوقت قصير لتحديد عدد مرات تسجيل الدخول والرسائل التي يرسلها الزائر الواحد، وتستخدمه Cloudflare Turnstile في نموذج التواصل. ولا يُحفظ مع الإعجابات أو التعليقات أو زيارات الصفحات.', 'لحماية الموقع وتشخيص مشكلات التحميل.', 'اثنا عشر شهراً.'],
      ['حساب GitHub', 'عندما تسجّل الدخول عبر GitHub لتُعجب أو تعلّق: معرّف حسابك على GitHub، واسم المستخدم، والاسم المعروض، من ملفك العام. وتُحمَّل صورتك من GitHub. ويُبقيك ملفّا تعريف ارتباط مسجّلاً للدخول 30 يوماً: ملف جلسة موقَّع، وملف يحمل ملفك العام لتعرضه الصفحة. ويبقى ملف ثالث موقَّع 10 دقائق أثناء تسجيل الدخول، للتحقق من أن رد GitHub يخص طلبك. ويُستخدم رمز الوصول من GitHub مرة واحدة ولا يُحفظ.', 'لإظهار كاتب كل تعليق، واحتساب إعجاب واحد لكل حساب، ولتتمكن من حذف تعليقاتك وإلغاء إعجاباتك.', 'حتى تطلب الحذف. ويحذف تسجيل الخروج ملفات تعريف الارتباط.'],
      ['التعليقات', 'التعليق الذي تنشره تحت مقال. ويظهر للجميع على ذلك المقال مع اسمك واسم المستخدم وصورتك على GitHub. وتصلني نسخة من كل تعليق جديد بالبريد الإلكتروني لأزيل الإساءة.', 'لعرض النقاش تحت كل مقال وإزالة الإساءة.', 'حتى تحذفه أو تطلب حذفه، أو يُحذف المقال.'],
      ['الإعجابات', 'أن حسابك على GitHub أُعجب بمقال. ولا يظهر إلا العدد الإجمالي.', 'لاحتساب كل إعجاب مرة واحدة، ولتتمكن من إلغائه.', 'حتى تلغي الإعجاب أو تطلب حذفه.'],
      ['زيارات الصفحات والسرعة', 'عنوان الصفحة، والموقع الذي أحالك (اسم نطاقه فقط)، واللغة، والبلد، ونوع الجهاز (من عرض الشاشة)، وقياسات سرعة الصفحة. لا يُحفظ ملف تعريف ارتباط ولا معرّف ولا عنوان IP. ولا يُرسَل شيء إذا كان متصفحك يرسل إشارة Do Not Track أو Global Privacy Control.', 'لمعرفة الصفحات التي يقرؤها الناس وللحفاظ على سرعة الموقع.', 'ثلاثة أشهر.'],
    ],
    uses: ['الرد على رسائل التواصل وتقديم المعلومات المطلوبة.', 'عرض التعليقات وعدد الإعجابات على المقالات.', 'فهم طريقة استخدام الموقع وتحسين أدائه ووضوحه.', 'حماية الموقع من إساءة الاستخدام والحفاظ على موثوقيته.', 'الوفاء بالالتزامات القانونية عند انطباقها.'],
    services: [['خدمة البريد الإلكتروني', 'تُرسل الردود على رسائل التواصل، وترسل إليّ كل تعليق جديد.'], ['الحماية من البريد المزعج', 'تتحقّق Cloudflare Turnstile من أن نموذج التواصل يرسله شخص. وتُحمَّل في الصفحة الرئيسية بعد اكتمال تحميلها.'], ['GitHub', 'يسجّل دخولك لتُعجب وتعلّق، ويقدّم صور الملفات الشخصية التي تظهر مع التعليقات. ويرى GitHub عنوان IP الخاص بك عندما يحمّل متصفحك صورة.'], ['قاعدة البيانات والإحصاءات', 'تحفظ Cloudflare D1 الإعجابات والتعليقات، وتحفظ Cloudflare Workers Analytics Engine زيارات الصفحات المجهولة الهوية.'], ['مزوّد الاستضافة', 'يقدّم الموقع وملفاته الثابتة.'], ['المتطلبات القانونية', 'قد تُشارك المعلومات عندما يفرض القانون ذلك أو لحماية الحقوق.']],
    rights: [['الاطّلاع', 'أن تسأل عن البيانات الشخصية المحفوظة عنك.'], ['التصحيح', 'أن تطلب تصحيح المعلومات غير الدقيقة.'], ['الحذف', 'أن تطلب حذف بياناتك الشخصية.'], ['قابلية النقل', 'أن تطلب نسخة من بياناتك بصيغة يقرؤها الحاسوب.'], ['الاعتراض', 'أن تعترض على أنواع معيّنة من المعالجة.'], ['التقييد', 'أن تطلب تقييد طريقة استخدام بياناتك.']],
    contactBody: 'إذا أردت الاستفسار عن هذه السياسة أو ممارسة أحد هذه الحقوق، راسلني عبر البريد الإلكتروني. أسعى للرد خلال 30 يوماً.',
    name: 'سيف الجناحي',
  },
}

export const PrivacyPolicyPage: React.FC = () => {
  const { language } = useLanguage()
  const t = copy[language]
  const ids = ['privacy-introduction', 'privacy-data', 'privacy-use', 'privacy-services', 'privacy-rights', 'privacy-contact']

  return (
    <>
      <SEOHead title={t.seoTitle} description={t.seoDescription} url="https://1saif.me/privacy" type="website" />
      <div className="site-shell site-privacy-page">
        <SiteHeader />

        <main id="main-content">
          <article className="plain-page">
            <header>
              <h1>{t.title}</h1>
              <p className="plain-lede">{t.intro}</p>
              <p className="plain-meta">{t.updated} {lastUpdated.toLocaleDateString(dateLocale(language), { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            <section className="plain-section" aria-labelledby={ids[0]}>
              <div>
                <h2 id={ids[0]}>{t.sections[0]}</h2>
                {t.introBody.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>

            <section className="plain-section" aria-labelledby={ids[1]}>
              <div>
                <h2 id={ids[1]}>{t.sections[1]}</h2>
                <div className="site-privacy-table">
                  {t.dataTypes.map(([type, description, purpose, retention]) => (
                    <div className="site-privacy-row" key={type}>
                      <h3>{type}</h3>
                      <div>
                        <p><strong>{t.what}</strong> {description}</p>
                        <p><strong>{t.why}</strong> {purpose}</p>
                        <p><strong>{t.kept}</strong> {retention}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="plain-section" aria-labelledby={ids[2]}>
              <div>
                <h2 id={ids[2]}>{t.sections[2]}</h2>
                <ul className="site-privacy-list">{t.uses.map(use => <li key={use}>{use}</li>)}</ul>
              </div>
            </section>

            <section className="plain-section" aria-labelledby={ids[3]}>
              <div>
                <h2 id={ids[3]}>{t.sections[3]}</h2>
                <div className="site-privacy-services">
                  {t.services.map(([name, body]) => <p key={name}><strong>{name}</strong><span>{body}</span></p>)}
                </div>
              </div>
            </section>

            <section className="plain-section" aria-labelledby={ids[4]}>
              <div>
                <h2 id={ids[4]}>{t.sections[4]}</h2>
                <div className="site-privacy-rights">
                  {t.rights.map(([title, description]) => <div key={title}><h3>{title}</h3><p>{description}</p></div>)}
                </div>
              </div>
            </section>

            <section className="plain-section" aria-labelledby={ids[5]}>
              <div>
                <h2 id={ids[5]}>{t.sections[5]}</h2>
                <p>{t.contactBody}</p>
                <a className="site-button" href="mailto:hello@1saif.me" dir="ltr">hello@1saif.me <span aria-hidden>↗</span></a>
              </div>
            </section>
          </article>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
