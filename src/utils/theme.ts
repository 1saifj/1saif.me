// The inline script in index.html sets html.dark before first paint; this only switches it.
export function toggleTheme() {
  const root = document.documentElement
  const next = root.classList.contains('dark') ? 'light' : 'dark'

  root.classList.remove('light', 'dark')
  root.classList.add(next)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0d1117' : '#ffffff')

  try {
    localStorage.setItem('theme', next)
  } catch {
    // The choice still applies for this visit when storage is unavailable.
  }
}
