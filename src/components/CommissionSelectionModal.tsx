import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import BaseModal from './BaseModal'
import { Subject } from '../hooks/useSubjects'
import { Commission, CommissionSchedule } from '../types/scheduler'

type Turn = 'morning' | 'afternoon' | 'evening'
const ALL_TURNS: Turn[] = ['morning', 'afternoon', 'evening']

// A commission can occupy multiple turns (e.g. a slot at 09:00 + a slot at
// 14:00 belongs to morning AND afternoon). The earliest hour of each slot
// decides which turn that slot lives in.
const turnOf = (hour: number): Turn =>
  hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'

const turnsForCommission = (c: Commission): Set<Turn> => {
  const turns = new Set<Turn>()
  for (const s of c.schedule ?? []) {
    const hour = parseInt(s.time_from.slice(0, 2), 10)
    if (!Number.isNaN(hour)) turns.add(turnOf(hour))
  }
  return turns
}

interface CommissionSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  onAddCommissions: (commissions: string[]) => void
}

const CommissionSelectionModal: React.FC<CommissionSelectionModalProps> = ({
  isOpen,
  onClose,
  subject,
  onAddCommissions,
}) => {
  const { t } = useTranslation()
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [activeTurns, setActiveTurns] = useState<Set<Turn>>(new Set(ALL_TURNS))
  const validCommissions = useMemo(
    () => subject.commissions.filter((comm) => comm.schedule?.length > 0),
    [subject.commissions],
  )
  const visibleCommissions = useMemo(
    () =>
      validCommissions.filter((c) => {
        const turns = turnsForCommission(c)
        for (const t of turns) if (activeTurns.has(t)) return true
        return false
      }),
    [validCommissions, activeTurns],
  )

  useEffect(() => {
    if (isOpen) {
      setSelectedCommissions([])
      setActiveTurns(new Set(ALL_TURNS))
    }
  }, [isOpen, subject])

  const toggleTurn = (turn: Turn) => {
    setActiveTurns((prev) => {
      const next = new Set(prev)
      if (next.has(turn)) {
        // Don't let the user disable the last filter — that would empty the list.
        if (next.size === 1) return prev
        next.delete(turn)
      } else {
        next.add(turn)
      }
      return next
    })
  }

  const handleCommissionToggle = (commissionName: string) => {
    setSelectedCommissions(prev =>
      prev.includes(commissionName)
        ? prev.filter(c => c !== commissionName)
        : [...prev, commissionName]
    )
  }

  const handleSelectAll = () => {
    onAddCommissions(visibleCommissions.map(c => c.name))
    onClose()
  }

  const handleAddCommissions = () => {
    if (selectedCommissions.length > 0) {
      onAddCommissions(selectedCommissions)
      onClose()
    }
  }

  const formatSchedule = (schedule: CommissionSchedule[]) => {
    return schedule.map(s => {
      const location = s.building ? ` | ${s.classroom}` : ` | ${t('commission.virtual')}`
      return `${t(`days.${s.day}`)}. ${s.time_from.slice(0, 5)} - ${s.time_to.slice(0, 5)}${location}`
    }).join('\n')
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('commission.title')}
    >
      <div className="space-y-4">
        <div className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">
          <div className="font-semibold text-ink-primary dark:text-[#f4f4f5] text-body mb-1">
            <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">({subject.subject_id})</span>{' '}
            {subject.name}
          </div>
          <p>{t('commission.selectHint')}</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center" role="group" aria-label={t('commission.turnFilterLabel')}>
          <span className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa] mr-1">
            {t('commission.turnFilterLabel')}
          </span>
          {ALL_TURNS.map((turn) => {
            const active = activeTurns.has(turn)
            return (
              <button
                key={turn}
                type="button"
                onClick={() => toggleTurn(turn)}
                aria-pressed={active}
                className={`px-2.5 py-1 rounded-sm font-mono text-label uppercase tracking-widest border transition-colors ${
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface dark:bg-[#18181b] text-ink-secondary dark:text-[#a1a1aa] border-border dark:border-[#3f3f46] hover:border-primary'
                }`}
              >
                {t(`commission.turn_${turn}`)}
              </button>
            )
          })}
        </div>

        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
          {visibleCommissions.length === 0 && (
            <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] py-4 text-center">
              {t('commission.noMatchTurns')}
            </p>
          )}
          {visibleCommissions.map((commission) => (
            <button
              key={commission.name}
              onClick={() => handleCommissionToggle(commission.name)}
              className={`w-full px-4 py-3 rounded-card text-left transition-colors duration-150 flex flex-col border ${
                selectedCommissions.includes(commission.name)
                  ? "bg-primary border-primary text-white"
                  : "bg-surface dark:bg-[#18181b] border-border dark:border-[#3f3f46] hover:bg-primary-50 dark:hover:bg-primary-900 hover:border-primary"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-body font-semibold text-body-sm">{t('commission.commission')} {commission.name}</span>
                {selectedCommissions.includes(commission.name) && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className={`font-mono text-label mt-1 whitespace-pre-line ${
                selectedCommissions.includes(commission.name)
                  ? "text-white/80"
                  : "text-ink-secondary"
              }`}>
                {formatSchedule(commission.schedule)}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center gap-3 pt-4 border-t border-border dark:border-[#3f3f46]">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] hover:text-primary rounded-sm hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-150"
          >
            {t('commission.addAll')}
          </button>
          <button
            onClick={handleAddCommissions}
            disabled={selectedCommissions.length === 0}
            className={`min-h-[44px] px-4 py-2 rounded-sm font-body font-semibold text-body-sm transition-colors duration-150 ${
              selectedCommissions.length === 0
                ? "bg-border dark:bg-[#3f3f46] text-ink-secondary dark:text-[#a1a1aa] cursor-not-allowed"
                : "bg-primary text-surface hover:bg-primary-600"
            }`}
          >
            {t('commission.addSelected', { count: selectedCommissions.length })}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export default CommissionSelectionModal
