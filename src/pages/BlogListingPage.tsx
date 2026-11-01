import React from 'react'
import { BlogListing } from '../components/BlogListing'
import { BreadcrumbStructuredData } from '../components/StructuredData'
import SEOHead from '../components/SEOHead'
import { useLanguage } from '../i18n/language'

const seo = {
  en: { title: 'Writing | Saif Aljanahi', description: 'Notes by Saif Aljanahi on databases, Go, Flutter, and the tools he uses at work.' },
  ar: { title: 'المقالات | سيف الجناحي', description: 'ملاحظات سيف الجناحي عن قواعد البيانات وGo وFlutter والأدوات التي يستخدمها في عمله.' },
}

export const BlogListingPage: React.FC = () => {
  const { language } = useLanguage()

  return (
    <>
      <SEOHead
        title={seo[language].title}
        description={seo[language].description}
        tags={['golang', 'postgresql', 'flutter', 'backend', 'system design']}
        url="https://1saif.me/blog"
        type="website"
      />
      <BreadcrumbStructuredData items={[[language === 'ar' ? 'الصفحة الرئيسية' : 'Home', language === 'ar' ? '/ar' : '/'], [language === 'ar' ? 'المقالات' : 'Writing', `${language === 'ar' ? '/ar' : ''}/blog`]]} />
      <BlogListing />
    </>
  )
}
