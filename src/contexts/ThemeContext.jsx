import { useEffect, useState } from 'react'
import ThemeContext from './theme-context'
const THEME_STORAGE_KEY = 'theme'
const DARK_THEME = 'dark'
const LIGHT_THEME = 'light'

const getInitialTheme = () => {
  if (typeof window === 'undefined') return LIGHT_THEME

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === DARK_THEME || savedTheme === LIGHT_THEME) {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK_THEME
    : LIGHT_THEME
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === DARK_THEME

    root.classList.toggle(DARK_THEME, isDark)
    root.dataset.theme = theme
    root.style.colorScheme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME
    )
  }

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDark: theme === DARK_THEME }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
