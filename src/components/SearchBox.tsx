import React, { useState, useRef, useEffect, useMemo } from "react"
import { Subject } from "../hooks/useSubjects"
import Fuse from 'fuse.js'

interface SearchBoxProps {
  subjects: Subject[]
  onSelectSubject: (subject: Subject) => void
}

const SearchBox: React.FC<SearchBoxProps> = ({ subjects, onSelectSubject }) => {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Initialize Fuse instance with our search options
  const fuse = useMemo(() => new Fuse(subjects, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'subject_id', weight: 0.3 }
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
    shouldSort: true,
    findAllMatches: true
  }), [subjects])

  // Filter subjects based on fuzzy search
  const filteredSubjects = useMemo(() => {
    if (!query) return []
    return fuse.search(query).map(result => result.item)
  }, [fuse, query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-secondary dark:text-[#9BA3AF] pointer-events-none"
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar materias por nombre o código..."
          className="w-full pl-10 pr-4 py-2.5 rounded-sm bg-white dark:bg-[#1C2130] font-body text-body text-ink-primary dark:text-[#F0F2F5] placeholder:text-ink-secondary dark:placeholder:text-[#9BA3AF] border border-border dark:border-[#2D3748] focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
        />
      </div>

      {/* Dropdown results */}
      {isOpen && query.length > 0 && (
        <div className="absolute w-full mt-1 bg-white dark:bg-[#1C2130] rounded-card shadow-card border border-border dark:border-[#2D3748] max-h-60 overflow-y-auto z-50">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <button
                key={subject.subject_id}
                onClick={() => {
                  onSelectSubject(subject)
                  setQuery("")
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-150"
              >
                <span className="font-mono text-label text-ink-secondary dark:text-[#9BA3AF] mr-2">({subject.subject_id})</span>
                <span className="font-body text-body-sm text-ink-primary dark:text-[#F0F2F5]">{subject.name}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 font-body text-body-sm text-ink-secondary dark:text-[#9BA3AF]">
              No se encontraron materias
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
