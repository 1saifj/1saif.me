import { lazy, Suspense, useCallback, useEffect, useRef, type ComponentType } from 'react'
import { BrowserRouter as Router, Routes, Route, useHref, useLocation, useNavigate } from 'react-router-dom'
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

// Chrome 111+ and Safari 18+ run view transitions; every other browser keeps the CSS page fade.
// Reduced motion keeps it too: no transition, and the stylesheet's fade is off for those visitors.
const canTransition = () => 'startViewTransition' in document && window.matchMedia('(prefers-reduced-motion: no-preference)').matches

// The transition's update callback resolves here, once the new route is in the DOM, so the browser
// takes its new snapshot of the new page and not of the old one or the route skeleton.
let settleTransition: (() => void) | null = null

let transitionPath = ''

const settleRoute = (pathname: string) => {
  if (!settleTransition || pathname !== transitionPath) return

  const settle = settleTransition

  settleTransition = null
  // Cleared here too, so a navigation that only settled by timeout does not block later fades.
  transitionPath = ''
  // Not in a frame: the browser pauses frames while it waits for this promise. Every effect of the
  // commit has already run (scroll to top, #hash scrolling), so the new snapshot shows the final page.
  settle()
}

// Shown only if a route chunk takes longer than 200 ms (see .route-skeleton in index.html).
function RouteSkeleton() {
  const arabic = document.documentElement.lang === 'ar'

  return <div className="route-skeleton" role="status"><span className="sr-only">{arabic ? 'جارٍ التحميل' : 'Loading'}</span><span className="route-skeleton-title" /><span style={{ width: '48%' }} /><span /><span style={{ width: '80%' }} /></div>
}

// The paths the router owns. Another same-origin file (/cv.html, /rss.xml) keeps the browser's own click.
const isAppPath = (path: string) => path === '/' || path === '/blog' || path === '/resume' || path === '/privacy' || path.startsWith('/blog/') || path.startsWith('/project/')

// In-site link clicks run in a view transition: the pages cross-fade while the header keeps its own
// snapshot (view-transition-name in index.html) and stays put. Back/forward and the search dialog
// are not wrapped, so they keep the data-nav fade below, as does every browser without the API.
function RouteTransitions() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // Where the router is mounted: '' in English, '/ar' under the Arabic basename.
  const base = useHref('/').replace(/\/+$/, '')

  const go = useCallback(async (path: string, search: string, hash: string) => {
    // The chunk loads before the transition starts, so a slow network never freezes the old page.
    await preloadRoute(path).catch(() => undefined)

    // The CSS fade and the view transition must never run on the same navigation.
    delete document.documentElement.dataset.nav
    transitionPath = path

    const transition = document.startViewTransition(() => new Promise<void>(resolve => {
      settleTransition = resolve
      navigate(`${path}${search}${hash}`)
      // A navigation that never commits must not leave the page frozen behind the old snapshot.
      window.setTimeout(() => settleRoute(path), 1500)
    }))

    void transition.finished.catch(() => undefined)
  }, [navigate])

  useEffect(() => {
    // Capture phase: this runs before React Router's own Link handler, so the click is ours to wrap.
    const onClick = (event: MouseEvent) => {
      // Other buttons, new tabs, downloads and modified clicks keep their usual behaviour.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      if (!canTransition()) return

      const anchor = event.target instanceof Element ? event.target.closest('a') : null

      // The search results are links inside a dialog, and they close it themselves before navigating.
      if (!anchor || anchor.target || anchor.closest('dialog') || anchor.hasAttribute('download') || anchor.rel.split(/\s+/).includes('external')) return

      const url = new URL(anchor.href)
      const inside = base ? url.pathname === base || url.pathname.startsWith(`${base}/`) : url.pathname.startsWith('/')

      if (url.origin !== location.origin || !inside) return

      const path = url.pathname.slice(base.length) || '/'

      // A #hash link on this page scrolls; it is not a page change.
      if (path === pathname || !isAppPath(path)) return

      event.preventDefault()
      event.stopPropagation()
      void go(path, url.search, url.hash)
    }

    document.addEventListener('click', onClick, true)

    return () => document.removeEventListener('click', onClick, true)
  }, [base, pathname, go])

  return null
}

// After an in-site link: start the new page at the top (a #section link scrolls itself),
// and mark the document so the new page fades in. The first load is never marked.
function RouteChange() {
  const { pathname, hash } = useLocation()
  const last = useRef(pathname)

  useEffect(() => {
    if (last.current === pathname) return
    last.current = pathname
    const transitioned = transitionPath === pathname

    // With a view transition the cross-fade is the effect; the CSS fade must not run on top of it.
    if (transitioned) {
      settleRoute(pathname)
    } else if (!transitionPath) {
      // No transition in flight either: the CSS fade is the effect for this navigation.
      document.documentElement.dataset.nav = ''
    }

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
          <RouteTransitions />
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
