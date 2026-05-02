import { useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import useClickOutside from '../hooks/useClickOutside'
import { CAREERS, AVAILABLE_PLANS, CAREER_METADATA, EXCHANGE_CAREER } from '../types/careers'
import { normalizePlanId } from '../utils/planUtils'

interface NavbarProps {
  currentPlan?: string
}

export default function Navbar({ currentPlan }: NavbarProps) {
  const params = useParams()
  const navigate = useNavigate()
  const careerCode = (params?.career as string) || ''
  const careerName = careerCode ? (CAREERS[careerCode] || '') : ''
  const plans = careerCode ? (AVAILABLE_PLANS[careerCode] || []) : []
  const hasMultiplePlans = plans.length > 1
  const careerIcon = careerCode === 'X'
    ? EXCHANGE_CAREER.icon
    : careerCode ? CAREER_METADATA[careerCode]?.icon : ''

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () => setIsDropdownOpen(false))

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
    <header className="sticky top-0 z-40 h-16 bg-surface/95 backdrop-blur-sm border-b border-border">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-sm"
      >
        Ir al contenido
      </a>
      <div className="container-content h-full flex items-center justify-between">
        {/* Logotype */}
        <Link to="/" className="flex-shrink-0 flex flex-col justify-center hover:opacity-80 transition-opacity duration-150">
          <span className="font-display text-h5 font-bold text-primary tracking-tight leading-tight">CEITBA</span>
          <span className="font-mono text-label text-ink-secondary uppercase tracking-widest leading-tight">
            {careerCode && shortName ? shortName : 'Combinador de Horarios'}
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {careerCode && careerIcon && (
            <span className="text-xl hidden sm:inline" aria-hidden="true">{careerIcon}</span>
          )}

          {hasMultiplePlans && currentPlan && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 min-h-[36px] px-3 font-mono text-label uppercase tracking-widest text-ink-secondary hover:bg-primary-50 rounded-sm transition-colors duration-150"
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <span>{currentPlan}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-1 w-48 rounded-card bg-white border border-border shadow-card-hover" role="listbox">
                  <div className="py-1">
                    {plans.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => handlePlanChange(plan.id)}
                        role="option"
                        aria-selected={currentPlan === plan.id}
                        className={`block w-full text-left px-4 py-2.5 font-mono text-label uppercase tracking-widest transition-colors duration-100 ${
                          currentPlan === plan.id
                            ? 'bg-primary-50 text-primary font-bold'
                            : 'text-ink-secondary hover:bg-surface'
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
        </div>
      </div>
    </header>
  )
}
