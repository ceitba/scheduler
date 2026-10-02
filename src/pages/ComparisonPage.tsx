import { useEffect, useMemo, useState } from 'react'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { getSavedSchedule, type SavedSchedule } from '../api/schedules'
import { type Subject } from '../hooks/useSubjects'
import { usePlanCatalogs } from '../hooks/usePlanCatalogs'
import { ScheduleSlot } from '../types/scheduler'
import ScheduleGrid from '../components/ScheduleGrid'
import ScheduleGridSkeleton from '../components/ScheduleGridSkeleton'
import LoadingDots from '../components/LoadingDots'
import ErrorView from '../components/ErrorView'
import SimpleHeader from '../components/SimpleHeader'

interface SavedSchedulePayload {
  version?: number
  selectedCourses?: { subject_id: string; selectedCommissions: string[] }[]
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
  const { t } = useTranslation()
  const { profile, loading: authLoading } = useAuth()
  const [params] = useSearchParams()
  const ids = useMemo(() => {
    const raw = params.get('ids') ?? ''
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }, [params])

  // Result of the last fetch, tagged with the ids it was for: anything
  // else (ids changed, still in flight) counts as loading.
  const [fetched, setFetched] = useState<{ key: string; items: SavedSchedule[]; error: string | null } | null>(null)

  useEffect(() => {
    if (!profile || ids.length === 0) return
    const key = ids.join(',')
    // A response for ids the user already navigated away from must not
    // overwrite the current comparison.
    let ignore = false
    // Show whichever saved schedules loaded; report the rest.
    Promise.allSettled(ids.map((id) => getSavedSchedule(id))).then((results) => {
      if (ignore) return
      const ok = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
      const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
      setFetched({ key, items: ok, error: failed ? (failed.reason as Error).message : null })
    })
    return () => { ignore = true }
  }, [profile, ids])

  const current = fetched?.key === ids.join(',') ? fetched : null
  const items = useMemo(() => current?.items ?? [], [current])
  const loading = ids.length > 0 && current === null
  const plans = useMemo(() => items.map((i) => i.plan).filter((p): p is string => !!p), [items])
  const { subjectsByPlan, failedPlans } = usePlanCatalogs(plans)
  const errors = [
    current?.error,
    failedPlans.length > 0 ? t('share.catalogLoadFailed', { plans: failedPlans.join(', ') }) : null,
  ].filter((e): e is string => !!e)

  if (authLoading) return null
  if (!profile) return <Navigate to="/" replace />

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#18181b]">
      <SimpleHeader />

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

        {errors.map((error) => (
          <p key={error} className="mb-4 px-3 py-2 rounded-sm bg-red-50 text-red-700 font-body text-body-sm border border-red-200">{error}</p>
        ))}

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
              const subjectsLoaded = !s.plan || subjectsByPlan.has(s.plan)
              const planSubjects = (s.plan && subjectsByPlan.get(s.plan)) || []
              const subjectsByCode = new Map(planSubjects.map((sub) => [sub.subject_id, sub]))
              const slots = subjectsLoaded ? slotsFromSaved(s, subjectsByCode) : []
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
                  {subjectsLoaded ? (
                    <ScheduleGrid
                      slots={slots}
                      blockedTimes={(s.payload as SavedSchedulePayload).blockedTimes ?? []}
                    />
                  ) : (
                    <ScheduleGridSkeleton />
                  )}
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
