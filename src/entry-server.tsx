import { Suspense, type ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Routes, Route } from 'react-router-dom'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { isArabicPath, LanguageProvider } from './i18n/language'
import { SkipLink } from './components/SkipLink'
import { routePaths, type RoutePath } from './routes'
import { HomePage } from './pages/HomePage'
import { BlogListingPage } from './pages/BlogListingPage'
import { BlogPost, prerenderedArticles } from './pages/BlogPost'
import { ProjectPage } from './pages/ProjectPage'
import { ResumePage } from './pages/ResumePage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { publishedBlogs } from './data/blogs'
import { projects } from './data/projects'
import { createSlugFromTitle } from './utils/slugUtils'
import { loadArticle } from './utils/contentLoader'
import { convertMarkdownToHtml } from './utils/markdownProcessor'

// The same route table as App.tsx, with every page eager: the server has no chunk to load.
const routePages: Record<RoutePath, ComponentType> = {
  '/': HomePage,
  '/blog': BlogListingPage,
  '/blog/:slug': BlogPost,
  '/project/:slug': ProjectPage,
  '/resume': ResumePage,
  '/privacy': PrivacyPolicyPage,
}

// The fixed routes come from the shared list; the pages with data come from the content.
const staticPaths = routePaths.filter(path => !path.includes(':'))

// Build-time only (scripts/prerender.mjs): renders each route to static HTML so content paints before JavaScript runs.
const englishRoutes = [
  ...staticPaths,
  ...projects.map(project => `/project/${createSlugFromTitle(project.name)}`),
  ...publishedBlogs.map(post => `/blog/${createSlugFromTitle(post.title)}`),
]

// Every page also exists in Arabic under /ar.
export const routes = [...englishRoutes, ...englishRoutes.map(route => route === '/' ? '/ar' : `/ar${route}`)]

// Article bodies load asynchronously in the app; render them up front so the static page has the text.
export async function prepare(url: string) {
  const path = url.replace(/^\/ar(?=\/|$)/, '')
  const post = publishedBlogs.find(p => `/blog/${createSlugFromTitle(p.title)}` === path)

  if (!post?.file) return
  const content = await loadArticle(post.file)

  if (content) prerenderedArticles.set(createSlugFromTitle(post.title), convertMarkdownToHtml(content))
}

type HelmetContext = { helmet?: HelmetServerState }

export function render(url: string) {
  const helmetContext: HelmetContext = {}
  const arabic = isArabicPath(url)

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url} basename={arabic ? '/ar' : undefined}>
        <LanguageProvider language={arabic ? 'ar' : 'en'}>
            <SkipLink />
            {/* Same boundary as App.tsx, so the server markup matches what the client hydrates. */}
            <Suspense fallback={null}>
              <Routes>
                {routePaths.map(path => {
                  const Page = routePages[path]

                  return <Route key={path} path={path} element={<Page />} />
                })}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
        </LanguageProvider>
      </StaticRouter>
    </HelmetProvider>,
  )

  const helmet = helmetContext.helmet
  const head = helmet ? [helmet.title, helmet.meta, helmet.link, helmet.script].map(part => part.toString()).join('\n') : ''

  return { html, head, arabic }
}
