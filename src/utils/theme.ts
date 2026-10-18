// The inline script in index.html sets html.dark before first paint; this only switches it.
export function toggleTheme() {
  const root = document.documentElement
  const next = root.classList.contains('dark') ? 'light' : 'dark'

  const apply = () => {
    root.classList.remove('light', 'dark')
    root.classList.add(next)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0d1117' : '#ffffff')
  }

  // Cross-fade the whole page between themes where the browser can, unless the visitor asked for less motion.
  if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply)
  else apply()

  try {
    localStorage.setItem('theme', next)
  } catch {
    // The choice still applies for this visit when storage is unavailable.
  }
}
