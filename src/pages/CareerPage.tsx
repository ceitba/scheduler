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
import { useState, useEffect, useMemo, useRef } from 'react'
import { detectConflicts, liveSlotsFromCourses } from '../services/conflicts'
import { normalizePlanId, denormalizePlanId } from '../utils/planUtils'
import { DEFAULT_SCHEDULER_OPTIONS, generateSchedules } from '../services/scheduler'
import { PossibleSchedule, SchedulerOptions, TimeBlock } from '../types/scheduler'
import { AVAILABLE_PLANS } from '../types/careers'
import { buildIcs, eventsFromSlots, googleCalendarUrl, type CalendarEvent } from '../utils/ics'
import { createSavedSchedule, listSavedSchedules, MAX_SAVED_SCHEDULES, type SavedSchedule } from '../api/schedules'

interface SelectedCourse extends Subject {
  selectedCommissions: string[]
}

interface CalendarLink {
  url: string
  title: string
  commission?: string
}

const VALID_CAREERS = Object.keys(AVAILABLE_PLANS)

// Payload shape we round-trip through the saved_schedules.payload JSONB
// column. Bump `version` if the shape ever changes; restore() should refuse
// unknown versions instead of silently mis-restoring. (Older payloads also
// carry an unused `isPriority` per course and `avoidBuildingChange` in
// options; both are ignored on restore.)
interface SavedSchedulePayload {
  version: 1
  selectedCourses: { subject_id: string; selectedCommissions: string[] }[]
  options: SchedulerOptions
  blockedTimes: TimeBlock[]
}

const restoreOptions = (raw: Partial<SchedulerOptions> | undefined): SchedulerOptions => ({
  allowOverlap: !!raw?.allowOverlap,
  allowUnlimitedOverlap: !!raw?.allowUnlimitedOverlap,
  allowFreeDay: !!raw?.allowFreeDay,
})

// Validates the route, then mounts the workspace keyed by career + plan so
// switching plan starts from a clean slate (no courses or schedules from
// the previous plan's catalog leak across).
export default function CareerPage() {
  const { career } = useParams<{ career: string }>()
  const [searchParams] = useSearchParams()
  const normalizedPlan = searchParams.get('plan')

  if (!career || !VALID_CAREERS.includes(career)) {
    return <Navigate to="/" replace />
  }

  const validPlans = AVAILABLE_PLANS[career as keyof typeof AVAILABLE_PLANS].map(p => normalizePlanId(p.id))

  if (!normalizedPlan || !validPlans.includes(normalizedPlan)) {
    const defaultPlan = normalizePlanId(AVAILABLE_PLANS[career as keyof typeof AVAILABLE_PLANS][0].id)
    return <Navigate to={`/${career}?plan=${defaultPlan}`} replace />
  }

  return <CareerWorkspace key={`${career}|${normalizedPlan}`} career={career} normalizedPlan={normalizedPlan} />
}

