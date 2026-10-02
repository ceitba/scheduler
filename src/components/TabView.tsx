import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Tab {
  label: string
  content: React.ReactNode
  onClick?: () => void
}

interface TabViewProps {
  tabs: Tab[]
  // Optional control of the active tab (index); uncontrolled otherwise.
  activeTab?: number
  onActiveTabChange?: (index: number) => void
}

export default function TabView({ tabs, activeTab: controlledTab, onActiveTabChange }: TabViewProps) {
  const { t } = useTranslation()
  const [uncontrolledTab, setUncontrolledTab] = useState(0)
  const activeTab = controlledTab ?? uncontrolledTab
  const setActiveTab = (index: number) => {
    setUncontrolledTab(index)
    onActiveTabChange?.(index)
  }

  return (
    <div className="w-full">
      <div
        className="flex gap-0 border-b border-border dark:border-[#3f3f46]"
        role="tablist"
        aria-label={t('career.tabsAria')}
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
                : 'text-ink-secondary dark:text-[#a1a1aa] hover:text-ink-primary dark:hover:text-[#f4f4f5]'
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
