import { createContext, useContext } from 'react'

export interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggle: () => void
}

// Kept apart from ThemeProvider (ThemeContext.tsx) so that file only
// exports a component and stays Fast Refresh friendly.
export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeProvider')
  return ctx
}