function CareerWorkspace({ career, normalizedPlan }: { career: string; normalizedPlan: string }) {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const preselectedSubjectsIds = useRef(searchParams.getAll('code'))
  const plan = denormalizePlanId(normalizedPlan)
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSubjects(plan)

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
  // Generator inputs live here (single source of truth) and flow down as
  // props, so a restored saved schedule reaches every mounted tab.
  const [options, setOptions] = useState<SchedulerOptions>(DEFAULT_SCHEDULER_OPTIONS)
  const [blockedTimes, setBlockedTimes] = useState<TimeBlock[]>([])
  const [schedules, setSchedules] = useState<PossibleSchedule[]>([])
  const [schedulesTruncated, setSchedulesTruncated] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  // Index into `schedules` of the option the preview shows; exports use it.
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCalendarPanelOpen, setIsCalendarPanelOpen] = useState(false)
  const [remainingCalendarUrls, setRemainingCalendarUrls] = useState<CalendarLink[]>([])
  const [scheduleEvents, setScheduleEvents] = useState<CalendarEvent[]>([])
  const calendarPanelRef = useRef<HTMLDivElement>(null)
  const restoredId = useRef<string | null>(null)
  const preselectApplied = useRef(false)
  const currentSchedule: PossibleSchedule | null = schedules[currentIndex] ?? null

  // Same URL shape the ?code= preselect flow reads: /<career>?plan=<plan>&code=<id>...
  // (commissions aren't part of it; preselected subjects get all commissions).
  const shareUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = ''
    url.searchParams.set('plan', normalizedPlan)
    selectedCourses.forEach((c) => url.searchParams.append('code', c.subject_id))
    return url.toString()
  }, [normalizedPlan, selectedCourses])

  const liveSlots = useMemo(() => liveSlotsFromCourses(selectedCourses), [selectedCourses])
  const liveConflictCount = useMemo(() => detectConflicts(selectedCourses).totalConflicts, [selectedCourses])

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

  // Add preselected subjects from ?code= URL params, once per mount (the
  // workspace remounts on plan change), skipping ones already selected.
  useEffect(() => {
    if (preselectApplied.current) return
    if (!preselectedSubjectsIds.current.length || !subjects.length) return
    preselectApplied.current = true
    const preselected = subjects.filter(s => preselectedSubjectsIds.current.includes(s.subject_id))
    setSelectedCourses(prev => {
      const have = new Set(prev.map(c => c.subject_id))
      return [
        ...prev,
        ...preselected
          .filter(s => !have.has(s.subject_id))
          .map(s => ({ ...s, selectedCommissions: s.commissions.map(c => c.name) })),
      ]
    })
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
        return { ...subject, selectedCommissions: sc.selectedCommissions }
      })
      .filter((x): x is SelectedCourse => x !== null)
    setSelectedCourses(restoredCourses)
    setOptions(restoreOptions(payload.options))
    setBlockedTimes((payload.blockedTimes ?? []).map((b) => ({ ...b, id: b.id ?? crypto.randomUUID() })))
    clearSchedules()
    restoredId.current = saved.id
    navigate(location.pathname + location.search, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, location.state])

  // Any change to the generator inputs invalidates the current results; the
  // next visit to the calendar tab regenerates them.
  function clearSchedules() {
    setSchedules([])
    setSchedulesTruncated(false)
    setHasGenerated(false)
    setCurrentIndex(0)
  }

  function runGenerator(nextOptions: SchedulerOptions = options) {
    const result = generateSchedules(selectedCourses, nextOptions, blockedTimes)
    setSchedules(result.schedules)
    setSchedulesTruncated(result.truncated)
    setHasGenerated(true)
    setCurrentIndex(0)
  }

  const updateSelectedCourses = (updated: SelectedCourse[]) => {
    setSelectedCourses(updated)
    clearSchedules()
  }

  const handleCommissionSelect = (commissions: string[]) => {
    if (selectedCourseForModal) {
      updateSelectedCourses([...selectedCourses, { ...selectedCourseForModal, selectedCommissions: commissions }])
      setSelectedCourseForModal(null)
      setModalOpen(false)
    }
  }

  const handleOptionsChange = (next: SchedulerOptions) => {
    setOptions(next)
    runGenerator(next)
  }

  const handleBlockedTimesChange = (blocks: TimeBlock[]) => {
    setBlockedTimes(blocks)
    clearSchedules()
  }

  async function handleSave(name: string) {
    setSaveBusy(true); setSaveError(null)
    try {
      const payload: SavedSchedulePayload = {
        version: 1,
        selectedCourses: selectedCourses.map((c) => ({
          subject_id: c.subject_id,
          selectedCommissions: c.selectedCommissions,
        })),
        options,
        blockedTimes,
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

  const handleExportToCalendar = () => {
    if (!currentSchedule) return
    setIsCalendarPanelOpen(true)
    const events = eventsFromSlots(
      currentSchedule.slots,
      (slot) => `${t('calendar.commission')} ${slot.commission}`,
    )
    setScheduleEvents(events)
    setRemainingCalendarUrls(
      events.flatMap((e) => {
        const url = googleCalendarUrl(e)
        return url ? [{ url, title: e.title, commission: e.commission }] : []
      }),
    )
  }

  const tabs = [
    {
      label: t('career.tabs.courses'),
      content: (
        <CourseView
          subjects={subjects}
          loading={subjectsLoading}
          error={subjectsError}
          selectedCourses={selectedCourses}
          onCommissionSelect={course => {
            if (!modalOpen) { setSelectedCourseForModal(course); setModalOpen(true) }
          }}
          onAddCourse={(course, commissions) => {
            updateSelectedCourses([...selectedCourses, { ...course, selectedCommissions: commissions }])
          }}
          onRemoveCourse={courseId => {
            updateSelectedCourses(selectedCourses.filter(c => c.subject_id !== courseId))
          }}
          onReorderCourses={updateSelectedCourses}
        />
      ),
    },
    {
      label: t('career.tabs.settings'),
      content: <SettingsView blockedTimes={blockedTimes} onChange={handleBlockedTimesChange} />,
    },
    {
      label: t('career.tabs.calendar'),
      content: (
        <SchedulerPreview
          schedules={schedules}
          truncated={schedulesTruncated}
          generated={hasGenerated}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          options={options}
          onOptionsChange={handleOptionsChange}
          blockedTimes={blockedTimes}
          hasSubjects={selectedCourses.length > 0}
          onExportToCalendar={handleExportToCalendar}
          shareUrl={shareUrl}
          liveSlots={liveSlots}
          liveConflictCount={liveConflictCount}
        />
      ),
      onClick: () => runGenerator(),
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
                    const blob = new Blob([buildIcs(scheduleEvents)], { type: 'text/calendar;charset=utf-8' })
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = 'horario.ics'
                    link.click()
                    setTimeout(() => URL.revokeObjectURL(link.href), 0)
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
