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

// Loads the subject catalog for one plan. Call it once per page and pass
// the result down: every call fires its own request.
export function useSubjects(plan: string | null) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!plan) return
    // Responses for a plan the user already navigated away from must not
    // overwrite the current plan's catalog.
    let ignore = false
    setLoading(true)
    setError(null)
    setSubjects([])
    fetchSubjectsByPlan(plan)
      .then((result) => { if (!ignore) setSubjects(result) })
      .catch((err) => {
        if (ignore) return
        setError(err instanceof Error ? err.message : 'An error occurred while fetching subjects')
      })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [plan])

  return { subjects, loading, error }
}
