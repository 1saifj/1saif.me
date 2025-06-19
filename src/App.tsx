import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { BlogPost } from './pages/BlogPost'
import { BlogListingPage } from './pages/BlogListingPage'
import { ProjectPage } from './pages/ProjectPage'
import { ResumePage } from './pages/ResumePage'
import { ConfirmSubscriptionPage } from './pages/ConfirmSubscriptionPage'
import { UnsubscribePage } from './pages/UnsubscribePage'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import TemplatesDemo from './pages/TemplatesDemo'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { SkipLink } from './components/SkipLink'
import AnalyticsProvider, { useAnalytics } from './components/Analytics'
import PerformanceMonitor from './components/PerformanceMonitor'
import Clarity from '@microsoft/clarity'

function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { trackPageView } = useAnalytics()
  Clarity.init('s10i1oa5td');

  useEffect(() => {
    trackPageView(location.pathname, document.title)
  }, [location, trackPageView])

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <AnalyticsProvider>
        <AnalyticsWrapper>
          <SkipLink />
          <PerformanceMonitor />
          <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog" element={<BlogListingPage />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/project/:slug" element={<ProjectPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/confirm-subscription" element={<ConfirmSubscriptionPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/newsletter-templates" element={<TemplatesDemo />} />
            </Routes>
            <PWAInstallPrompt />
          </div>
        </AnalyticsWrapper>
      </AnalyticsProvider>
    </Router>
  )
}

export default App