import { useSearchParams, useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TabView from '../components/TabView'
import CourseView from '../components/CourseView'
import { SettingsView } from '../components/SettingsView'
import { SchedulerPreview } from '../components/SchedulerPreview'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CommissionSelectionModal from '../components/CommissionSelectionModal'
import SaveScheduleDialog from '../components/SaveScheduleDialog'
import { Subject, useSubjects } from '../hooks/useSubjects'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect, useRef } from 'react'
import { normalizePlanId, denormalizePlanId } from '../utils/planUtils'
import { Scheduler } from '../services/scheduler'
import { PossibleSchedule, SchedulerOptions, TimeBlock } from '../types/scheduler'
import { AVAILABLE_PLANS } from '../types/careers'
import { createSavedSchedule, listSavedSchedules, MAX_SAVED_SCHEDULES, type SavedSchedule } from '../api/schedules'

interface SelectedCourse extends Subject {
  selectedCommissions: string[]
  isPriority: boolean
}

interface CalendarEvent {
  url: string
  title: string
  commission?: string
}

interface GroupedEvent {
  title: string
  day: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  location?: string
  commission?: string
}

const VALID_CAREERS = Object.keys(AVAILABLE_PLANS)

// Payload shape we round-trip through the saved_schedules.payload JSONB
// column. Bump `version` if the shape ever changes; restore() should refuse
// unknown versions instead of silently mis-restoring.
interface SavedSchedulePayload {
  version: 1
  selectedCourses: { subject_id: string; selectedCommissions: string[]; isPriority: boolean }[]
  options: SchedulerOptions
  blockedTimes: TimeBlock[]
}

