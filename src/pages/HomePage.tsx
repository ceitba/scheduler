import { Link } from 'react-router-dom'
import { CAREERS, EXCHANGE_CAREER, getLatestPlan } from '../types/careers'
import { normalizePlanId } from '../utils/planUtils'
import Footer from '../components/Footer'

function CareerCard({ id, name }: { id: string; name: string }) {
  const planParam = normalizePlanId(getLatestPlan(id))

  return (
    <Link
      to={`/${id}?plan=${planParam}`}
      className="rounded-card border border-border bg-white shadow-card hover:shadow-card-hover transition-shadow duration-200 flex flex-col p-5 group"
      aria-label={`Ver horarios de ${name}`}
    >
      <span className="font-mono text-label uppercase tracking-widest text-ink-secondary mb-2">{id}</span>
      <h2 className="font-display text-h5 font-bold text-ink-primary group-hover:text-primary transition-colors duration-150 leading-snug flex-1">
        {name}
      </h2>
      <div className="flex items-center gap-1.5 text-primary font-body text-body-sm mt-4 pt-3 border-t border-border">
        <span>Ver horarios</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const careersList = Object.entries(CAREERS).map(([id, name]) => ({ id, name }))

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="border-b border-border bg-surface/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-content h-16 flex items-center">
          <div className="flex flex-col justify-center">
            <span className="font-display text-h5 font-bold text-primary tracking-tight leading-tight">CEITBA</span>
            <span className="font-mono text-label text-ink-secondary uppercase tracking-widest leading-tight">Combinador de Horarios</span>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="container-content py-section-mobile lg:py-section">
          <div className="mb-10">
            <h1 className="font-display text-h1 lg:text-display font-bold text-ink-primary leading-tight mb-3">
              Planific&aacute; tu horario
            </h1>
            <p className="font-body text-body-lg text-ink-secondary max-w-xl">
              Seleccion&aacute; tu carrera para comenzar a combinar horarios y encontrar la combinaci&oacute;n perfecta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {careersList.map(career => (
              <CareerCard key={career.id} id={career.id} name={career.name} />
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Link
              to={`/${EXCHANGE_CAREER.id}?plan=${normalizePlanId(getLatestPlan(EXCHANGE_CAREER.id))}`}
              className="inline-flex items-center gap-4 rounded-card border border-dashed border-primary/40 hover:border-primary bg-white px-6 py-4 transition-colors duration-150 group"
              aria-label="Ver materias de intercambio"
            >
              <div>
                <span className="font-mono text-label uppercase tracking-widest text-ink-secondary block mb-0.5">{EXCHANGE_CAREER.id}</span>
                <p className="font-display text-h5 font-bold text-ink-primary group-hover:text-primary transition-colors duration-150">
                  {EXCHANGE_CAREER.name}
                </p>
                <p className="font-body text-body-sm text-ink-secondary">Materias para alumnos de intercambio</p>
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
