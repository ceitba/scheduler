import { useEffect, useState } from 'react'
import { apiGet } from '../api/client'

interface Schedule {
  day: string
  classroom: string
  building: string
  time_from: string
  time_to: string
}

interface Commission {
  name: string
  schedule: Schedule[]
}

export interface Subject {
  subject_id: string
  name: string
  credits: number
  dependencies: string[]
  credits_required: number | null
  commissions: Commission[]
  // "YYYY-MM-DD" calendar dates as sent by the API (no time zone).
  course_start: string
  course_end: string
  section: string
  year?: number
  semester?: number
}

interface SubjectsResponse {
  [category: string]: {
    [year: string]: {
      [semester: string]: Subject[]
    }
  }
}

// Standalone fetch+flatten so callers without a route context (the
// comparison view and the share viewer both load multiple plans at once)
// can reuse the logic.
export async function fetchSubjectsByPlan(plan: string): Promise<Subject[]> {
  const data = await apiGet<SubjectsResponse>(`/subjects?plan=${encodeURIComponent(plan)}`)
  const isValidSchedule = (schedule: Schedule) =>
    schedule.day && schedule.time_from && schedule.time_to
  const seen = new Set<string>()
  const flattened: Subject[] = []
  Object.entries(data).forEach(([, yearData]) => {
    Object.entries(yearData).forEach(([year, semesterData]) => {
      Object.entries(semesterData).forEach(([semester, subjs]) => {
        subjs.forEach((subject) => {
          if (seen.has(subject.subject_id)) return
          seen.add(subject.subject_id)
          const seenCommissions = new Set<string>()
          const uniqueCommissions = (subject.commissions ?? [])
            .filter((c) => {
              if (seenCommissions.has(c.name)) return false
              seenCommissions.add(c.name)
              return true
            })
            .map((commission) => ({
              ...commission,
              schedule: Array.isArray(commission.schedule)
                ? commission.schedule.filter(isValidSchedule)
                : [],
            }))
          flattened.push({
            ...subject,
            year: parseInt(year),
            semester: parseInt(semester),
            commissions: uniqueCommissions,
          })
        })
      })
    })
  })
  return flattened
}

// Subject catalogs for several plans at once. Failed plans map to an empty
// list (their participants just show no classes) and are reported.
export async function loadCatalogs(plans: string[]): Promise<{ loaded: [string, Subject[]][]; failed: string[] }> {
  const results = await Promise.allSettled(plans.map((p) => fetchSubjectsByPlan(p)))
  const loaded: [string, Subject[]][] = []
  const failed: string[] = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') loaded.push([plans[i], r.value])
    else { loaded.push([plans[i], []]); failed.push(plans[i]) }
  })
  return { loaded, failed }
}

// Shared empty catalog so callers' effects keyed on `subjects` don't rerun
// on every render while loading.
const NO_SUBJECTS: Subject[] = []

// Loads the subject catalog for one plan. Call it once per page and pass
// the result down: every call fires its own request.
export function useSubjects(plan: string | null) {
  // Outcome of the last request, tagged with its plan: until the current
  // plan's request settles we report loading and an empty catalog, so a
  // previous plan's subjects are never shown for the new one.
  const [state, setState] = useState<{ plan: string; subjects: Subject[]; error: string | null } | null>(null)

  useEffect(() => {
    if (!plan) return
    // Responses for a plan the user already navigated away from must not
    // overwrite the current plan's catalog.
    let ignore = false
    fetchSubjectsByPlan(plan)
      .then((subjects) => { if (!ignore) setState({ plan, subjects, error: null }) })
      .catch((err) => {
        if (ignore) return
        const error = err instanceof Error ? err.message : 'An error occurred while fetching subjects'
        setState({ plan, subjects: [], error })
      })
    return () => { ignore = true }
  }, [plan])

  const current = state && state.plan === plan ? state : null
  return { subjects: current?.subjects ?? NO_SUBJECTS, loading: current === null, error: current?.error ?? null }
}
