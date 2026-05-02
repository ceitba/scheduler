import React, { useState } from 'react'

interface HeartButtonProps {
  initialState?: boolean
  onToggle?: (isFilled: boolean) => void
}

const HeartButton: React.FC<HeartButtonProps> = ({ initialState = false, onToggle }) => {
  const [isFilled, setIsFilled] = useState(initialState)

  const handleClick = () => {
    const newState = !isFilled
    setIsFilled(newState)
    if (onToggle) {
      onToggle(newState)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="focus:outline-none transition-colors duration-150"
      aria-label={isFilled ? "Unlike" : "Like"}
    >
      {isFilled ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hover:text-red-500 transition-colors" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  )
}

export default HeartButton
