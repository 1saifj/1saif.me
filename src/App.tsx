import { lazy, Suspense, useEffect, useRef, type ComponentType } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { SkipLink } from './components/SkipLink'
import { isArabicPath, LanguageProvider } from './i18n/language'

// Each page chunk also waits for the route stylesheet, so a page never paints unstyled.
// Once loaded, a page renders directly instead of suspending: main.tsx loads the current route
// before mounting, so the prerendered HTML is never swapped for the loading fallback.
const page = <M,>(load: () => Promise<M>, pick: (module: M) => ComponentType) => {
  let Loaded: ComponentType | undefined
  const loadComponent = () => Promise.all([import('./index.css'), load()]).then(([, module]) => (Loaded = pick(module)))
  const Lazy = lazy(() => loadComponent().then(Component => ({ default: Component })))
  const preload = (): Promise<void> => loadComponent().then(() => undefined)
  const Page = () => (Loaded ? <Loaded /> : <Lazy />)

  return Object.assign(Page, { preload })
}

const BlogPost = page(() => import('./pages/BlogPost'), m => m.BlogPost)

const BlogListingPage = page(() => import('./pages/BlogListingPage'), m => m.BlogListingPage)

const ProjectPage = page(() => import('./pages/ProjectPage'), m => m.ProjectPage)

const ResumePage = page(() => import('./pages/ResumePage'), m => m.ResumePage)

const PrivacyPolicyPage = page(() => import('./pages/PrivacyPolicyPage'), m => m.PrivacyPolicyPage)

const NotFoundPage = page(() => import('./pages/NotFoundPage'), m => m.NotFoundPage)

export const preloadRoute = (pathname: string): Promise<void> => {
  const path = pathname.replace(/\/+$/, '') || '/'

  if (path === '/') return Promise.resolve()

  if (path === '/blog') return BlogListingPage.preload()

  if (path.startsWith('/blog/')) return BlogPost.preload()

  if (path.startsWith('/project/')) return ProjectPage.preload()

  if (path === '/resume') return ResumePage.preload()

  if (path === '/privacy') return PrivacyPolicyPage.preload()

  return NotFoundPage.preload()
}

// Shown only if a route chunk takes longer than 200 ms (see .route-skeleton in index.html).
function RouteSkeleton() {
  const arabic = document.documentElement.lang === 'ar'

  return <div className="route-skeleton" role="status"><span className="sr-only">{arabic ? 'جارٍ التحميل' : 'Loading'}</span><span className="route-skeleton-title" /><span style={{ width: '48%' }} /><span /><span style={{ width: '80%' }} /></div>
}

// After an in-site link: start the new page at the top (a #section link scrolls itself),
// and mark the document so the new page fades in. The first load is never marked.
function RouteChange() {
  const { pathname, hash } = useLocation()
  const last = useRef(pathname)

  useEffect(() => {
    if (last.current === pathname) return
    last.current = pathname
    document.documentElement.dataset.nav = ''
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

function App() {
  const arabic = isArabicPath(window.location.pathname)

  // Under /ar the router's basename adds the prefix to every link, so pages stay unaware of it.
  return (
    <Router basename={arabic ? '/ar' : undefined} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider language={arabic ? 'ar' : 'en'}>
          <SkipLink />
          <RouteChange />
          <Suspense fallback={<RouteSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog" element={<BlogListingPage />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/project/:slug" element={<ProjectPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
      </LanguageProvider>
    </Router>
  )
}

export default App
