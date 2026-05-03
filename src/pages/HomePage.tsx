import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CAREERS, CAREER_METADATA, EXCHANGE_CAREER, getLatestPlan } from '../types/careers'
import { normalizePlanId } from '../utils/planUtils'
import Footer from '../components/Footer'
import { useThemeContext } from '../context/ThemeContext'

function CareerCard({ id, name }: { id: string; name: string }) {
  const { t } = useTranslation()
  const planParam = normalizePlanId(getLatestPlan(id))
  const icon = CAREER_METADATA[id]?.icon

  return (
    <Link
      to={`/${id}?plan=${planParam}`}
      className="rounded-card border border-border dark:border-[#3f3f46] bg-white dark:bg-[#27272a] shadow-card hover:shadow-card-hover transition-shadow duration-200 flex flex-col p-5 group"
      aria-label={`${t('home.viewSchedules')} ${name}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">{id}</span>
        {icon && <span className="text-lg leading-none" aria-hidden="true">{icon}</span>}
      </div>
      <h2 className="font-display text-h5 font-bold text-ink-primary dark:text-[#f4f4f5] group-hover:text-primary transition-colors duration-150 leading-snug flex-1">
        {name}
      </h2>
      <div className="flex items-center gap-1.5 text-primary font-body text-body-sm mt-4 pt-3 border-t border-border dark:border-[#3f3f46]">
        <span>{t('home.viewSchedules')}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const { theme, toggle } = useThemeContext()
  const careersList = Object.entries(CAREERS).map(([id, name]) => ({ id, name }))

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#18181b]">
      <header className="border-b border-border dark:border-[#3f3f46] bg-surface/95 dark:bg-[#18181b]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-content h-16 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <span className="font-display text-h5 font-bold text-primary tracking-tight leading-tight">CEITBA</span>
            <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa] uppercase tracking-widest leading-tight">{t('nav.scheduler')}</span>
          </div>

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
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="container-content py-section-mobile lg:py-section">
          <div className="mb-10">
            <h1 className="font-display text-h1 lg:text-display font-bold text-ink-primary dark:text-[#f4f4f5] leading-tight mb-3">
              {t('home.title')}
            </h1>
            <p className="font-body text-body-lg text-ink-secondary dark:text-[#a1a1aa] max-w-xl">
              {t('home.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {careersList.map(career => (
              <CareerCard key={career.id} id={career.id} name={career.name} />
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border dark:border-[#3f3f46]">
            <Link
              to={`/${EXCHANGE_CAREER.id}?plan=${normalizePlanId(getLatestPlan(EXCHANGE_CAREER.id))}`}
              className="inline-flex items-center gap-4 rounded-card border border-dashed border-primary/40 hover:border-primary bg-white dark:bg-[#27272a] px-6 py-4 transition-colors duration-150 group"
              aria-label={t('home.viewSchedules')}
            >
              {EXCHANGE_CAREER.icon && <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{EXCHANGE_CAREER.icon}</span>}
              <div>
                <span className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa] block mb-0.5">{EXCHANGE_CAREER.id}</span>
                <p className="font-display text-h5 font-bold text-ink-primary dark:text-[#f4f4f5] group-hover:text-primary transition-colors duration-150">
                  {t('home.exchange.name')}
                </p>
                <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">{t('home.exchange.description')}</p>
              </div>
              <svg className="ml-auto w-5 h-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
