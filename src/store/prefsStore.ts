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

// Called from authStore after a successful /me. Server values overwrite
// the local cache; the `dark` class is applied here so the page repaints
// without the user toggling.
export function applyServerPrefs(profile: { theme: string | null; language: string | null }): void {
  if (profile.theme === 'light' || profile.theme === 'dark') {
    localStorage.setItem(KEYS.theme, profile.theme)
    document.documentElement.classList.toggle('dark', profile.theme === 'dark')
  }
  if (profile.language === 'es' || profile.language === 'en') {
    localStorage.setItem(KEYS.lang, profile.language)
  }
}

async function syncPrefToServer(patch: { theme?: Theme; language?: Lang }): Promise<void> {
  if (getCachedSession() == null) return
  try { await apiRequest('PATCH', '/me/preferences', patch) } catch { /* ignore */ }
}
