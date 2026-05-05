import { apiRequest } from '../api/client'
import { getCachedSession } from './authStore'

// Same prefs.theme / prefs.lang convention as the other CEITBA SPAs so a
// same-tab navigation between scheduler ↔ ceitbapage ↔ itbanews keeps the
// look-and-feel without flicker. Server is canonical for logged-in users;
// cache wins for anonymous.

export type Theme = 'light' | 'dark'
export type Lang  = 'es' | 'en'

const KEYS = { theme: 'prefs.theme', lang: 'prefs.lang' } as const

export function readLocalTheme(): Theme | null {
  const v = localStorage.getItem(KEYS.theme)
  return v === 'light' || v === 'dark' ? v : null
}

export function readLocalLang(): Lang | null {
  const v = localStorage.getItem(KEYS.lang)
  return v === 'es' || v === 'en' ? v : null
}

export function writeLocalTheme(t: Theme): void {
  localStorage.setItem(KEYS.theme, t)
  document.documentElement.classList.toggle('dark', t === 'dark')
  void syncPrefToServer({ theme: t })
}

export function writeLocalLang(l: Lang): void {
  localStorage.setItem(KEYS.lang, l)
  void syncPrefToServer({ language: l })
}

async function syncPrefToServer(patch: { theme?: Theme; language?: Lang }): Promise<void> {
  if (getCachedSession() == null) return
  try { await apiRequest('PATCH', '/me/preferences', patch) } catch { /* ignore */ }
}
