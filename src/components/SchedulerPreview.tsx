import React, { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { PossibleSchedule, ScheduleSlot, SchedulerOptions, TimeBlock } from "../types/scheduler"
import ScheduleGrid from "./ScheduleGrid"
import Checkbox from "./Checkbox"
import SaveModal from "./SaveModal"
import EmptyState from "./EmptyState"
import WallpaperLayout from "./WallpaperLayout"
import { WEEKDAYS } from "../services/time"
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
  // Link that reopens this career/plan with the selected subjects (?code=).
  shareUrl: string
  liveSlots?: ScheduleSlot[]
  liveConflictCount?: number
}

// Renders a copy of the schedule offscreen at 1920x1080 (so the export
// doesn't depend on the viewport) and returns the canvas. Day headers are
// replaced with their full names from `fullDayNames`.
async function captureSchedule(element: HTMLElement, fullDayNames: Record<string, string>): Promise<HTMLCanvasElement> {
  const wrapper = document.createElement('div')
  Object.assign(wrapper.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: '1920px',
    height: '1080px',
    backgroundColor: '#FAFAF8',
    padding: '40px',
    overflow: 'hidden',
  })

  const clone = element.cloneNode(true) as HTMLElement
  Object.assign(clone.style, { width: '100%', height: '100%', transform: 'scale(1)', transformOrigin: 'top left' })
  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  try {
    return await html2canvas(wrapper, {
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
        dayHeaders.forEach((header: Element, index) => {
          if (index === 0) return
          const full = fullDayNames[header.textContent?.trim() ?? '']
          if (full) header.textContent = full
        })
      },
    })
  } finally {
    document.body.removeChild(wrapper)
  }
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
  shareUrl,
  liveSlots = [],
  liveConflictCount = 0,
}) => {
  const { t } = useTranslation()
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null)
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

  // Header labels are short day names ("Lun"); exports spell them out.
  const fullDayNames = Object.fromEntries(
    WEEKDAYS.map((d) => [t(`days.${d}`), t(`daysFull.${d}`)])
  )

  const handleSaveAsPDF = async () => {
    if (!scheduleRef.current) return
    try {
      const canvas = await captureSchedule(scheduleRef.current, fullDayNames)
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('horario.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handleSaveAsImage = async () => {
    if (!scheduleRef.current) return
    try {
      const canvas = await captureSchedule(scheduleRef.current, fullDayNames)
      const link = document.createElement('a')
      link.download = 'horario.png'
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), toast.kind === "error" ? 8000 : 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setToast({ kind: "success", message: t('save.linkCopied') })
    } catch {
      setToast({ kind: "error", message: t('save.linkCopyFailed', { url: shareUrl }) })
    }
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
                      title={t('scheduler.prevOption')}
                      aria-label={t('scheduler.prevOption')}
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
                      title={t('scheduler.nextOption')}
                      aria-label={t('scheduler.nextOption')}
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

      {toast && (
        <div
          role={toast.kind === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-[#27272a] border rounded-card shadow-card-hover p-4 flex items-start gap-3 animate-slide-up ${
            toast.kind === "error" ? "border-red-300 dark:border-red-800" : "border-border dark:border-[#3f3f46]"
          }`}
        >
          <p className={`flex-1 min-w-0 break-words font-body text-body-sm ${
            toast.kind === "error" ? "text-red-700 dark:text-red-300" : "text-ink-primary dark:text-[#f4f4f5]"
          }`}>
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label={t('save.toastDismiss')}
            className="text-ink-secondary dark:text-[#a1a1aa] hover:text-ink-primary"
          >
            ×
          </button>
        </div>
      )}

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
