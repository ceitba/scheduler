import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subject } from '../../hooks/useSubjects'
import type { Commission, CommissionCorrection } from '../../types/scheduler'
import {
  appliedCorrectionOf,
  courseEnded,
  formatSlots,
  pendingCorrectionsOf,
  sgaScheduleOf,
} from '../../services/corrections'
import CorrectionVoteButtons from './CorrectionVoteButtons'

interface Props {
  subject: Subject
  commission: Commission
  // Opens the suggestion form; the "¿Horario incorrecto?" action is hidden
  // without it.
  onSuggest?: () => void
  // Applied to the wrapper, which isn't rendered when there's nothing to show.
  className?: string
}

// Everything students said about a commission's schedule, shown where the
// time is shown: the applied correction (badge + SGA original + votes),
// the top pending suggestion with its votes (the rest behind "y N
// sugerencias más"), and the "¿Horario incorrecto?" action.
export default function CorrectionStatus({ subject, commission, onSuggest, className = '' }: Props) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  // Without the commission id (older API) there is nothing to act on.
  if (!commission.commission_id) return null

  const dayLabel = (day: string) => t(`days.${day}`)
  const applied = appliedCorrectionOf(commission)
  const pending = pendingCorrectionsOf(commission)
  const ended = courseEnded(subject.course_end)
  const sgaText = formatSlots(sgaScheduleOf(commission), dayLabel)
  const visiblePending = showAll ? pending : pending.slice(0, 1)

  const votes = (c: CommissionCorrection) =>
    ended ? null : (
      <CorrectionVoteButtons
        subjectId={subject.subject_id}
        commissionName={commission.name}
        correction={c}
        label={t('corrections.voteGroupAria', { schedule: formatSlots(c.schedule, dayLabel) })}
      />
    )

  if (!applied && pending.length === 0 && (!onSuggest || ended)) return null

  return (
    <div className={`flex flex-col gap-3 font-body text-body-sm ${className}`}>
      {applied && (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex px-1.5 py-0.5 rounded-sm bg-primary-50 dark:bg-primary-900 text-primary dark:text-primary-200 font-mono text-label uppercase tracking-widest">
              {t('corrections.appliedBadge')}
            </span>
            <span className="text-ink-secondary dark:text-[#a1a1aa]">
              {t('corrections.sga', { schedule: sgaText })}
            </span>
          </div>
          <p className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">
            {t('corrections.appliedConfirms', { count: applied.confirms })}
            {applied.rejects > 0 && <> · {t('corrections.rejects', { count: applied.rejects })}</>}
          </p>
          {votes(applied)}
        </div>
      )}

      {visiblePending.map((c) => (
        <div key={c.id} className="flex flex-col gap-1.5">
          <p className="text-ink-primary dark:text-[#f4f4f5]">
            {t('corrections.pendingSummary', { count: c.confirms, schedule: formatSlots(c.schedule, dayLabel) })}
            {!applied && (
              <span className="text-ink-secondary dark:text-[#a1a1aa]"> · {t('corrections.sga', { schedule: sgaText })}</span>
            )}
            {c.rejects > 0 && (
              <span className="text-ink-secondary dark:text-[#a1a1aa]"> · {t('corrections.rejects', { count: c.rejects })}</span>
            )}
          </p>
          {votes(c)}
        </div>
      ))}

      {pending.length > 1 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="self-start text-ink-secondary dark:text-[#a1a1aa] hover:text-primary underline-offset-2 hover:underline"
        >
          {showAll ? t('corrections.less') : t('corrections.more', { count: pending.length - 1 })}
        </button>
      )}

      {ended && (applied || pending.length > 0) && (
        <p className="text-ink-secondary dark:text-[#a1a1aa]">{t('corrections.ended')}</p>
      )}

      {onSuggest && !ended && (
        <button
          type="button"
          onClick={onSuggest}
          aria-label={t('corrections.actionAria', { commission: commission.name })}
          className="self-start font-semibold text-primary dark:text-primary-300 underline-offset-2 hover:underline"
        >
          {t('corrections.action')}
        </button>
      )}
    </div>
  )
}
