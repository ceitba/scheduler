import React, { useState } from 'react'

interface Tab {
  label: string
  content: React.ReactNode
  onClick?: () => void
}

interface TabViewProps {
  tabs: Tab[]
}

export default function TabView({ tabs }: TabViewProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="w-full">
      <div
        className="flex gap-0 border-b border-border dark:border-[#2D3748]"
        role="tablist"
        aria-label="Secciones del combinador"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            onClick={() => {
              setActiveTab(index)
              tab.onClick?.()
            }}
            className={`
              relative px-5 py-3 font-body font-semibold text-body-sm transition-colors duration-150 select-none min-h-[44px]
              ${activeTab === index
                ? 'text-primary border-b-2 border-accent -mb-px'
                : 'text-ink-secondary dark:text-[#9BA3AF] hover:text-ink-primary dark:hover:text-[#F0F2F5]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tabs.map((tab, index) => (
          <div
            key={index}
            role="tabpanel"
            className={activeTab === index ? 'animate-fade-in' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
