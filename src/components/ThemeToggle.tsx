import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ] as const

  return (
    <div className="relative">
      <div className="flex items-center bg-white/10 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-1 border border-white/20 dark:border-slate-700/50 shadow-lg">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`p-3 rounded-lg transition-all duration-200 ${
              theme === value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={`Switch to ${label} theme`}
            aria-label={`Switch to ${label} theme`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  )
}