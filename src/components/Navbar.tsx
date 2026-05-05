import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useClickOutside from '../hooks/useClickOutside'
import { CAREERS, AVAILABLE_PLANS } from '../types/careers'
import { normalizePlanId } from '../utils/planUtils'
import { useThemeContext } from '../context/ThemeContext'
import AuthMenu from './AuthMenu'

interface NavbarProps {
  currentPlan?: string
}

export default function Navbar({ currentPlan }: NavbarProps) {
  const params = useParams()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const toggleLanguage = () => {
    const next = i18n.language === 'es' ? 'en' : 'es'
    // i18n.on('languageChanged') in src/i18n.ts handles persistence + server sync.
    i18n.changeLanguage(next)
  }
  const careerCode = (params?.career as string) || ''
  const careerName = careerCode ? (CAREERS[careerCode] || '') : ''
  const plans = careerCode ? (AVAILABLE_PLANS[careerCode] || []) : []
  const hasMultiplePlans = plans.length > 1
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () => setIsDropdownOpen(false))
  const { theme, toggle } = useThemeContext()

  const handlePlanChange = (planId: string) => {
    setIsDropdownOpen(false)
    navigate(`/${careerCode}?plan=${normalizePlanId(planId)}`)
  }

  const shortName = careerName.startsWith('Ingeniería')
    ? careerName.replace('Ingeniería', 'Ing.')
    : careerName.startsWith('Licenciatura')
    ? careerName.replace('Licenciatura', 'Lic.')
    : careerName

  return (
    <header className="sticky top-0 z-40 h-16 bg-surface/95 dark:bg-[#18181b]/95 backdrop-blur-sm border-b border-border dark:border-[#3f3f46]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-sm"
      >
        Ir al contenido
      </a>
      <div className="container-content h-full flex items-center justify-between">
        {/* Logotype */}
        <a href="https://ceitba.org.ar/" className="flex-shrink-0 flex flex-col justify-center hover:opacity-80 transition-opacity duration-150">
          <span className="font-display text-h5 font-bold text-primary tracking-tight leading-tight">CEITBA</span>
          <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa] uppercase tracking-widest leading-tight">
            {careerCode && shortName ? shortName : 'Combinador de Horarios'}
          </span>
        </a>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="min-h-[36px] px-2 font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa] hover:text-primary transition-colors duration-150"
            aria-label={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>
          {hasMultiplePlans && currentPlan && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 min-h-[36px] px-3 font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa] hover:bg-primary-50 dark:hover:bg-primary-900 rounded-sm transition-colors duration-150"
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <span>{currentPlan}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-1 w-48 rounded-card bg-white dark:bg-[#27272a] border border-border dark:border-[#3f3f46] shadow-card-hover" role="listbox">
                  <div className="py-1">
                    {plans.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => handlePlanChange(plan.id)}
                        role="option"
                        aria-selected={currentPlan === plan.id}
                        className={`block w-full text-left px-4 py-2.5 font-mono text-label uppercase tracking-widest transition-colors duration-100 ${
                          currentPlan === plan.id
                            ? 'bg-primary-50 dark:bg-primary-900 text-primary font-bold'
                            : 'text-ink-secondary dark:text-[#a1a1aa] hover:bg-surface dark:hover:bg-[#18181b]'
                        }`}
                      >
                        {plan.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="min-h-[36px] w-9 flex items-center justify-center text-ink-secondary dark:text-[#a1a1aa] hover:text-primary transition-colors duration-150 rounded-sm hover:bg-primary-50 dark:hover:bg-primary-900"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
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
