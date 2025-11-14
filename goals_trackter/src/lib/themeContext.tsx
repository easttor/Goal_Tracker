import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme
      return stored || 'light'
    } catch (e) {
      console.warn('localStorage not available:', e)
      return 'light'
    }
  })

  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme

  useEffect(() => {
    const root = document.documentElement
    
    // Remove both classes first
    root.classList.remove('light', 'dark')
    
    // Add the effective theme class
    root.classList.add(effectiveTheme)
    
    // Set color scheme meta tag
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (meta) {
      meta.setAttribute('content', effectiveTheme)
    } else {
      const newMeta = document.createElement('meta')
      newMeta.name = 'color-scheme'
      newMeta.content = effectiveTheme
      document.head.appendChild(newMeta)
    }
  }, [effectiveTheme])

  useEffect(() => {
    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(getSystemTheme())
      }
      
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('theme', newTheme)
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e)
    }
  }

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
