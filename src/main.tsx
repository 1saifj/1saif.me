import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App, { preloadRoute } from './App.tsx'
import { startInsights } from './utils/insights'

const root = document.getElementById('root')!

const app = (
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
)

// Hydrate HTML that was prerendered for this exact URL, so nothing on screen is painted twice.
// A 404 page was rendered for another path, so it renders fresh instead.
const mount = () => root.dataset.route === location.pathname ? hydrateRoot(root, app) : createRoot(root).render(app)

// The prerendered page stays on screen while its chunk loads; a failed load still mounts and retries lazily.
preloadRoute(location.pathname.replace(/^\/ar(?=\/|$)/, '')).then(mount, mount)

startInsights()
