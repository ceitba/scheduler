import React, { useState } from 'react'

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '12/1/2024',
    changes: [
      'Agregado registro de cambios',
      'Nueva opción de superposición ilimitada',
      'Actualizado ícono de Bioingeniería',
      'Arreglos menores a la aplicación'
    ]
  }
]

const Changelog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-primary underline flex items-center gap-1 transition-colors font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]"
      >
        Changelog
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 sm:right-auto w-64 bg-white border border-border rounded-card shadow-card-hover p-3 font-body text-body-sm z-50">
          {changelog.map((entry, index) => (
            <div key={entry.version} className={index > 0 ? 'mt-4' : ''}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-ink-primary dark:text-[#f4f4f5]">v{entry.version}</span>
                <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">{entry.date}</span>
              </div>
              <ul className="space-y-1">
                {entry.changes.map((change, i) => (
                  <li key={i} className="text-ink-secondary dark:text-[#a1a1aa]">
                    • {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Changelog
