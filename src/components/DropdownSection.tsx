import { ReactNode } from "react"

interface DropdownSectionProps {
  title: string
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
}

const DropdownSection: React.FC<DropdownSectionProps> = ({
  title,
  children,
  isOpen,
  onToggle
}) => {
  return (
    <div>
      <div
        className="cursor-pointer select-none py-2 flex items-center font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#9BA3AF] hover:text-ink-primary dark:hover:text-[#F0F2F5] transition-colors duration-150"
        onClick={onToggle}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`mr-2 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span>{title}</span>
      </div>
      {isOpen && (
        <div className="ml-6">
          {children}
        </div>
      )}
    </div>
  )
}

export default DropdownSection
