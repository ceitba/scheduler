import React from 'react'

interface PriorityToggleProps {
  isPriority: boolean
  onChange: (isPriority: boolean) => void
}

const PriorityToggle: React.FC<PriorityToggleProps> = ({ isPriority, onChange }) => {
  return (
    <button
      onClick={() => onChange(!isPriority)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
        isPriority
          ? 'bg-red-50 border-red-200 hover:bg-red-100'
          : 'border-border hover:bg-primary-50'
      }`}
      title={isPriority ? "Marcar como no prioritaria" : "Marcar como prioritaria"}
    >
      {isPriority ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="white" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" />
          </svg>
          <span className="font-body text-body-sm font-medium text-red-600">Prioritaria</span>
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-secondary" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="font-body text-body-sm font-medium text-ink-secondary">Prioritaria</span>
        </>
      )}
    </button>
  )
}

export default PriorityToggle
