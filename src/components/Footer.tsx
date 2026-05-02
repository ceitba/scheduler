import { useState } from 'react'

const creators = ['Ian Dalton', 'Lautaro Bonseñor', 'Camila Lee', 'Uriel Sosa Vázquez']

export default function Footer() {
  const [showCreators, setShowCreators] = useState(false)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border bg-surface/80 backdrop-blur-sm">
      <div className="container-content py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2" aria-label="Footer links">
            <a
              href="https://github.com/CEITBA-git/scheduler"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-body text-body-sm text-ink-secondary hover:text-primary transition-colors duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
            <a
              href="https://ceitba.org.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-body-sm text-ink-secondary hover:text-primary transition-colors duration-150"
            >
              CEITBA
            </a>
            <a
              href="https://www.itba.edu.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-body-sm text-ink-secondary hover:text-primary transition-colors duration-150"
            >
              ITBA
            </a>
            <a
              href="mailto:ceitba@itba.edu.ar"
              className="font-body text-body-sm text-ink-secondary hover:text-primary transition-colors duration-150"
            >
              Contacto
            </a>
          </nav>

          <div className="flex items-center justify-center gap-2 font-body text-body-sm text-ink-secondary">
            <div className="relative">
              <button
                onMouseEnter={() => setShowCreators(true)}
                onMouseLeave={() => setShowCreators(false)}
                className="flex items-center gap-1.5 hover:text-primary transition-colors duration-150"
              >
                <span>IT Team CEITBA</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              {showCreators && (
                <div className="absolute bottom-full right-0 mb-2 w-48 rounded-card bg-white border border-border shadow-card-hover z-10">
                  {creators.map(creator => (
                    <div key={creator} className="px-4 py-2 font-body text-body-sm text-ink-primary border-b border-border last:border-b-0">
                      {creator}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-border">·</span>
            <span>{currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
