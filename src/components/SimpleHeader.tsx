import { useTranslation } from 'react-i18next'
import { useThemeContext } from '../context/ThemeContext'
import AuthMenu from './AuthMenu'

// Light header used by routes that don't need the career/plan picker
// (Saved Schedules, Comparison, Share viewer). Mirrors Navbar's chrome —
// same SVG sun/moon, same size, same hover treatment — so the topbar
// feels identical across pages instead of swapping unicode glyphs.
export default function SimpleHeader() {
  const { t, i18n } = useTranslation()
  const { theme, toggle } = useThemeContext()

  const toggleLanguage = () => {
    const next = i18n.language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
  }

  return (
    <header className="border-b border-border dark:border-[#3f3f46] bg-surface/95 dark:bg-[#18181b]/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="container-content h-16 flex items-center justify-between">
        <a
          href="/"
          className="flex flex-col justify-center hover:opacity-80 transition-opacity duration-150"
        >
          <span className="font-display text-h5 font-bold text-primary tracking-tight leading-tight">
            CEITBA
          </span>
          <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa] uppercase tracking-widest leading-tight">
            {t('nav.scheduler')}
          </span>
        </a>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            aria-label={t('nav.langToggleAria')}
            className="min-h-[36px] px-2 font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa] hover:text-primary transition-colors duration-150"
          >
            {t('nav.langToggleLabel')}
          </button>
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? t('nav.themeToggleLight') : t('nav.themeToggleDark')}
            className="min-h-[36px] w-9 flex items-center justify-center text-ink-secondary dark:text-[#a1a1aa] hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900 rounded-sm transition-colors duration-150"
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <AuthMenu />
        </div>
      </div>
    </header>
  )
}
