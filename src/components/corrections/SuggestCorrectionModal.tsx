import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import BaseModal from '../BaseModal'
import SignInPrompt from './SignInPrompt'
import { useAuth } from '../../hooks/useAuth'
import { useCorrections } from '../../context/correctionsContext'
import type { Subject } from '../../hooks/useSubjects'
import type { Commission, CommissionCorrection } from '../../types/scheduler'
import { suggestCorrection, toCommissionCorrection, voteCorrection } from '../../api/corrections'
import {
  APPLY_THRESHOLD,
  MAX_SLOTS,
  MAX_TIME,
  MIN_TIME,
  SUGGESTION_DAYS,
  correctionErrorKey,
  draftFromSchedule,
  draftToSlots,
  formatSlots,
  sgaScheduleOf,
  validateDraft,
  type DraftSlot,
} from '../../services/corrections'

interface Props {
  subject: Subject
  commission: Commission
  onClose: () => void
}

type Phase =
  | { kind: 'edit' }
  // An identical pending suggestion already existed: offer to confirm it.
  | { kind: 'duplicate'; correction: CommissionCorrection }
  | { kind: 'done'; message: string }

const field =
  'min-h-[40px] px-2 py-1.5 rounded-sm border border-border dark:border-[#3f3f46] bg-white dark:bg-[#27272a] text-ink-primary dark:text-[#f4f4f5] font-body text-body-sm'
const primaryBtn =
  'min-h-[44px] px-4 py-2 rounded-sm bg-primary text-surface font-body font-semibold text-body-sm hover:bg-primary-600 transition-colors duration-150 disabled:opacity-50'
const secondaryBtn =
  'min-h-[44px] px-4 py-2 rounded-sm font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-150'

