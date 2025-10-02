import React, { useEffect, useState } from 'react'
import Giscus from '@giscus/react'
import '../styles/giscus.css'

interface GiscusCommentsProps {
  postSlug: string
  postTitle: string
}

export const GiscusComments: React.FC<GiscusCommentsProps> = ({ postSlug, postTitle }) => {
  const [theme, setTheme] = useState<string>('')

  useEffect(() => {
    // Listen for theme changes and switch to our custom theme URLs
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      // Use absolute URL to ensure themes are loaded correctly
      const baseUrl = window.location.origin
      setTheme(isDark ? `${baseUrl}/giscus-themes/dark.css` : `${baseUrl}/giscus-themes/light.css`)
    }

    // Initial theme detection
    updateTheme()

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="mt-8 sm:mt-12 lg:mt-16">
      {/* Elegant separator */}
      <div className="relative mb-8 sm:mb-12">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-white dark:bg-slate-900 px-4 sm:px-6">
            <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Comments header */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <div className="text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Join the Discussion
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto sm:mx-0">
            Share your thoughts, ask questions, or start a conversation. Comments are powered by GitHub Discussions—
            <span className="font-medium text-slate-700 dark:text-slate-300"> sign in with your GitHub account to participate.</span>
          </p>
        </div>
      </div>

      {/* Comments container with design system styling */}
      <div className="relative">
        {/* Background card */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 transition-all duration-300">
          
          {/* Loading state overlay */}
          <div className="absolute inset-4 sm:inset-6 lg:inset-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300" id="giscus-loading">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading discussions...</span>
            </div>
          </div>

          {/* Giscus component with responsive styling */}
          <div className="giscus-container">
            <Giscus
              id="comments"
              repo="1saifj/1saif.me"
              repoId="R_kgDOO8JSGw"
              category="General"
              categoryId="DIC_kwDOO8JSG84CrpY7"
              mapping="pathname"
              term={postSlug}
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="top"
              theme={theme}
              lang="en"
              loading="lazy"
              data-strict="0"
              data-reactions-enabled="1"
              data-emit-metadata="0"
              data-input-position="top"
              data-loading="lazy"
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-20 dark:opacity-10 -z-10"></div>
      </div>
    </section>
  )
}
