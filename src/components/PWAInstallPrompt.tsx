import React, { useState } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWA()
  const [isVisible, setIsVisible] = useState(true)

  if (!isInstallable || !isVisible) return null

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 backdrop-blur-md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Install App</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Get quick access to my portfolio
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
            <Monitor className="w-4 h-4" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
            <Download className="w-4 h-4" />
            <span>Fast loading</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}