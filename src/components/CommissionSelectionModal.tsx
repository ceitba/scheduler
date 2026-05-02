import React, { useState, useEffect } from 'react'
import BaseModal from './BaseModal'
import { Subject } from '../hooks/useSubjects'
import { CommissionSchedule } from '../types/scheduler'

interface CommissionSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  onAddCommissions: (commissions: string[]) => void
}

const dayTranslations: { [key: string]: string } = {
  'MONDAY': 'Lun',
  'TUESDAY': 'Mar',
  'WEDNESDAY': 'Mie',
  'THURSDAY': 'Jue',
  'FRIDAY': 'Vie',
  'SATURDAY': 'Sab',
  'SUNDAY': 'Dom'
}

const CommissionSelectionModal: React.FC<CommissionSelectionModalProps> = ({
  isOpen,
  onClose,
  subject,
  onAddCommissions,
}) => {
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const validCommissions = subject.commissions.filter(comm => comm.schedule?.length > 0)

  useEffect(() => {
    if (isOpen) {
      setSelectedCommissions([])
    }
  }, [isOpen, subject])

  const handleCommissionToggle = (commissionName: string) => {
    setSelectedCommissions(prev =>
      prev.includes(commissionName)
        ? prev.filter(c => c !== commissionName)
        : [...prev, commissionName]
    )
  }

  const handleSelectAll = () => {
    onAddCommissions(validCommissions.map(c => c.name))
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
      const location = s.building ? ` | ${s.classroom}` : ' | Virtual asincrónico'
      return `${dayTranslations[s.day]}. ${s.time_from.slice(0, 5)} - ${s.time_to.slice(0, 5)}${location}`
    }).join('\n')
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar comisión"
    >
      <div className="space-y-4">
        <div className="font-body text-body-sm text-ink-secondary">
          <div className="font-semibold text-ink-primary text-body mb-1">
            <span className="font-mono text-label text-ink-secondary">({subject.subject_id})</span>{' '}
            {subject.name}
          </div>
          <p>Seleccioná las comisiones que querés incluir en las combinaciones posibles</p>
        </div>

        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
          {validCommissions.map((commission) => (
            <button
              key={commission.name}
              onClick={() => handleCommissionToggle(commission.name)}
              className={`w-full px-4 py-3 rounded-card text-left transition-colors duration-150 flex flex-col border ${
                selectedCommissions.includes(commission.name)
                  ? "bg-primary border-primary text-white"
                  : "bg-surface border-border hover:bg-primary-50 hover:border-primary"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-body font-semibold text-body-sm">Comisión {commission.name}</span>
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

        <div className="flex justify-between items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 font-body text-body-sm text-ink-secondary hover:text-primary rounded-sm hover:bg-primary-50 transition-colors duration-150"
          >
            Agregar todas
          </button>
          <button
            onClick={handleAddCommissions}
            disabled={selectedCommissions.length === 0}
            className={`min-h-[44px] px-4 py-2 rounded-sm font-body font-semibold text-body-sm transition-colors duration-150 ${
              selectedCommissions.length === 0
                ? "bg-border text-ink-secondary cursor-not-allowed"
                : "bg-primary text-surface hover:bg-primary-600"
            }`}
          >
            Agregar {selectedCommissions.length} {selectedCommissions.length !== 1 ? 'comisiones' : 'comisión'}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export default CommissionSelectionModal
