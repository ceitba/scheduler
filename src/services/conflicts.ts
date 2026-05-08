import { Subject } from "../hooks/useSubjects"
import { Commission, CommissionSchedule, ScheduleSlot } from "../types/scheduler"

export type ConflictLevel = "none" | "clear" | "partial" | "all"

export interface ConflictPair {
  subjectIdA: string
  subjectNameA: string
  commissionA: string
  subjectIdB: string
  subjectNameB: string
  commissionB: string
  day: string
  fromMinute: number
  toMinute: number
}

export interface SubjectConflictStatus {
  level: ConflictLevel
  conflictsWith: { subjectId: string; subjectName: string; level: "partial" | "all" }[]
}

export interface ConflictReport {
  perSubject: Record<string, SubjectConflictStatus>
  pairs: ConflictPair[]
  totalConflicts: number
}

interface CourseInput extends Subject {
  selectedCommissions: string[]
}

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + (m || 0)
}

const overlapMinutes = (
  a: { day: string; from: number; to: number },
  b: { day: string; from: number; to: number },
): number => {
  if (a.day !== b.day) return 0
  const start = Math.max(a.from, b.from)
  const end = Math.min(a.to, b.to)
  return Math.max(0, end - start)
}

const intervalsForCommission = (c: Commission) =>
  (c.schedule ?? []).map((s: CommissionSchedule) => ({
    day: s.day,
    from: timeToMinutes(s.time_from),
    to: timeToMinutes(s.time_to),
  }))

const includesAny = (selected: string[]) =>
  !selected.length || selected.includes("any")

const candidateCommissions = (course: CourseInput): Commission[] => {
  const valid = course.commissions.filter((c) => c.schedule?.length)
  if (includesAny(course.selectedCommissions)) return valid
  const picked = valid.filter((c) => course.selectedCommissions.includes(c.name))
  return picked.length ? picked : valid
}

const commissionsOverlap = (a: Commission, b: Commission): { day: string; from: number; to: number } | null => {
  const intervalsA = intervalsForCommission(a)
  const intervalsB = intervalsForCommission(b)
  for (const ia of intervalsA) {
    for (const ib of intervalsB) {
      if (overlapMinutes(ia, ib) > 0) {
        const start = Math.max(ia.from, ib.from)
        const end = Math.min(ia.to, ib.to)
        return { day: ia.day, from: start, to: end }
      }
    }
  }
  return null
}

export const detectConflicts = (courses: CourseInput[]): ConflictReport => {
  const perSubject: Record<string, SubjectConflictStatus> = {}
  const pairs: ConflictPair[] = []

  courses.forEach((c) => {
    perSubject[c.subject_id] = { level: "clear", conflictsWith: [] }
  })

  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const a = courses[i]
      const b = courses[j]
      const candidatesA = candidateCommissions(a)
      const candidatesB = candidateCommissions(b)
      if (!candidatesA.length || !candidatesB.length) continue

      let conflictingPairs = 0
      const totalPairs = candidatesA.length * candidatesB.length

      for (const ca of candidatesA) {
        for (const cb of candidatesB) {
          const overlap = commissionsOverlap(ca, cb)
          if (overlap) {
            conflictingPairs++
            pairs.push({
              subjectIdA: a.subject_id,
              subjectNameA: a.name,
              commissionA: ca.name,
              subjectIdB: b.subject_id,
              subjectNameB: b.name,
              commissionB: cb.name,
              day: overlap.day,
              fromMinute: overlap.from,
              toMinute: overlap.to,
            })
          }
        }
      }

      if (conflictingPairs === 0) continue

      const level: "partial" | "all" = conflictingPairs === totalPairs ? "all" : "partial"
      perSubject[a.subject_id].conflictsWith.push({ subjectId: b.subject_id, subjectName: b.name, level })
      perSubject[b.subject_id].conflictsWith.push({ subjectId: a.subject_id, subjectName: a.name, level })
    }
  }

  Object.values(perSubject).forEach((status) => {
    if (status.conflictsWith.some((c) => c.level === "all")) status.level = "all"
    else if (status.conflictsWith.length) status.level = "partial"
  })

  if (courses.length === 0) return { perSubject, pairs, totalConflicts: 0 }
  return { perSubject, pairs, totalConflicts: pairs.length }
}

export const formatMinute = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

export const liveSlotsFromCourses = (courses: CourseInput[]): ScheduleSlot[] => {
  const slots: ScheduleSlot[] = []
  for (const course of courses) {
    for (const commission of candidateCommissions(course)) {
      for (const s of commission.schedule ?? []) {
        slots.push({
          day: s.day,
          dateFrom: course.course_start,
          dateTo: course.course_end,
          timeFrom: s.time_from,
          timeTo: s.time_to,
          subject: course.name,
          subject_id: course.subject_id,
          commission: commission.name,
          building: s.building,
          classroom: s.classroom,
        })
      }
    }
  }
  return slots
}