// Form to suggest a commission's real days/times, prefilled with what the
// app shows now. Rooms are read-only context (v1 only corrects day/time).
export default function SuggestCorrectionModal({ subject, commission, onClose }: Props) {
  const { t } = useTranslation()
  const { profile, loading } = useAuth()
  const corrections = useCorrections()
  const [draft, setDraft] = useState<DraftSlot[]>(() => draftFromSchedule(commission.schedule))
  const [showErrors, setShowErrors] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'edit' })

  const dayLabel = (day: string) => t(`days.${day}`)
  const sga = sgaScheduleOf(commission)
  const validation = validateDraft(draft, commission.schedule, sga)
  const report = (c: CommissionCorrection) =>
    corrections?.onCorrectionChange(subject.subject_id, commission.name, c)

  const update = (i: number, patch: Partial<DraftSlot>) => {
    setShowErrors(true)
    setDraft((d) => d.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  }
  const addSlot = () => {
    setDraft((d) => (d.length >= MAX_SLOTS ? d : [...d, { day: 'MONDAY', from: '', to: '', classroom: '', building: '' }]))
  }
  const removeSlot = (i: number) => {
    setShowErrors(true)
    setDraft((d) => d.filter((_, j) => j !== i))
  }

  async function submit() {
    setShowErrors(true)
    if (!validation.ok || !commission.commission_id) return
    setBusy(true)
    setError(null)
    try {
      const res = await suggestCorrection(commission.commission_id, draftToSlots(draft))
      const c = toCommissionCorrection(res.correction)
      report(c)
      if (res.created) setPhase({ kind: 'done', message: t('corrections.doneCreated', { threshold: APPLY_THRESHOLD }) })
      else if (c.my_vote === 'CONFIRM') setPhase({ kind: 'done', message: t('corrections.doneAlready') })
      else setPhase({ kind: 'duplicate', correction: c })
    } catch (e) {
      setError(t(`corrections.errors.${correctionErrorKey(e)}`))
    } finally {
      setBusy(false)
    }
  }

  async function confirmDuplicate(c: CommissionCorrection) {
    setBusy(true)
    setError(null)
    try {
      const updated = toCommissionCorrection(await voteCorrection(c.id, 'CONFIRM'))
      report(updated)
      setPhase({
        kind: 'done',
        message: updated.status === 'APPLIED'
          ? t('corrections.doneApplied', { threshold: APPLY_THRESHOLD })
          : t('corrections.doneConfirmed', { threshold: APPLY_THRESHOLD }),
      })
    } catch (e) {
      setError(t(`corrections.errors.${correctionErrorKey(e)}`))
    } finally {
      setBusy(false)
    }
  }

  const header = (
    <div className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">
      <div className="font-semibold text-ink-primary dark:text-[#f4f4f5] text-body">
        <span className="font-mono text-label">({subject.subject_id})</span> {subject.name}
      </div>
      <div>{t('corrections.detailCommission', { name: commission.name })}</div>
    </div>
  )

  const errorBox = error && (
    <p role="alert" className="px-3 py-2 rounded-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-body text-body-sm border border-red-200 dark:border-red-800">
      {error}
    </p>
  )

  let body
  if (!loading && !profile) {
    body = (
      <div className="space-y-4">
        {header}
        <h4 className="font-body font-semibold text-body text-ink-primary dark:text-[#f4f4f5]">{t('corrections.signInTitle')}</h4>
        <SignInPrompt message={t('corrections.signInBody')} />
      </div>
    )
  } else if (phase.kind === 'done') {
    body = (
      <div className="space-y-4" role="status">
        {header}
        <h4 className="font-body font-semibold text-body text-ink-primary dark:text-[#f4f4f5]">{t('corrections.doneTitle')}</h4>
        <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">{phase.message}</p>
        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className={primaryBtn}>{t('corrections.done')}</button>
        </div>
      </div>
    )
  } else if (phase.kind === 'duplicate') {
    body = (
      <div className="space-y-4">
        {header}
        <p className="font-body text-body text-ink-primary dark:text-[#f4f4f5]">{t('corrections.duplicate')}</p>
        <p className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">
          {formatSlots(phase.correction.schedule, dayLabel)}
        </p>
        {errorBox}
        <div className="flex justify-end gap-2 pt-2 border-t border-border dark:border-[#3f3f46]">
          <button type="button" onClick={onClose} className={secondaryBtn}>{t('corrections.cancel')}</button>
          <button type="button" onClick={() => confirmDuplicate(phase.correction)} disabled={busy} className={primaryBtn}>
            {busy ? t('corrections.sending') : t('corrections.confirmDuplicate')}
          </button>
        </div>
      </div>
    )
  } else {
    body = (
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => { e.preventDefault(); submit() }}
      >
        {header}
        <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">
          {t('corrections.suggestIntro', { threshold: APPLY_THRESHOLD })}
        </p>
        <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">
          <span className="font-mono text-label uppercase tracking-widest">{t('corrections.sgaLabel')}:</span>{' '}
          {formatSlots(sga, dayLabel)}
        </p>

        <ol className="space-y-3">
          {draft.map((slot, i) => {
            const n = i + 1
            const slotError = showErrors ? validation.slotErrors[i] : null
            return (
              <li key={i} className="flex flex-col gap-1">
                <span className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
                  {t('corrections.slotLabel', { n })}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={slot.day}
                    onChange={(e) => update(i, { day: e.target.value })}
                    aria-label={t('corrections.dayAria', { n })}
                    aria-invalid={!!slotError}
                    className={field}
                  >
                    {SUGGESTION_DAYS.map((d) => (
                      <option key={d} value={d}>{t(`daysFull.${d}`)}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.from}
                    min={MIN_TIME}
                    max={MAX_TIME}
                    step={300}
                    onChange={(e) => update(i, { from: e.target.value })}
                    aria-label={t('corrections.fromAria', { n })}
                    aria-invalid={!!slotError}
                    className={field}
                  />
                  <span aria-hidden="true" className="text-ink-secondary">–</span>
                  <input
                    type="time"
                    value={slot.to}
                    min={MIN_TIME}
                    max={MAX_TIME}
                    step={300}
                    onChange={(e) => update(i, { to: e.target.value })}
                    aria-label={t('corrections.toAria', { n })}
                    aria-invalid={!!slotError}
                    className={field}
                  />
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    aria-label={t('corrections.removeSlot', { n })}
                    className="p-2 rounded-sm text-ink-secondary dark:text-[#a1a1aa] hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">
                  {slot.classroom ? t('corrections.classroom', { classroom: slot.classroom }) : t('corrections.noClassroom')}
                </span>
                {slotError && (
                  <span className="font-body text-body-sm text-red-700 dark:text-red-300">
                    {t(`corrections.slotErrors.${slotError}`, { min: MIN_TIME, max: MAX_TIME })}
                  </span>
                )}
              </li>
            )
          })}
        </ol>

        <button
          type="button"
          onClick={addSlot}
          disabled={draft.length >= MAX_SLOTS}
          className="font-body text-body-sm font-semibold text-primary dark:text-primary-300 underline-offset-2 hover:underline disabled:opacity-50 disabled:no-underline"
        >
          + {t('corrections.addSlot')}
        </button>

        {showErrors && validation.formError && (
          <p role="alert" className="font-body text-body-sm text-red-700 dark:text-red-300">
            {t(`corrections.formErrors.${validation.formError}`, { max: MAX_SLOTS })}
          </p>
        )}
        {errorBox}

        <div className="flex justify-end gap-2 pt-4 border-t border-border dark:border-[#3f3f46]">
          <button type="button" onClick={onClose} className={secondaryBtn}>{t('corrections.cancel')}</button>
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? t('corrections.sending') : t('corrections.submit')}
          </button>
        </div>
      </form>
    )
  }

  return (
    <BaseModal isOpen onClose={onClose} title={t('corrections.suggestTitle')}>
      {body}
    </BaseModal>
  )
}
