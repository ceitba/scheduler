import { useTranslation } from 'react-i18next'
import BaseModal from './BaseModal'

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveAsPDF: () => void
  onSaveAsImage: () => void
  onSaveAsWallpaper?: () => void
  onExportToCalendar: () => void
  onShareLink: () => void
}

const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  onSaveAsPDF,
  onSaveAsImage,
  onSaveAsWallpaper,
  onExportToCalendar,
}) => {
  const { t } = useTranslation()

  const options: { title: string; description: string; icon: React.ReactNode; onClick: () => void }[] = [
    {
      title: t('save.saveAsPDF'),
      description: t('save.saveAsPDFDescription'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
      onClick: onSaveAsPDF,
    },
    {
      title: t('save.saveAsImage'),
      description: t('save.saveAsImageDescription'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
      onClick: onSaveAsImage,
    },
    {
      title: t('save.exportToCalendar'),
      description: t('save.exportToCalendarDescription'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      onClick: onExportToCalendar,
    },
  ]

  if (onSaveAsWallpaper) {
    options.splice(2, 0, {
      title: t('save.saveAsWallpaper'),
      description: t('save.saveAsWallpaperDescription'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="6" y="2" width="12" height="20" rx="2" ry="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
      ),
      onClick: onSaveAsWallpaper,
    })
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('save.title')}
    >
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.title}
            onClick={() => {
              option.onClick()
              onClose()
            }}
            className="w-full flex items-center gap-4 p-3 rounded-card border border-border dark:border-[#3f3f46] hover:bg-primary-50 dark:hover:bg-primary-900 hover:border-primary transition-colors duration-150 text-left group"
          >
            <span className="text-ink-secondary dark:text-[#a1a1aa] group-hover:text-primary transition-colors duration-150 flex-shrink-0">
              {option.icon}
            </span>
            <div>
              <div className="font-body font-semibold text-body-sm text-ink-primary dark:text-[#f4f4f5]">{option.title}</div>
              <div className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </BaseModal>
  )
}

export default SaveModal
