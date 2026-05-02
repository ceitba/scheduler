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

        const flattenedSubjects: Subject[] = []
        Object.entries(data).forEach(([, yearData]) => {
          Object.entries(yearData).forEach(([year, semesterData]) => {
            Object.entries(semesterData).forEach(([semester, subjs]) => {
              subjs.forEach(subject => {
                flattenedSubjects.push({
                  ...subject,
                  year: parseInt(year),
                  semester: parseInt(semester),
                  commissions: subject.commissions?.map(commission => ({
                    ...commission,
                    schedule: Array.isArray(commission.schedule)
                      ? commission.schedule.filter(isValidSchedule)
                      : [],
                  })) || [],
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
