import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { themes, defaultThemeId, getThemeById, themeToCssVars, Theme } from './themes'

interface ThemeContextValue {
  theme: Theme
  themeId: string
  setThemeId: (id: string) => void
  availableThemes: Theme[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'speedbuilder-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored || defaultThemeId
  })

  const theme = getThemeById(themeId)

  const setThemeId = (id: string) => {
    setThemeIdState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  // Apply CSS variables to document root
  useEffect(() => {
    const cssVars = themeToCssVars(theme)
    const root = document.documentElement

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Also set a data attribute for potential CSS-based theming
    root.setAttribute('data-theme', theme.id)
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        setThemeId,
        availableThemes: themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
