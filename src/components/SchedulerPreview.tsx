import React, { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { PossibleSchedule, ScheduleSlot, SchedulerOptions, TimeBlock } from "../types/scheduler"
import ScheduleGrid from "./ScheduleGrid"
import Checkbox from "./Checkbox"
import SaveModal from "./SaveModal"
import EmptyState from "./EmptyState"
import WallpaperLayout from "./WallpaperLayout"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface SchedulerPreviewProps {
  // Generated combinations, already filtered by `options` and ranked.
  schedules: PossibleSchedule[]
  truncated: boolean
  generated: boolean
  currentIndex: number
  onIndexChange: (index: number) => void
  options: SchedulerOptions
  onOptionsChange: (options: SchedulerOptions) => void
  blockedTimes: TimeBlock[]
  hasSubjects: boolean
  onExportToCalendar: () => void
  liveSlots?: ScheduleSlot[]
  liveConflictCount?: number
}

export const SchedulerPreview: React.FC<SchedulerPreviewProps> = ({
  schedules,
  truncated,
  generated,
  currentIndex,
  onIndexChange,
  options,
  onOptionsChange,
  blockedTimes,
  hasSubjects,
  onExportToCalendar,
  liveSlots = [],
  liveConflictCount = 0,
}) => {
  const { t } = useTranslation()
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const scheduleRef = useRef<HTMLDivElement>(null)
  const wallpaperRef = useRef<HTMLDivElement>(null)

  const currentSchedule: PossibleSchedule | undefined = schedules[currentIndex]

  const handlePrevSchedule = () => {
    if (schedules.length > 0) {
      onIndexChange(currentIndex > 0 ? currentIndex - 1 : schedules.length - 1)
    }
  }

  const handleNextSchedule = () => {
    if (schedules.length > 0) {
      onIndexChange(currentIndex < schedules.length - 1 ? currentIndex + 1 : 0)
    }
  }

  const hasSchedules = schedules.length > 0

  const renderScheduleInfo = (schedule: PossibleSchedule) => {
    return (
      <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
        <div className="flex flex-wrap gap-3 font-body text-body-sm text-ink-secondary items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schedule.maxOverlap ? "bg-red-500" : "bg-green-500"}`} />
            <span>{schedule.maxOverlap ? t('scheduler.hasOverlap') : t('scheduler.noOverlap')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schedule.hasBuildingConflict ? "bg-red-500" : "bg-green-500"}`} />
            <span>{schedule.hasBuildingConflict ? t('scheduler.buildingConflict') : t('scheduler.noBuildingConflict')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schedule.hasFreeDay ? "bg-green-500" : "bg-red-500"}`} />
            <span>{schedule.hasFreeDay ? t('scheduler.hasFreeDay') : t('scheduler.noFreeDay')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-label text-ink-secondary">
          <div className="w-5 h-5 border-2 border-dashed border-ink-secondary/30 dark:border-[#a1a1aa]/30 bg-surface dark:bg-[#18181b]"></div>
          <span>{t('scheduler.blockedTime')}</span>
        </div>
      </div>
    )
  }

  const handleSaveAsPDF = async () => {
    if (!scheduleRef.current) return

    const element = scheduleRef.current
    const wrapper = document.createElement('div')
    wrapper.style.position = 'fixed'
    wrapper.style.top = '-9999px'
    wrapper.style.left = '-9999px'
    wrapper.style.width = '1920px'
    wrapper.style.height = '1080px'
    wrapper.style.backgroundColor = '#FAFAF8'
    wrapper.style.padding = '40px'
    wrapper.style.overflow = 'hidden'

    const clone = element.cloneNode(true) as HTMLElement
    clone.style.width = '100%'
    clone.style.height = '100%'
    clone.style.transform = 'scale(1)'
    clone.style.transformOrigin = 'top left'

    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null,
        width: 1920,
        height: 1080,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style')
          style.textContent = `* { font-family: Arial, Roboto, sans-serif !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }`
          clonedDoc.head.appendChild(style)

          const dayHeaders = clonedDoc.querySelectorAll('.grid-cols-\\[auto_1fr_1fr_1fr_1fr_1fr\\] > div')
          const fullDayNames: { [key: string]: string } = { 'Lun': 'Lunes', 'Mar': 'Martes', 'Mie': 'Miércoles', 'Jue': 'Jueves', 'Vie': 'Viernes' }
          dayHeaders.forEach((header: Element, index) => {
            if (index > 0) {
              const text = header.textContent?.trim() || ''
              Object.entries(fullDayNames).forEach(([short, full]) => {
                if (text.includes(short)) header.textContent = full
              })
            }
          })
        }
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('horario.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      document.body.removeChild(wrapper)
    }
  }

  const handleSaveAsImage = async () => {
    if (!scheduleRef.current) return

    const element = scheduleRef.current
    const wrapper = document.createElement('div')
    wrapper.style.position = 'fixed'
    wrapper.style.top = '-9999px'
    wrapper.style.left = '-9999px'
    wrapper.style.width = '1920px'
    wrapper.style.height = '1080px'
    wrapper.style.backgroundColor = '#FAFAF8'
    wrapper.style.padding = '40px'
    wrapper.style.overflow = 'hidden'

    const clone = element.cloneNode(true) as HTMLElement
    clone.style.width = '100%'
    clone.style.height = '100%'
    clone.style.transform = 'scale(1)'
    clone.style.transformOrigin = 'top left'

    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null,
        width: 1920,
        height: 1080,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style')
          style.textContent = `* { font-family: Arial, Roboto, sans-serif !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }`
          clonedDoc.head.appendChild(style)

          const dayHeaders = clonedDoc.querySelectorAll('.grid-cols-\\[auto_1fr_1fr_1fr_1fr_1fr\\] > div')
          const fullDayNames: { [key: string]: string } = { 'Lun': 'Lunes', 'Mar': 'Martes', 'Mie': 'Miércoles', 'Jue': 'Jueves', 'Vie': 'Viernes' }
          dayHeaders.forEach((header: Element, index) => {
            if (index > 0) {
              const text = header.textContent?.trim() || ''
              Object.entries(fullDayNames).forEach(([short, full]) => {
                if (text.includes(short)) header.textContent = full
              })
            }
          })
        }
      })

      const link = document.createElement('a')
      link.download = 'horario.png'
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      document.body.removeChild(wrapper)
    }
  }

  const handleShareLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert(t('save.linkCopied'))
  }

  // 9:16 phone wallpaper. The WallpaperLayout component is mounted
  // offscreen at exactly 1080x1920 so html2canvas captures it 1:1 — no
  // scaling, no font-substitution surprises.
  const handleSaveAsWallpaper = async () => {
    if (!wallpaperRef.current) return
    try {
      const canvas = await html2canvas(wallpaperRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FAFAF8',
        width: 1080,
        height: 1920,
      })
      const link = document.createElement('a')
      link.download = 'horario-wallpaper.png'
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (error) {
      console.error('Error generating wallpaper:', error)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="bg-white dark:bg-[#27272a] rounded-card border border-border dark:border-[#3f3f46] px-4 py-4">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-end mb-4">
          <Checkbox
            id="allowOverlap"
            checked={options.allowOverlap && !options.allowUnlimitedOverlap}
            onChange={(checked) => onOptionsChange({ ...options, allowOverlap: checked, allowUnlimitedOverlap: false })}
            label={t('scheduler.allowOverlap')}
            isTooltip={true}
            tooltip={t('scheduler.allowOverlapTooltip')}
            disabled={options.allowUnlimitedOverlap}
          />

          <Checkbox
            id="allowUnlimitedOverlap"
            checked={options.allowUnlimitedOverlap}
            onChange={(checked) => onOptionsChange({ ...options, allowUnlimitedOverlap: checked, allowOverlap: checked })}
            label={t('scheduler.allowUnlimitedOverlap')}
            isTooltip={true}
            tooltip={t('scheduler.allowUnlimitedOverlapTooltip')}
            disabled={options.allowOverlap && !options.allowUnlimitedOverlap}
          />

          <Checkbox
            id="freeDay"
            checked={options.allowFreeDay}
            onChange={(checked) => onOptionsChange({ ...options, allowFreeDay: checked })}
            label={t('scheduler.freeDay')}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border dark:border-[#3f3f46] mb-4">
          <div className="flex items-center gap-4">
            <h2 className="font-body font-semibold text-body text-ink-primary">{t('scheduler.title')}</h2>
            {hasSubjects && hasSchedules && (
              <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa] whitespace-nowrap flex-shrink-0">
                {t('scheduler.option')} {currentIndex + 1} {t('scheduler.of')} {schedules.length}
              </span>
            )}
            {hasSubjects && schedules.length > 1 && (
              <span className="hidden lg:inline font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">
                {t('scheduler.rankingHint')}
              </span>
            )}
          </div>

          <div className="flex gap-1">
            {hasSubjects && hasSchedules && (
              <>
                {schedules.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevSchedule}
                      className="p-2 text-ink-secondary dark:text-[#a1a1aa] hover:bg-surface dark:hover:bg-[#18181b] hover:text-primary rounded-sm transition-colors duration-150"
                      title="Anterior horario"
                      aria-label="Horario anterior"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 8 12 12 16" />
                        <line x1="16" y1="12" x2="8" y2="12" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextSchedule}
                      className="p-2 text-ink-secondary dark:text-[#a1a1aa] hover:bg-surface dark:hover:bg-[#18181b] hover:text-primary rounded-sm transition-colors duration-150"
                      title="Siguiente horario"
                      aria-label="Siguiente horario"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 16 12 12 16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="p-2 text-ink-secondary hover:bg-surface hover:text-primary rounded-sm transition-colors duration-150"
                  title={t('save.title')}
                  aria-label={t('save.title')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {hasSubjects && truncated && (
          <p
            role="status"
            className="mb-3 px-3 py-2 rounded-sm border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 font-body text-body-sm text-amber-800 dark:text-amber-200"
          >
            {hasSchedules
              ? t('scheduler.truncatedNotice', { count: schedules.length })
              : t('scheduler.searchStopped')}
          </p>
        )}

        <div ref={scheduleRef}>
          {!hasSubjects ? (
            <EmptyState
              title={t('scheduler.noSubjects')}
              message={t('scheduler.noSubjectsMessage')}
            />
          ) : currentSchedule ? (
            <>
              <ScheduleGrid slots={currentSchedule.slots} blockedTimes={blockedTimes} />
              <div className="mt-4">
                {renderScheduleInfo(currentSchedule)}
              </div>
            </>
          ) : !generated && liveSlots.length > 0 ? (
            <>
              <div className="mb-3 flex items-center gap-2 font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
                <div className={`w-2 h-2 rounded-full ${liveConflictCount > 0 ? 'bg-red-500' : 'bg-amber-500'}`} />
                <span>
                  {liveConflictCount > 0
                    ? t('scheduler.livePreviewConflicts', { count: liveConflictCount })
                    : t('scheduler.livePreviewHint')}
                </span>
              </div>
              <ScheduleGrid slots={liveSlots} blockedTimes={blockedTimes} />
            </>
          ) : (
            <EmptyState
              title={t('scheduler.noCombinations')}
              message={t('scheduler.noCombinationsMessage')}
            />
          )}
        </div>
      </div>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveAsPDF={handleSaveAsPDF}
        onSaveAsImage={handleSaveAsImage}
        onSaveAsWallpaper={currentSchedule ? handleSaveAsWallpaper : undefined}
        onExportToCalendar={onExportToCalendar}
        onShareLink={handleShareLink}
      />

      {currentSchedule && (
        <div
          aria-hidden="true"
          style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none' }}
        >
          <WallpaperLayout ref={wallpaperRef} slots={currentSchedule.slots} />
        </div>
      )}
    </div>
  )
}
