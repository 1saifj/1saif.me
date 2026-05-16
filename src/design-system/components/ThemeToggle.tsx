import React from 'react'
import { Sun, Moon } from '@phosphor-icons/react'
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
      className="p-2 rounded-full transition-colors duration-200 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50 active:scale-95"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun weight="bold" className="w-5 h-5" />
      ) : (
        <Moon weight="bold" className="w-5 h-5" />
      )}
    </button>
  )
}