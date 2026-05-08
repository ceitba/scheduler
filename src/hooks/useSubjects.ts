import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import config from '../config'
import { denormalizePlanId } from '../utils/planUtils'

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
  course_start: Date
  course_end: Date
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
  const url = `${config.api.baseUrl}${config.api.endpoints.subjects}?plan=${encodeURIComponent(plan)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    mode: 'cors',
    credentials: 'omit',
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch subjects: ${response.status} ${errorText}`)
  }
  const data: SubjectsResponse = await response.json()
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

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { career } = useParams()
  const [searchParams] = useSearchParams()
  const normalizedPlan = searchParams.get('plan')
  const plan = normalizedPlan ? denormalizePlanId(normalizedPlan) : null

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true)
        const url = `${config.api.baseUrl}${config.api.endpoints.subjects}?plan=${plan}`
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          mode: 'cors',
          credentials: 'omit',
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to fetch subjects: ${response.status} ${errorText}`)
        }

        const data: SubjectsResponse = await response.json()

        const isValidSchedule = (schedule: Schedule) =>
          schedule.day && schedule.time_from && schedule.time_to

        const seen = new Set<string>()
        const flattenedSubjects: Subject[] = []

        Object.entries(data).forEach(([, yearData]) => {
          Object.entries(yearData).forEach(([year, semesterData]) => {
            Object.entries(semesterData).forEach(([semester, subjs]) => {
              subjs.forEach(subject => {
                if (seen.has(subject.subject_id)) return
                seen.add(subject.subject_id)

                const seenCommissions = new Set<string>()
                const uniqueCommissions = (subject.commissions ?? [])
                  .filter(c => {
                    if (seenCommissions.has(c.name)) return false
                    seenCommissions.add(c.name)
                    return true
                  })
                  .map(commission => ({
                    ...commission,
                    schedule: Array.isArray(commission.schedule)
                      ? commission.schedule.filter(isValidSchedule)
                      : [],
                  }))

                flattenedSubjects.push({
                  ...subject,
                  year: parseInt(year),
                  semester: parseInt(semester),
                  commissions: uniqueCommissions,
                })
              })
            })
          })
        })

        setSubjects(flattenedSubjects)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching subjects')
      } finally {
        setLoading(false)
      }
    }

    if (career && plan) fetchSubjects()
  }, [career, plan])

  return { subjects, loading, error }
}
