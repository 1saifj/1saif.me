import React, { useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This ensures the theme hook is always called and theme is initialized
  const { theme } = useTheme()
  
  useEffect(() => {
    // Theme is automatically applied by the useTheme hook
    console.log('Theme initialized:', theme)
  }, [theme])
  
  return <>{children}</>
}