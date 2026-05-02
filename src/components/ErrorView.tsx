import { useTranslation } from 'react-i18next'

interface ErrorViewProps {
  message: string
  className?: string
  onRetry?: () => void
}

export default function ErrorView({ message, className = '', onRetry }: ErrorViewProps) {
  const { t } = useTranslation()

  return (
    <div role="alert" className={`flex flex-col items-center justify-center py-24 gap-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p className="font-display text-h4 font-bold text-ink-primary">{t('errors.somethingWrong')}</p>
        <p className="font-body text-body text-ink-secondary mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="min-h-[44px] px-6 py-2.5 bg-primary text-surface font-body font-semibold rounded-sm hover:bg-primary-600 transition-colors duration-150"
        >
          {t('errors.retry')}
        </button>
      )}
    </div>
  )
}
