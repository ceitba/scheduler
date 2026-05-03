const WarningText: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex items-center bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-sm" role="alert">
      <div className="mr-3 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <p className="font-body text-body-sm text-yellow-800">{message}</p>
    </div>
  )
}

export default WarningText
