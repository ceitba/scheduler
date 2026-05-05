import { apiRequest, BASE_URL } from '../api/client'

// Note: server prefs (theme/language) are applied inline below instead of
// delegating to prefsStore.applyServerPrefs. The previous version created
// a circular import (authStore → prefsStore → authStore) which Rollup
// minified into a TDZ crash on click events. prefsStore can still import
// from us; we don't import from prefsStore.

export interface UserProfile {
  id: string
  name: string | null
  email: string
  role: 'staff' | 'user' | string
  avatarUrl: string | null
  theme: 'light' | 'dark' | null
  language: 'es' | 'en' | null
  careerId: string | null
  plan: string | null
  fileNumber: number | null
}

let _profile: UserProfile | null = null
let _hydrated = false
let _hydratePromise: Promise<UserProfile | null> | null = null
const _listeners = new Set<(p: UserProfile | null) => void>()

function notify() { _listeners.forEach((fn) => fn(_profile)) }

export function subscribe(fn: (p: UserProfile | null) => void): () => void {
  _listeners.add(fn)
  return () => { _listeners.delete(fn) }
}

export function startGoogleSignIn(): void {
  const redirectUri =
    (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) ??
    `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`
  window.location.href = `${BASE_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`
}

export async function getSession(opts: { force?: boolean } = {}): Promise<UserProfile | null> {
  if (_hydrated && !opts.force) return _profile
  if (_hydratePromise) return _hydratePromise
  _hydratePromise = (async () => {
    try {
      const res = await apiRequest('GET', '/auth/me')
      if (res.ok) {
        _profile = (await res.json()) as UserProfile
        applyServerPrefs(_profile)
      } else {
        _profile = null
      }
    } catch {
      _profile = null
    } finally {
      _hydrated = true
      _hydratePromise = null
      notify()
    }
    return _profile
  })()
  return _hydratePromise
}

// Inline copy of what prefsStore.applyServerPrefs used to do. Lives here so
// authStore has no dependency on prefsStore — see top-of-file comment for
// the cycle-induced TDZ this avoids. Subscribers (useTheme, i18n) pick up
// the new localStorage values on the notify() that follows.
function applyServerPrefs(profile: UserProfile | null): void {
  if (!profile) return
  if (profile.theme === 'light' || profile.theme === 'dark') {
    localStorage.setItem('prefs.theme', profile.theme)
    document.documentElement.classList.toggle('dark', profile.theme === 'dark')
  }
  if (profile.language === 'es' || profile.language === 'en') {
    localStorage.setItem('prefs.lang', profile.language)
  }
}

export function getCachedSession(): UserProfile | null {
  return _profile
}

export async function signOut(): Promise<void> {
  try { await apiRequest('POST', '/auth/logout') } catch { /* ignore */ }
  _profile = null
  _hydrated = true
  notify()
}
