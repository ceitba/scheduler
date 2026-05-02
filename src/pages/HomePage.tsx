import { Link } from 'react-router-dom'
import { CAREERS, CAREER_METADATA, EXCHANGE_CAREER, getLatestPlan } from '../types/careers'
import { normalizePlanId } from '../utils/planUtils'
import Footer from '../components/Footer'

const GEO_BG: Record<string, string> = {
  blue:   'bg-primary-500',
  amber:  'bg-accent-400',
  green:  'bg-emerald-600',
  violet: 'bg-violet-600',
  teal:   'bg-teal-600',
  orange: 'bg-orange-500',
}

const CAREER_GEO: Record<string, keyof typeof GEO_BG> = {
  BIO:  'teal',
  C:    'blue',
  I:    'violet',
  K:    'orange',
  L:    'amber',
  LAES: 'green',
  LN:   'amber',
  M:    'blue',
  N:    'teal',
  P:    'orange',
  Q:    'green',
  S:    'violet',
}

function GeoCover({ scheme }: { scheme: string }) {
  const bgClass = GEO_BG[scheme] || GEO_BG.blue
  return (
    <div className={`relative overflow-hidden h-24 ${bgClass}`}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-20%] right-[-10%] w-2/3 h-2/3 rounded-full bg-white/30" />
        <div className="absolute bottom-[-15%] left-[-5%] w-1/2 h-1/2 rotate-45 bg-white/20" />
        <div className="absolute top-1/3 left-1/4 w-1/3 h-1/3 rounded-sm rotate-12 bg-black/10" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/25" />
    </div>
  )
}

function CareerCard({ id, name, geoScheme }: { id: string; name: string; geoScheme: string }) {
  const latestPlan = getLatestPlan(id)
  const planParam = normalizePlanId(latestPlan)
  const icon = CAREER_METADATA[id]?.icon

  return (
    <Link
      to={`/${id}?plan=${planParam}`}
      className="rounded-card border border-border bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 flex flex-col group"
      aria-label={`Ver horarios de ${name}`}
    >
      <GeoCover scheme={geoScheme} />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start gap-2">
          {icon && <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>}
          <h2 className="font-display text-h5 font-bold text-ink-primary group-hover:text-primary transition-colors duration-150 leading-snug">
            {name}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-primary font-body text-body-sm mt-auto pt-2 border-t border-border">
          <span>Ver horarios</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const careersList = Object.entries(CAREERS).map(([id, name]) => ({
    id,
    name,
    geoScheme: CAREER_GEO[id] || 'blue',
  }))

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-surface/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-content h-16 flex items-center">
          <div className="flex flex-col justify-center">
            <span className="font-display text-h5 font-bold text-primary tracking-tight leading-tight">CEITBA</span>
            <span className="font-mono text-label text-ink-secondary uppercase tracking-widest leading-tight">Combinador de Horarios</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main id="main-content" className="flex-1">
        <section className="container-content py-section-mobile lg:py-section">
          <div className="mb-10">
            <h1 className="font-display text-h1 lg:text-display font-bold text-ink-primary leading-tight mb-3">
              Planificá tu horario
            </h1>
            <p className="font-body text-body-lg text-ink-secondary max-w-xl">
              Seleccioná tu carrera para comenzar a combinar horarios y encontrar la combinación perfecta.
            </p>
          </div>

          {/* Careers grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {careersList.map(career => (
              <CareerCard key={career.id} {...career} />
            ))}
          </div>

          {/* Exchange */}
          <div className="mt-8 pt-8 border-t border-border">
            <Link
              to={`/${EXCHANGE_CAREER.id}?plan=${normalizePlanId(getLatestPlan(EXCHANGE_CAREER.id))}`}
              className="inline-flex items-center gap-3 rounded-card border-2 border-dashed border-primary/30 hover:border-primary/60 bg-white px-6 py-4 transition-colors duration-200 group"
              aria-label="Ver materias de intercambio"
            >
              <span className="text-2xl" aria-hidden="true">{EXCHANGE_CAREER.icon}</span>
              <div>
                <p className="font-display text-h5 font-bold text-ink-primary group-hover:text-primary transition-colors duration-150">
                  {EXCHANGE_CAREER.name}
                </p>
                <p className="font-body text-body-sm text-ink-secondary">Materias para alumnos de intercambio</p>
              </div>
              <svg className="ml-auto w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
