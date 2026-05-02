import { useState, useRef } from 'react'
import useClickOutside from '../hooks/useClickOutside'

interface CheckboxProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  isTooltip?: boolean
  tooltip?: string
  disabled?: boolean
}

export default function Checkbox({ id, checked, onChange, label, isTooltip, tooltip, disabled }: CheckboxProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  useClickOutside(tooltipRef as React.RefObject<HTMLElement>, () => setShowTooltip(false))

  return (
    <div className="relative flex items-center gap-2">
      <button
        id={id}
        role="checkbox"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          flex items-center justify-center w-5 h-5 rounded-sm border transition-colors duration-150 flex-shrink-0
          ${checked
            ? 'bg-primary border-primary'
            : 'bg-white dark:bg-[#1C2130] border-border dark:border-[#2D3748] hover:border-primary'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={label}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </button>

      <label
        htmlFor={id}
        className={`font-body text-body-sm text-ink-primary dark:text-[#F0F2F5] select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        {label}
      </label>

      {isTooltip && tooltip && (
        <div ref={tooltipRef} className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-4 h-4 rounded-full bg-primary-50 dark:bg-primary-900 text-primary flex items-center justify-center font-mono text-label"
            aria-label="Más información"
          >
            ?
          </button>
          {showTooltip && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-primary-900 text-white font-body text-body-sm rounded-sm shadow-card-hover whitespace-nowrap z-10">
              {tooltip}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
