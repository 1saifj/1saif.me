import React, { useState, useEffect } from 'react'
import { X, Shield, Cookie, Eye } from 'lucide-react'

interface GDPRBannerProps {
  onAccept?: () => void
  onDecline?: () => void
}

const GDPRBanner: React.FC<GDPRBannerProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('gdpr-consent')
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData))
    setIsVisible(false)
    onAccept?.()
  }

  const handleDeclineAll = () => {
    const consentData = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData))
    setIsVisible(false)
    onDecline?.()
  }

  const handleCustomSave = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData))
    setIsVisible(false)
    
    if (preferences.analytics || preferences.marketing || preferences.functional) {
      onAccept?.()
    } else {
      onDecline?.()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-4 md:max-w-md md:mx-auto">
        <div className="bg-white dark:bg-gray-900 border-t md:border md:rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Privacy Settings
              </h3>
            </div>
            <button
              onClick={handleDeclineAll}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {!showPreferences ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  By continuing to use our site, you consent to our use of cookies.
                </p>
                
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleDeclineAll}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Decline All
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Customize
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">Necessary</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Required for basic site functionality
                      </p>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">Always On</div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          preferences.analytics 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {preferences.analytics && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">Analytics</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Help us understand how visitors use our site
                      </p>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, functional: !prev.functional }))}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          preferences.functional 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {preferences.functional && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">Functional</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Enable enhanced functionality and personalization
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleCustomSave}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {/* Privacy Policy Link */}
            <div className="mt-3 text-center">
              <a
                href="/privacy"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GDPRBanner 