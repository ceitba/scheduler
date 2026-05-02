import React from "react"

interface DropdownProps {
  title: string
  items: string[]
  expanded: boolean
  onClick: () => void
}

export const Dropdown: React.FC<DropdownProps> = ({ title, items, expanded, onClick }) => {
  return (
    <div>
      <div
        className="cursor-pointer py-2 font-body font-semibold text-body text-ink-primary flex justify-between items-center"
        onClick={onClick}
      >
        <span>{title}</span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      {expanded && (
        <div className="ml-2 cursor-pointer">
          {items.map((item, index) => (
            <div key={index} className="py-2 font-body text-body-sm text-ink-primary">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
