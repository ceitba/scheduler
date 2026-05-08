import { useEffect, useMemo, useState } from 'react'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useThemeContext } from '../context/ThemeContext'
import { getSavedSchedule, type SavedSchedule } from '../api/schedules'
import { fetchSubjectsByPlan, type Subject } from '../hooks/useSubjects'
import { ScheduleSlot } from '../types/scheduler'
import ScheduleGrid from '../components/ScheduleGrid'
import LoadingDots from '../components/LoadingDots'
import ErrorView from '../components/ErrorView'
import AuthMenu from '../components/AuthMenu'

interface SavedSchedulePayload {
  version?: number
  selectedCourses?: { subject_id: string; selectedCommissions: string[]; isPriority?: boolean }[]
  blockedTimes?: { day: string; from: string; to: string; label?: string }[]
}

// For each subject in a saved plan we render the FIRST chosen commission
// (alphabetically) so the comparison is deterministic. If the saved plan
// only has 'any' or no specific pick, the first commission of the subject
// is used as a stand-in so the cell isn't empty.
const slotsFromSaved = (
  s: SavedSchedule,
  subjectsByCode: Map<string, Subject>,
): ScheduleSlot[] => {
  const payload = s.payload as SavedSchedulePayload
  const out: ScheduleSlot[] = []
  for (const sc of payload.selectedCourses ?? []) {
    const subject = subjectsByCode.get(sc.subject_id)
    if (!subject) continue
    const sortedPicks = [...(sc.selectedCommissions ?? [])].sort()
    const pickName = sortedPicks.find((n) => n !== 'any')
    const commission =
      (pickName && subject.commissions.find((c) => c.name === pickName)) ||
      subject.commissions[0]
    if (!commission) continue
    for (const slot of commission.schedule ?? []) {
      out.push({
        day: slot.day,
        dateFrom: subject.course_start,
        dateTo: subject.course_end,
        timeFrom: slot.time_from,
        timeTo: slot.time_to,
        subject: subject.name,
        subject_id: subject.subject_id,
        commission: commission.name,
        building: slot.building,
        classroom: slot.classroom,
      })
    }
  }
  return out
}

export default function ComparisonPage() {
  const { t, i18n } = useTranslation()
  const { profile, loading: authLoading } = useAuth()
  const { theme, toggle } = useThemeContext()
  const [params] = useSearchParams()
  const ids = useMemo(() => {
    const raw = params.get('ids') ?? ''
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }, [params])

  const [items, setItems] = useState<SavedSchedule[]>([])
  const [subjectsByPlan, setSubjectsByPlan] = useState<Map<string, Subject[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    if (ids.length === 0) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all(ids.map((id) => getSavedSchedule(id)))
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [profile, ids])

  useEffect(() => {
    if (items.length === 0) return
    const plans = Array.from(new Set(items.map((i) => i.plan).filter((p): p is string => !!p)))
    const missing = plans.filter((p) => !subjectsByPlan.has(p))
    if (missing.length === 0) return
    let cancelled = false
    Promise.all(missing.map((p) => fetchSubjectsByPlan(p).then((subs) => [p, subs] as const)))
      .then((pairs) => {
        if (cancelled) return
        setSubjectsByPlan((prev) => {
          const next = new Map(prev)
          pairs.forEach(([p, subs]) => next.set(p, subs))
          return next
        })
      })
      .catch((e: Error) => setError(e.message))
    return () => {
      cancelled = true
    }
  }, [items, subjectsByPlan])

  if (authLoading) return null
  if (!profile) return <Navigate to="/" replace />

  function toggleLanguage() {
    const next = i18n.language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#18181b]">
      <header className="border-b border-border dark:border-[#3f3f46] bg-surface/95 dark:bg-[#18181b]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-content h-16 flex items-center justify-between">
          <a href="/" className="flex flex-col justify-center hover:opacity-80 transition-opacity duration-150">
            <span className="font-display text-h5 font-bold text-primary tracking-tight leading-tight">CEITBA</span>
            <span className="font-mono text-label text-ink-secondary dark:text-[#a1a1aa] uppercase tracking-widest leading-tight">
              {t('nav.scheduler')}
            </span>
          </a>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} aria-label={t('nav.langToggleAria')} className="min-h-[36px] px-2 font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa] hover:text-primary">
              {t('nav.langToggleLabel')}
            </button>
            <button onClick={toggle} aria-label={theme === 'dark' ? t('nav.themeToggleLight') : t('nav.themeToggleDark')} className="min-h-[36px] w-9 flex items-center justify-center text-ink-secondary dark:text-[#a1a1aa] hover:text-primary">
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <AuthMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 container-content py-section-mobile lg:py-section">
        <header className="mb-6 flex items-baseline gap-4">
          <div className="flex-1">
            <p className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
              {t('compare.label')}
            </p>
            <h1 className="font-display font-bold text-h2 text-ink-primary dark:text-[#f4f4f5]">
              {t('compare.heading', { count: items.length })}
            </h1>
          </div>
          <Link
            to="/saved"
            className="px-3 py-1.5 rounded-sm border border-border dark:border-[#3f3f46] text-ink-primary dark:text-[#f4f4f5] font-mono text-label uppercase tracking-widest hover:border-primary hover:text-primary"
          >
            {t('compare.back')}
          </Link>
        </header>

        {error && (
          <p className="mb-4 px-3 py-2 rounded-sm bg-red-50 text-red-700 font-body text-body-sm border border-red-200">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64"><LoadingDots size="lg" /></div>
        ) : ids.length < 2 ? (
          <ErrorView message={t('compare.needAtLeastTwo')} className="h-64" />
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))` }}
          >
            {items.map((s) => {
              const planSubjects = (s.plan && subjectsByPlan.get(s.plan)) || []
              const subjectsByCode = new Map(planSubjects.map((sub) => [sub.subject_id, sub]))
              const slots = slotsFromSaved(s, subjectsByCode)
              return (
                <section
                  key={s.id}
                  className="bg-white dark:bg-[#27272a] rounded-card border border-border dark:border-[#3f3f46] p-4 flex flex-col gap-3 min-w-0"
                >
                  <header>
                    <p className="font-display font-bold text-h5 text-ink-primary dark:text-[#f4f4f5] truncate">
                      {s.name}
                    </p>
                    <p className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
                      {s.careerId ?? '—'} · {s.plan ?? '—'}
                    </p>
                  </header>
                  <ScheduleGrid slots={slots} />
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
