import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const isDarkMode = theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-300 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  )
}