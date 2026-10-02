import { useEffect, useState } from 'react'
import { readLocalTheme, writeLocalTheme, type Theme } from '../store/prefsStore'
import { subscribe } from '../store/authStore'

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export function useTheme() {
  // Without a saved choice we follow the OS but don't persist it: writing it
  // to prefs.theme would pin it for every CEITBA SPA as if the user chose it.
  const [theme, setTheme] = useState<Theme>(() => readLocalTheme() ?? systemTheme())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Auth → server prefs win on login. authStore.applyServerPrefs() already
  // wrote the localStorage value before notifying; lift it into local state
  // so the React tree re-renders with the new theme (no PATCH back).
  useEffect(() => {
    return subscribe(() => {
      const saved = readLocalTheme()
      if (saved) setTheme(saved)
    })
  }, [])

  // Only an explicit toggle persists locally and to the profile.
  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    writeLocalTheme(next)
  }

  return { theme, toggle }
}