export default function CareerPage() {
  const { t } = useTranslation()
  const { career } = useParams<{ career: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const { subjects } = useSubjects()
  const normalizedPlan = searchParams.get('plan')
  const preselectedSubjectsIds = useRef(searchParams.getAll('code'))
  const plan = normalizedPlan ? denormalizePlanId(normalizedPlan) : null

  // ALL useState / useRef declarations come first, so the useEffect dep
  // arrays that follow can reference them without hitting TDZ during render.
  // (Hooks must be called in the same order each render; arranging them
  // declarations-first → effects-second satisfies both rules cleanly.)
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Subject | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([])
  const [schedules, setSchedules] = useState<PossibleSchedule[]>([])
  const [isCalendarPanelOpen, setIsCalendarPanelOpen] = useState(false)
  const [remainingCalendarUrls, setRemainingCalendarUrls] = useState<CalendarEvent[]>([])
  const [currentSchedule, setCurrentSchedule] = useState<PossibleSchedule | null>(null)
  const [scheduleEvents, setScheduleEvents] = useState<GroupedEvent[]>([])
  const calendarPanelRef = useRef<HTMLDivElement>(null)
  const restoredId = useRef<string | null>(null)
  const scheduler = Scheduler.getInstance()

  useEffect(() => {
    if (!profile) { setSavedCount(0); return }
    listSavedSchedules().then((l) => setSavedCount(l.length)).catch(() => { /* ignore */ })
  }, [profile])

  // Auto-dismiss the save toast a few seconds after it appears.
  useEffect(() => {
    if (!saveSuccess) return
    const t = setTimeout(() => setSaveSuccess(null), 4500)
    return () => clearTimeout(t)
  }, [saveSuccess])

  // Sync currentSchedule to the first generated schedule.
  useEffect(() => {
    if (schedules.length > 0) setCurrentSchedule(schedules[0])
    else setCurrentSchedule(null)
  }, [schedules])

  // Outside-click closes the calendar export panel.
  useEffect(() => {
    if (!isCalendarPanelOpen) return
    const handleClick = (e: MouseEvent) => {
      if (calendarPanelRef.current && !calendarPanelRef.current.contains(e.target as Node)) {
        setIsCalendarPanelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isCalendarPanelOpen])

  useEffect(() => {
    scheduler.setSubjects(selectedCourses)
  }, [selectedCourses, scheduler])

  useEffect(() => {
    setSchedules(scheduler.getSchedules())
  }, [scheduler])

  // Add preselected subjects from ?code= URL params (existing flow).
  useEffect(() => {
    if (preselectedSubjectsIds.current.length && subjects.length) {
      const preselected = subjects.filter(s => preselectedSubjectsIds.current.includes(s.subject_id))
      setSelectedCourses(prev => [
        ...prev,
        ...preselected.map(s => ({ ...s, selectedCommissions: s.commissions.map(c => c.name), isPriority: false })),
      ])
    }
  }, [subjects])

  // Restore from a saved schedule once the subject catalog is loaded.
  // Effect guards: same id never re-applies; missing subjects pause until
  // they arrive; unknown payload versions skip silently. After applying we
  // wipe location.state so a refresh / back-forward doesn't re-restore an
  // already-merged snapshot.
  useEffect(() => {
    if (!subjects.length) return
    const navState = location.state as { savedSchedule?: SavedSchedule } | null
    const saved = navState?.savedSchedule
    if (!saved) return
    if (restoredId.current === saved.id) return
    const payload = saved.payload as unknown as Partial<SavedSchedulePayload>
    if (payload?.version !== 1) { restoredId.current = saved.id; return }
    const byId = new Map(subjects.map((s) => [s.subject_id, s]))
    const restoredCourses: SelectedCourse[] = (payload.selectedCourses ?? [])
      .map((sc) => {
        const subject = byId.get(sc.subject_id)
        if (!subject) return null
        return { ...subject, selectedCommissions: sc.selectedCommissions, isPriority: sc.isPriority }
      })
      .filter((x): x is SelectedCourse => x !== null)
    setSelectedCourses(restoredCourses)
    scheduler.setSubjects(restoredCourses)
    if (payload.options) scheduler.setOptions(payload.options)
    if (payload.blockedTimes) scheduler.setBlockedTimes(payload.blockedTimes)
    restoredId.current = saved.id
    navigate(location.pathname + location.search, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, location.state])

  // Redirect logic — kept AFTER all hooks so hook order is stable.
  if (!career || !VALID_CAREERS.includes(career)) {
    return <Navigate to="/" replace />
  }

  const validPlans = AVAILABLE_PLANS[career as keyof typeof AVAILABLE_PLANS].map(p => normalizePlanId(p.id))

  if (!normalizedPlan || !validPlans.includes(normalizedPlan)) {
    const defaultPlan = normalizePlanId(AVAILABLE_PLANS[career as keyof typeof AVAILABLE_PLANS][0].id)
    return <Navigate to={`/${career}?plan=${defaultPlan}`} replace />
  }

  const handleCommissionSelect = (commissions: string[]) => {
    if (selectedCourseForModal) {
      const updated = [...selectedCourses, { ...selectedCourseForModal, selectedCommissions: commissions, isPriority: false }]
      setSelectedCourses(updated)
      scheduler.setSubjects(updated)
      setSelectedCourseForModal(null)
      setModalOpen(false)
    }
  }

  const handleReorderCourses = (reordered: SelectedCourse[]) => {
    setSelectedCourses(reordered)
    scheduler.setSubjects(reordered)
  }

  const handleGenerateSchedules = () => {
    console.log("Generating schedules with the following configuration:")
    console.log("Selected Courses:", selectedCourses.map(course => ({ name: course.name, selectedCommissions: course.selectedCommissions })))
    console.log("Scheduler Options:", scheduler.getOptions())
    console.log("Blocked Times:", scheduler.getBlockedTimes())

    const generated = scheduler.generateSchedules()
    console.log("Generated Schedules:", generated)
    setSchedules(generated)
  }

  async function handleSave(name: string) {
    setSaveBusy(true); setSaveError(null)
    try {
      const payload: SavedSchedulePayload = {
        version: 1,
        selectedCourses: selectedCourses.map((c) => ({
          subject_id: c.subject_id,
          selectedCommissions: c.selectedCommissions,
          isPriority: c.isPriority,
        })),
        options: scheduler.getOptions(),
        blockedTimes: scheduler.getBlockedTimes(),
      }
      const saved = await createSavedSchedule({
        name,
        careerId: career ?? null,
        plan: plan ?? null,
        payload: payload as unknown as Record<string, unknown>,
      })
      setSavedCount((c) => c + 1)
      setSaveOpen(false)
      setSaveSuccess(saved.name)
    } catch (e) {
      setSaveError((e as Error).message)
    } finally {
      setSaveBusy(false)
    }
  }

  const generateIcsContent = (events: GroupedEvent[]) => {
    let ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Combinador de Horarios//EN', 'CALSCALE:GREGORIAN']
    events.forEach(event => {
      const eventDate = getNextDayDate(event.day, event.startDate)
      const startTime = timeStringToDate(event.startTime, eventDate)
      const endTime = timeStringToDate(event.endTime, eventDate)
      const diff = new Date(event.endDate).getTime() - new Date(event.startDate).getTime()
      const repetitions = Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
      const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      ics = ics.concat([
        'BEGIN:VEVENT',
        `SUMMARY:${event.title}`,
        `DTSTART:${fmt(startTime)}`,
        `DTEND:${fmt(endTime)}`,
        `RRULE:FREQ=WEEKLY;COUNT=${repetitions + 1}`,
        `LOCATION:${event.location}`,
        'END:VEVENT'
      ])
    })
    ics.push('END:VCALENDAR')
    return ics.join('\r\n')
  }

  const getNextDayDate = (dayName: string, startDate: Date | null = null): Date => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const firstDay = new Date(startDate ?? new Date())
    const dayIndex = days.indexOf(dayName.toLowerCase())
    let daysUntil = dayIndex - firstDay.getDay()
    console.log("Days until target: ", daysUntil)
    if (daysUntil <= 0) daysUntil += 7
    firstDay.setDate(firstDay.getDate() + daysUntil)
    return firstDay
  }

  const timeStringToDate = (timeStr: string, baseDate: Date): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const d = new Date(baseDate)
    d.setHours(hours, minutes, 0, 0)
    return d
  }

  const handleExportToCalendar = () => {
    if (!currentSchedule) return
    setIsCalendarPanelOpen(true)
    const grouped = currentSchedule.slots.reduce<Record<string, GroupedEvent>>((acc, slot) => {
      const key = `${slot.subject_id}-${slot.day}-${slot.timeFrom}-${slot.timeTo}`
      if (!acc[key]) {
        acc[key] = {
          title: `${slot.subject_id} - ${slot.subject}`,
          day: slot.day.toLowerCase(),
          startDate: slot.dateFrom,
          endDate: slot.dateTo,
          startTime: slot.timeFrom,
          endTime: slot.timeTo,
          location: slot.classroom || '',
          commission: slot.commission,
        }
      } else if (slot.classroom && !acc[key].location?.includes(slot.classroom)) {
        acc[key].location = `${acc[key].location}, ${slot.classroom}`
      }
      return acc
    }, {})
    const events = Object.values(grouped)
    setScheduleEvents(events)
    setRemainingCalendarUrls(events.map(e => ({ url: createGoogleCalendarUrl(e), title: e.title, commission: e.commission })))
  }

  const createGoogleCalendarUrl = (event: GroupedEvent): string => {
    const eventDate = getNextDayDate(event.day, event.startDate)
    const startTime = timeStringToDate(event.startTime, eventDate)
    const endTime = timeStringToDate(event.endTime, eventDate)
    const diff = new Date(event.endDate).getTime() - new Date(event.startDate).getTime()
    const repetitions = Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${fmt(startTime)}/${fmt(endTime)}`,
      recur: `RRULE:FREQ=WEEKLY;COUNT=${repetitions + 1}`,
      location: event.location || ''
    })
    return `https://calendar.google.com/calendar/render?${params}`
  }

  // Suppress unused variable warning for navigate
  void navigate

  const tabs = [
    {
      label: t('career.tabs.courses'),
      content: (
        <CourseView
          selectedCourses={selectedCourses}
          onCommissionSelect={course => {
            if (!modalOpen) { setSelectedCourseForModal(course); setModalOpen(true) }
          }}
          onAddCourse={(course, commissions) => {
            const updated = [...selectedCourses, { ...course, selectedCommissions: commissions, isPriority: false }]
            setSelectedCourses(updated); scheduler.setSubjects(updated); setSchedules([])
          }}
          onRemoveCourse={courseId => {
            const updated = selectedCourses.filter(c => c.subject_id !== courseId)
            setSelectedCourses(updated); scheduler.setSubjects(updated); setSchedules([])
          }}
          onReorderCourses={handleReorderCourses}
        />
      ),
    },
    { label: t('career.tabs.settings'), content: <SettingsView /> },
    {
      label: t('career.tabs.calendar'),
      content: (
        <SchedulerPreview
          schedules={schedules}
          setSchedules={setSchedules}
          hasSubjects={selectedCourses.length > 0}
          onExportToCalendar={handleExportToCalendar}
        />
      ),
      onClick: handleGenerateSchedules,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#18181b]">
      <Navbar currentPlan={plan || ''} />

      <main id="main-content" className="flex-1">
        <div className="container-content py-6">
          {profile && (
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => { setSaveError(null); setSaveOpen(true) }}
                disabled={selectedCourses.length === 0}
                className="px-3 py-1.5 rounded-sm border border-primary text-primary font-mono text-label uppercase tracking-widest hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary"
                aria-label={t('saved.dialogTitle')}
              >
                {t('saved.saveSchedule')}
              </button>
            </div>
          )}
          <TabView tabs={tabs} />
        </div>
      </main>

      {saveOpen && (
        <SaveScheduleDialog
          open={saveOpen}
          count={savedCount}
          max={MAX_SAVED_SCHEDULES}
          busy={saveBusy}
          error={saveError}
          onSave={handleSave}
          onClose={() => setSaveOpen(false)}
        />
      )}

      {saveSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-[#27272a] border border-border dark:border-[#3f3f46] rounded-card shadow-card-hover p-4 flex items-center gap-3 animate-slide-up"
        >
          <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-body-sm font-semibold text-ink-primary dark:text-[#f4f4f5] truncate">
              {t('saved.toastSavedTitle', { name: saveSuccess })}
            </p>
            <button
              type="button"
              onClick={() => { setSaveSuccess(null); navigate('/saved') }}
              className="font-mono text-label uppercase tracking-widest text-primary hover:underline mt-0.5"
            >
              {t('saved.toastViewLink')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(null)}
            aria-label={t('saved.toastDismiss')}
            className="text-ink-secondary dark:text-[#a1a1aa] hover:text-ink-primary"
          >
            ×
          </button>
        </div>
      )}

      <Footer />

      {modalOpen && selectedCourseForModal && (
        <CommissionSelectionModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedCourseForModal(null) }}
          subject={selectedCourseForModal}
          onAddCommissions={handleCommissionSelect}
        />
      )}

      {isCalendarPanelOpen && (
        <>
          <div className="fixed inset-0 bg-ink-primary/25 dark:bg-black/50 backdrop-blur-sm z-[100]" />
          <div
            ref={calendarPanelRef}
            className="fixed inset-y-0 right-0 w-full sm:w-[28rem] bg-white dark:bg-[#27272a] border-l border-border dark:border-[#3f3f46] overflow-y-auto z-[101] shadow-card-hover animate-slide-in"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-display text-h4 font-bold text-ink-primary dark:text-[#f4f4f5]">{t('calendar.title')}</h3>
                <button
                  onClick={() => setIsCalendarPanelOpen(false)}
                  className="p-2 hover:bg-surface dark:hover:bg-[#18181b] rounded-sm transition-colors duration-150"
                  aria-label="Cerrar panel"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="mb-5 p-4 rounded-card border border-border dark:border-[#3f3f46] bg-surface dark:bg-[#18181b]">
                <h4 className="font-body font-semibold text-body text-ink-primary dark:text-[#f4f4f5] mb-2">{t('calendar.option1Title')}</h4>
                <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] mb-4">
                  {t('calendar.option1Description')}
                </p>
                <ol className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] space-y-1.5 mb-4">
                  <li>1. {t('calendar.option1Step1')}</li>
                  <li>2. {t('calendar.option1Step2')}: <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Calendar</a></li>
                  <li>3. {t('calendar.option1Step3')}</li>
                  <li>4. {t('calendar.option1Step4')}</li>
                </ol>
                <button
                  onClick={() => {
                    const blob = new Blob([generateIcsContent(scheduleEvents)], { type: 'text/calendar' })
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = 'horario.ics'
                    link.click()
                  }}
                  className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 bg-primary text-surface font-body font-semibold rounded-sm hover:bg-primary-600 transition-colors duration-150"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  <span>{t('calendar.downloadFile')}</span>
                </button>
              </div>

              <div className="p-4 rounded-card border border-border dark:border-[#3f3f46] bg-surface dark:bg-[#18181b]">
                <h4 className="font-body font-semibold text-body text-ink-primary dark:text-[#f4f4f5] mb-3">{t('calendar.option2Title')}</h4>
                <div className="space-y-2">
                  {remainingCalendarUrls.map((event, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        window.open(event.url, '_blank')
                        setRemainingCalendarUrls(prev => prev.filter((_, idx) => idx !== i))
                      }}
                      className="w-full flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-card border border-border dark:border-[#3f3f46] bg-white dark:bg-[#27272a] hover:bg-primary-50 dark:hover:bg-primary-900 hover:border-primary text-left transition-colors duration-150 group"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary flex-shrink-0" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="font-body text-body-sm text-ink-primary dark:text-[#f4f4f5] line-clamp-1">
                        {event.title}{event.commission && ` · ${t('calendar.commission')} ${event.commission}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
