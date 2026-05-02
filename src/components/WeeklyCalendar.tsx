import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { TimeBlock } from '../types/scheduler'
import BaseModal from './BaseModal'

interface LabeledTimeBlock extends TimeBlock {
  id: string
  label?: string
  from: string
  to: string
}

interface WeeklyCalendarProps {
  onChange?: (blocks: LabeledTimeBlock[]) => void
  initialBlocks?: LabeledTimeBlock[]
}

interface EditModalProps {
  block: LabeledTimeBlock
  onSave: (block: LabeledTimeBlock) => void
  onClose: () => void
  onDelete: () => void
}

interface SelectionState {
  day: string
  startHour: number
  endHour: number | null
}

const EditModal: React.FC<EditModalProps> = ({ block, onSave, onClose, onDelete }) => {
  const { t } = useTranslation()
  const [label, setLabel] = useState(block.label || '')

  return (
    <BaseModal isOpen={true} onClose={onClose} title={t('settings.editBlock')}>
      <div className="space-y-4">
        <div>
          <label className="block font-body text-body-sm font-medium text-ink-primary dark:text-[#f4f4f5] mb-2">{t('settings.blockLabel')}</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-border dark:border-[#3f3f46] rounded-sm bg-surface dark:bg-[#18181b] text-ink-primary dark:text-[#f4f4f5] font-body text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            placeholder={t('settings.blockLabelPlaceholder')}
          />
        </div>
        <div className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa]">
          {t(`days.${block.day}`)} {block.from} - {block.to}
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-border dark:border-[#3f3f46]">
          <button
            onClick={() => onDelete()}
            className="px-4 py-2 font-body text-body-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors duration-150"
          >
            {t('settings.delete')}
          </button>
          <button
            onClick={() => onSave({ ...block, label })}
            className="min-h-[44px] px-4 py-2 bg-primary text-surface font-body font-semibold text-body-sm rounded-sm hover:bg-primary-600 transition-colors duration-150"
          >
            {t('settings.save')}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ onChange, initialBlocks = [] }) => {
  const { t } = useTranslation()
  const [selectedBlocks, setSelectedBlocks] = useState<LabeledTimeBlock[]>(
    initialBlocks.map(block => ({ ...block, id: block.id || crypto.randomUUID() }))
  )
  const [editingBlock, setEditingBlock] = useState<LabeledTimeBlock | null>(null)
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const dayKeys = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const dayNames = {
    short: dayKeys.map(d => t(`days.${d}`)),
    full: dayKeys
  }

  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8
    return `${hour.toString().padStart(2, '0')}:00`
  })

  const getBlocksForDay = (day: string): LabeledTimeBlock[] => {
    return selectedBlocks.filter(block => block.day === day)
      .sort((a, b) => parseInt(a.from) - parseInt(b.from))
  }

  const getBlockHeight = (from: string, to: string): number => {
    const fromHour = parseInt(from.split(':')[0])
    const toHour = parseInt(to.split(':')[0])
    return (toHour - fromHour) * 32
  }

  const getBlockTop = (from: string): number => {
    const fromHour = parseInt(from.split(':')[0])
    return (fromHour - 8) * 32
  }

  const getHourFromPosition = (y: number): number => {
    const cellHeight = 32
    const gridHeight = cellHeight * 14

    if (y >= gridHeight - cellHeight / 2) return 22

    const hour = Math.floor(y / cellHeight) + 8
    return Math.min(Math.max(hour, 8), 21)
  }

  const handleMouseDown = (day: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const hour = getHourFromPosition(relativeY)

    setIsSelecting(true)
    setSelection({ day, startHour: hour, endHour: hour })
  }

  const handleMouseMove = useCallback(
    (day: string, e: React.MouseEvent) => {
      if (isSelecting && selection && day === selection.day) {
        const rect = e.currentTarget.getBoundingClientRect()
        const relativeY = e.clientY - rect.top
        const hour = getHourFromPosition(relativeY)

        setSelection(prev => {
          if (!prev) return null
          return { ...prev, endHour: hour }
        })
      }
    },
    [isSelecting, selection]
  )

  const handleMouseUp = useCallback(() => {
    if (selection) {
      const { day, startHour, endHour } = selection

      const hasOverlap = (newBlock: LabeledTimeBlock): boolean => {
        return selectedBlocks.some(block => {
          if (block.day !== newBlock.day) return false
          const newStart = parseInt(newBlock.from)
          const newEnd = parseInt(newBlock.to)
          const blockStart = parseInt(block.from)
          const blockEnd = parseInt(block.to)
          return (newStart < blockEnd && newEnd > blockStart)
        })
      }

      if (endHour && (Math.abs(endHour - startHour) <= 1)) {
        const newBlock: LabeledTimeBlock = {
          id: crypto.randomUUID(),
          day,
          from: `${startHour.toString().padStart(2, '0')}:00`,
          to: `${(startHour + 1).toString().padStart(2, '0')}:00`
        }
        if (!hasOverlap(newBlock)) {
          setSelectedBlocks(prev => [...prev, newBlock])
          onChange?.([...selectedBlocks, newBlock])
        }
      } else if (endHour && Math.abs(endHour - startHour) > 1) {
        const [start, end] = [Math.min(startHour, endHour), Math.max(startHour, endHour)]
        const newBlock: LabeledTimeBlock = {
          id: crypto.randomUUID(),
          day,
          from: `${start.toString().padStart(2, '0')}:00`,
          to: `${end.toString().padStart(2, '0')}:00`
        }
        if (!hasOverlap(newBlock)) {
          setSelectedBlocks(prev => [...prev, newBlock])
          onChange?.([...selectedBlocks, newBlock])
        }
      }
    }
    setIsSelecting(false)
    setSelection(null)
  }, [selection, selectedBlocks, onChange])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseUp])

  const handleSaveBlock = (updatedBlock: LabeledTimeBlock) => {
    const newBlocks = selectedBlocks.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    )
    setSelectedBlocks(newBlocks)
    onChange?.(newBlocks)
    setEditingBlock(null)
  }

  const handleDeleteBlock = () => {
    if (editingBlock) {
      const newBlocks = selectedBlocks.filter(block => block.id !== editingBlock.id)
      setSelectedBlocks(newBlocks)
      onChange?.(newBlocks)
      setEditingBlock(null)
    }
  }

  useEffect(() => {
    const calendar = calendarRef.current
    if (!calendar) return

    const preventScroll = (e: TouchEvent) => { e.preventDefault() }
    calendar.addEventListener('touchmove', preventScroll, { passive: false })
    return () => calendar.removeEventListener('touchmove', preventScroll)
  }, [])

  const handleTouchStart = (day: string, e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = touch.clientY - rect.top
    const hour = getHourFromPosition(relativeY)

    setIsSelecting(true)
    setSelection({ day, startHour: hour, endHour: hour })
  }

  const handleTouchMove = (day: string, e: React.TouchEvent) => {
    if (isSelecting && selection && day === selection.day) {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = e.currentTarget.getBoundingClientRect()
      const relativeY = touch.clientY - rect.top
      const hour = getHourFromPosition(relativeY)

      setSelection(prev => {
        if (!prev) return null
        return { ...prev, endHour: hour }
      })
    }
  }

  const handleTouchEnd = () => { handleMouseUp() }

  const getBlockColor = (blockId: string) => {
    const index = (selectedBlocks.findIndex(b => b.id === blockId) % 10) + 1
    return `bg-subject_color_${index}`
  }

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-card border border-border dark:border-[#3f3f46] px-4 py-4">
      <h2 className="font-body font-semibold text-body text-ink-primary dark:text-[#f4f4f5] pb-2">
        {t('settings.blockedTimes')}
      </h2>
      <div className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] mb-4">
        Los horarios bloqueados son períodos específicos en los que no deseas tener clases programadas.
        <div className="space-y-2 mt-3">
          {[
            ['Actividades personales', 'Trabajo, almuerzo, ejercicio, tiempo en familia'],
            ['Tiempos de traslado', 'Viajes hacia y desde la universidad'],
            ['Compromisos fijos', 'Otras actividades académicas, cursos o responsabilidades'],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <span className="font-semibold text-ink-primary dark:text-[#f4f4f5]">{title}</span>
                <span className="text-ink-secondary dark:text-[#a1a1aa]"> — {desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full select-none" ref={calendarRef}>
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5 mb-0.5">
            <div className="h-8 flex items-center justify-start font-mono text-label text-ink-secondary dark:text-[#a1a1aa] min-w-[40px]">
              {t('settings.hour')}
            </div>
            {dayNames.short.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center text-center justify-center font-mono text-label text-ink-secondary dark:text-[#a1a1aa] bg-surface dark:bg-[#18181b] rounded-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-0.5">
            {/* Time labels */}
            <div>
              {timeSlots.map((time) => (
                <div key={time} className="h-8 flex items-center font-mono text-label text-ink-secondary dark:text-[#a1a1aa] min-w-[40px]">
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {dayNames.full.map((day) => (
              <div key={day} className="relative h-[448px] bg-surface dark:bg-[#18181b] rounded-sm">
                {timeSlots.map((_, index) => (
                  <div
                    key={index}
                    className="absolute w-full border-b border-border/50 dark:border-[#3f3f46]/50"
                    style={{ top: `${index * 32}px`, height: '32px' }}
                  />
                ))}

                {selection && selection.day === day && selection.endHour && (
                  <div
                    className="absolute select-none inset-x-0 bg-primary-100 flex flex-col items-center justify-center transition-all duration-75"
                    style={{
                      top: `${(Math.min(selection.startHour, selection.endHour) - 8) * 32}px`,
                      height: `${Math.abs(selection.endHour - selection.startHour) * 32}px`,
                    }}
                  >
                    {Math.abs(selection.endHour - selection.startHour) >= 1 && (
                      <span className="font-mono text-label text-ink-primary text-center select-none">
                        {`${Math.min(selection.startHour, selection.endHour)}:00 - ${Math.max(selection.startHour, selection.endHour)}:00`}
                      </span>
                    )}
                  </div>
                )}

                <div
                  className="absolute inset-0 cursor-pointer touch-none"
                  onMouseDown={(e) => handleMouseDown(day, e)}
                  onMouseMove={(e) => handleMouseMove(day, e)}
                  onTouchStart={(e) => handleTouchStart(day, e)}
                  onTouchMove={(e) => handleTouchMove(day, e)}
                  onTouchEnd={handleTouchEnd}
                />

                {getBlocksForDay(day).map((block) => {
                  const height = getBlockHeight(block.from, block.to)
                  const top = getBlockTop(block.from)
                  const colorClass = getBlockColor(block.id)

                  return (
                    <button
                      key={block.id}
                      onClick={() => setEditingBlock(block)}
                      className={`absolute inset-x-0 flex flex-col items-center justify-center hover:brightness-90 text-ink-primary cursor-pointer group/block transition-all px-2 z-10 select-none ${colorClass}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        borderRadius: top === 0 ? '6px 6px 0 0' : top + height === 448 ? '0 0 6px 6px' : '0'
                      }}
                    >
                      {block.label ? (
                        <div className="flex flex-col items-center justify-center w-full h-full p-1">
                          <span className="font-body text-body-sm font-semibold truncate w-full text-center">{block.label}</span>
                          <span className="font-mono text-label text-ink-secondary w-full text-center">
                            {block.from} - {block.to}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="font-mono text-label text-ink-secondary w-full text-center">
                            {block.from} - {block.to}
                          </span>
                        </div>
                      )}
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        className="absolute right-2 opacity-0 group-hover/block:opacity-100 text-ink-secondary"
                        aria-hidden="true"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingBlock && (
        <EditModal
          block={editingBlock}
          onSave={handleSaveBlock}
          onClose={() => setEditingBlock(null)}
          onDelete={handleDeleteBlock}
        />
      )}
    </div>
  )
}

export default WeeklyCalendar
