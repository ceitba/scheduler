import { ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      const viewport = document.querySelector("meta[name=viewport]")
      if (viewport) {
        viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1")
      }
      document.body.style.overflow = 'hidden'
    } else {
      const viewport = document.querySelector("meta[name=viewport]")
      if (viewport) {
        viewport.setAttribute("content", "width=device-width, initial-scale=1")
      }
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative w-[90vw] sm:w-full max-w-md bg-white rounded-card border border-border shadow-card-hover p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-h4 font-bold text-ink-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface rounded-sm transition-colors duration-150"
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default BaseModal
