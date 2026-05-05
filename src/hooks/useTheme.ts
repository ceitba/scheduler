import { useEffect, useState } from 'react'
import { readLocalTheme, writeLocalTheme, type Theme } from '../store/prefsStore'
import { subscribe } from '../store/authStore'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = readLocalTheme()
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    writeLocalTheme(theme)
  }, [theme])

  // Auth → server prefs win on login. authStore.applyServerPrefs() already
  // wrote the localStorage value before notifying; lift it into local state
  // so the React tree re-renders with the new theme.
  useEffect(() => {
    return subscribe(() => {
      const saved = readLocalTheme()
      if (saved && saved !== theme) setTheme(saved)
    })
  }, [theme])

  const toggle = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return { theme, toggle }
}
