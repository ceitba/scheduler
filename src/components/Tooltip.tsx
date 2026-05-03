import React from 'react'

interface TooltipHeaderProps {
  title: string
  tooltip: string
  className?: string
}

const TooltipHeader: React.FC<TooltipHeaderProps> = ({ title, tooltip, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <h2 className="font-body text-body font-semibold text-ink-primary dark:text-[#f4f4f5]">
        {title}
      </h2>
      <div className="group relative inline-block">
        <svg
          className="h-5 w-5 text-ink-secondary dark:text-[#a1a1aa] hover:text-primary cursor-help"
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="pointer-events-none absolute -top-2 left-6 min-w-[100px] sm:min-w-[350px] whitespace-normal opacity-0 transition-opacity group-hover:opacity-100 bg-white dark:bg-[#27272a] font-body text-body-sm text-ink-primary dark:text-[#f4f4f5] py-1.5 px-3 rounded-card shadow-card-hover border border-border dark:border-[#3f3f46] z-10">
          {tooltip}
        </span>
      </div>
    </div>
  )
}

export default TooltipHeader
