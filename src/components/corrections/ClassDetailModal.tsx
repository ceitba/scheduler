import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import BaseModal from '../BaseModal'
import CorrectionStatus from './CorrectionStatus'
import SuggestCorrectionModal from './SuggestCorrectionModal'
import { useCorrections } from '../../context/correctionsContext'
import { formatSlot, sortSlots } from '../../services/corrections'

interface Props {
  subjectId: string
  commissionName: string
  onClose: () => void
}

// Detail of a class block in the calendar: the commission's slots and
// rooms, what students said about its schedule, and the entry point to
// suggest a correction (which replaces this dialog until it closes).
export default function ClassDetailModal({ subjectId, commissionName, onClose }: Props) {
  const { t } = useTranslation()
  const corrections = useCorrections()
  const [suggesting, setSuggesting] = useState(false)
  const found = corrections?.findCommission(subjectId, commissionName)
  if (!found) return null
  const { subject, commission } = found

  if (suggesting) {
    return <SuggestCorrectionModal subject={subject} commission={commission} onClose={() => setSuggesting(false)} />
  }

  return (
    <BaseModal isOpen onClose={onClose} title={subject.name}>
      <div className="space-y-4">
        <div className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">
          <span className="font-mono text-label">({subject.subject_id})</span>{' '}
          <span className="font-semibold text-ink-primary dark:text-[#f4f4f5]">
            {t('corrections.detailCommission', { name: commission.name })}
          </span>
        </div>
        <ul className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa] space-y-1">
          {sortSlots(commission.schedule).map((s, i) => (
            <li key={i}>
              {formatSlot(s, (d) => t(`days.${d}`))}
              {' | '}
              {s.building ? s.classroom : t('commission.virtual')}
            </li>
          ))}
        </ul>
        <div className="pt-4 border-t border-border dark:border-[#3f3f46]">
          <CorrectionStatus subject={subject} commission={commission} onSuggest={() => setSuggesting(true)} />
        </div>
      </div>
    </BaseModal>
  )
}
