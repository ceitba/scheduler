import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { signOut, startGoogleSignIn } from '../store/authStore'

// Same shape as CeitbaPage and ItbaNews — sign-in button when anonymous,
// avatar dropdown when authed. Profile + sign out only; the scheduler has
// no app-specific menu items.
export default function AuthMenu() {
  const { t } = useTranslation()
  const { profile, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (loading) return <div className="w-9 h-9" aria-hidden="true" />

  if (!profile) {
    return (
      <button
        type="button"
        onClick={startGoogleSignIn}
        className="min-h-[36px] px-3 font-mono text-label uppercase tracking-widest text-primary border border-primary rounded-sm hover:bg-primary hover:text-white transition-colors duration-150"
      >
        {t('auth.signIn')}
      </button>
    )
  }

  const initials = (profile.name ?? profile.email)
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-9 h-9 rounded-full overflow-hidden border border-border dark:border-[#3f3f46] bg-primary-100 dark:bg-primary-900 flex items-center justify-center hover:border-primary transition-colors duration-150"
      >
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.name ?? profile.email} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display font-bold text-label text-primary">{initials}</span>
        )}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#27272a] border border-border dark:border-[#3f3f46] rounded-card shadow-card-hover py-1 z-50">
          <div className="px-3 py-2 border-b border-border dark:border-[#3f3f46]">
            <p className="font-body text-body-sm font-semibold text-ink-primary dark:text-[#f4f4f5] truncate">
              {profile.name ?? profile.email}
            </p>
            <p className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa] truncate">
              {profile.email}
            </p>
          </div>
          {/* CeitbaPage owns /profile — deep link to it from here. */}
          <a
            href="https://ceitba.org.ar/profile"
            className="block px-3 py-2 font-body text-body-sm text-ink-primary dark:text-[#f4f4f5] hover:bg-primary-50 dark:hover:bg-primary-900"
          >
            {t('auth.profile')}
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={async () => { await signOut(); setOpen(false) }}
            className="w-full text-left px-3 py-2 font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] hover:bg-primary-50 dark:hover:bg-primary-900"
          >
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
