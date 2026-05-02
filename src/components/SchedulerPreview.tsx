import React, { useState, useEffect, useRef } from "react"
import { PossibleSchedule } from "../types/scheduler"
import ScheduleGrid from "./ScheduleGrid"
import { Scheduler } from "../services/scheduler"
import Checkbox from "./Checkbox"
import SaveModal from "./SaveModal"
import EmptyState from "./EmptyState"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface SchedulerPreviewProps {
  schedules: PossibleSchedule[]
  setSchedules: (schedules: PossibleSchedule[]) => void
  hasSubjects: boolean
  onExportToCalendar: () => void
}

interface ScheduleSettings {
  allowTimeOverlap: boolean
  allowUnlimitedOverlap: boolean
  avoidLocationChanges: boolean
  haveFreeDay: boolean
  timeFormat: "12h" | "24h"
}

export const SchedulerPreview: React.FC<SchedulerPreviewProps> = ({
  schedules = [],
  setSchedules = () => {},
  hasSubjects,
  onExportToCalendar,
}) => {
  const scheduler = Scheduler.getInstance()
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0)
  const [lastOptionsString, setLastOptionsString] = useState(
    JSON.stringify(scheduler.getOptions())
  )
  const [lastSubjectsString, setLastSubjectsString] = useState(
    JSON.stringify(scheduler.getSubjects())
  )
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const scheduleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentOptionsString = JSON.stringify(scheduler.getOptions())
    const currentSubjectsString = JSON.stringify(scheduler.getSubjects())

    if (
      currentOptionsString !== lastOptionsString ||
      currentSubjectsString !== lastSubjectsString
    ) {
      setLastOptionsString(currentOptionsString)
      setLastSubjectsString(currentSubjectsString)
      setCurrentScheduleIndex(0)
    }
  }, [scheduler, lastOptionsString, lastSubjectsString])

  useEffect(() => {
    if (schedules.length > 0) {
      setCurrentScheduleIndex(0)
    }
  }, [schedules])

  const filteredSchedules = schedules.filter((schedule) => {
    const options = scheduler.getOptions()
    const hasValidOverlap = options.allowUnlimitedOverlap ||
      (options.allowOverlap && schedule.maxOverlap <= 30) ||
      schedule.maxOverlap === 0
    const hasValidFreeDay = !options.allowFreeDay || schedule.hasFreeDay
    return hasValidOverlap && hasValidFreeDay
  })

  useEffect(() => {
    if (currentScheduleIndex >= filteredSchedules.length) {
      setCurrentScheduleIndex(0)
    }
  }, [filteredSchedules.length, currentScheduleIndex])

  const currentSchedule = filteredSchedules[currentScheduleIndex]

  const handlePrevSchedule = () => {
    if (filteredSchedules.length > 0) {
      setCurrentScheduleIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSchedules.length - 1
      )
    }
  }

  const handleNextSchedule = () => {
    if (filteredSchedules.length > 0) {
      setCurrentScheduleIndex((prev) =>
        prev < filteredSchedules.length - 1 ? prev + 1 : 0
      )
    }
  }

  const [settings, setSettings] = useState<ScheduleSettings>({
    allowTimeOverlap: scheduler.getOptions().allowOverlap,
    allowUnlimitedOverlap: scheduler.getOptions().allowUnlimitedOverlap,
    avoidLocationChanges: scheduler.getOptions().avoidBuildingChange,
    haveFreeDay: scheduler.getOptions().allowFreeDay,
    timeFormat: "24h",
  })

  const hasSchedules = Array.isArray(filteredSchedules) && filteredSchedules.length > 0

  const renderScheduleInfo = (schedule: PossibleSchedule) => {
    return (
      <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
        <div className="flex flex-wrap gap-3 font-body text-body-sm text-ink-secondary items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schedule.maxOverlap ? "bg-red-500" : "bg-green-500"}`} />
            <span>{schedule.maxOverlap ? "Tiene superposición" : "Sin superposición"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schedule.hasBuildingConflict ? "bg-red-500" : "bg-green-500"}`} />
            <span>{schedule.hasBuildingConflict ? "Conflicto de edificios" : "Sin conflicto de edificios"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schedule.hasFreeDay ? "bg-green-500" : "bg-red-500"}`} />
            <span>{schedule.hasFreeDay ? "Tiene día libre" : "Sin día libre"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-label text-ink-secondary">
          <div className="w-5 h-5 border-2 border-dashed border-ink-secondary/30 bg-surface"></div>
          <span>Horario bloqueado</span>
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
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height], hotfixes: ['px_scaling'] })
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
    alert("¡Enlace copiado al portapapeles!")
  }

  return (
    <div className="flex flex-col">
      <div className="bg-white rounded-card border border-border px-4 py-4">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-end mb-4">
          <Checkbox
            id="allowOverlap"
            checked={settings.allowTimeOverlap && !settings.allowUnlimitedOverlap}
            onChange={(checked) => {
              const newSettings = { ...settings, allowTimeOverlap: checked, allowUnlimitedOverlap: false }
              setSettings(newSettings)
              scheduler.setOptions({ ...scheduler.getOptions(), allowOverlap: checked, allowUnlimitedOverlap: false })
              setSchedules(scheduler.generateSchedules())
            }}
            label="Permitir superposición limitada"
            isTooltip={true}
            tooltip="Máx. diferencia: 30 mins"
            disabled={settings.allowUnlimitedOverlap}
          />

          <Checkbox
            id="allowUnlimitedOverlap"
            checked={settings.allowUnlimitedOverlap}
            onChange={(checked) => {
              const newSettings = { ...settings, allowUnlimitedOverlap: checked, allowTimeOverlap: checked }
              setSettings(newSettings)
              scheduler.setOptions({ ...scheduler.getOptions(), allowUnlimitedOverlap: checked, allowOverlap: checked })
              setSchedules(scheduler.generateSchedules())
            }}
            label="Permitir superposición completa"
            isTooltip={true}
            tooltip="Sin límite de superposición"
            disabled={settings.allowTimeOverlap && !settings.allowUnlimitedOverlap}
          />

          <Checkbox
            id="freeDay"
            checked={settings.haveFreeDay}
            onChange={(checked) => {
              const newSettings = { ...settings, haveFreeDay: checked }
              setSettings(newSettings)
              scheduler.setOptions({ ...scheduler.getOptions(), allowFreeDay: checked })
              setSchedules(scheduler.generateSchedules())
            }}
            label="Tener un día libre"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border mb-4">
          <div className="flex items-center gap-4">
            <h2 className="font-body font-semibold text-body text-ink-primary">Vista previa de horarios</h2>
            {hasSubjects && hasSchedules && (
              <span className="font-mono text-label text-ink-secondary whitespace-nowrap flex-shrink-0">
                Opción {currentScheduleIndex + 1} de {filteredSchedules.length}
              </span>
            )}
          </div>

          <div className="flex gap-1">
            {hasSubjects && hasSchedules && (
              <>
                {filteredSchedules.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevSchedule}
                      className="p-2 text-ink-secondary hover:bg-surface hover:text-primary rounded-sm transition-colors duration-150"
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
                      className="p-2 text-ink-secondary hover:bg-surface hover:text-primary rounded-sm transition-colors duration-150"
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
                  title="Guardar horario"
                  aria-label="Guardar horario"
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

        <div ref={scheduleRef}>
          {!hasSubjects ? (
            <EmptyState
              title="Sin materias seleccionadas"
              message="Seleccioná materias en la pestaña Cursos y luego volvé aquí para ver las combinaciones posibles."
            />
          ) : filteredSchedules.length === 0 ? (
            <EmptyState
              title="Sin combinaciones posibles"
              message="No hay combinaciones posibles para esta configuración. Probá cambiando las opciones o seleccionando otras comisiones."
            />
          ) : currentSchedule ? (
            <>
              <ScheduleGrid slots={currentSchedule.slots} />
              <div className="mt-4">
                {renderScheduleInfo(currentSchedule)}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveAsPDF={handleSaveAsPDF}
        onSaveAsImage={handleSaveAsImage}
        onExportToCalendar={onExportToCalendar}
        onShareLink={handleShareLink}
      />
    </div>
  )
}
