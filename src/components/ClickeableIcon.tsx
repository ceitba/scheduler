import React from 'react'

interface ClickeableIconProps {
  icon: React.ReactNode
  text?: string
  onClick: () => void
}

const ClickeableIcon: React.FC<ClickeableIconProps> = ({ icon, text, onClick }) => {
  return (
    <button
      className="flex items-center justify-center rounded-sm p-2 hover:bg-primary-50 text-ink-secondary hover:text-primary transition-colors duration-150 focus:outline-none min-h-[36px]"
      onClick={onClick}
    >
      {text && <span className="mr-2 hidden md:inline font-body text-body-sm">{text}</span>}
      {icon}
    </button>
  )
}

export default ClickeableIcon
