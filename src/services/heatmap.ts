import type { ShareParticipant } from '../api/share'
import type { Subject } from '../hooks/useSubjects'

// One half-hour bucket within a single day. We pre-compute a flat list of
// buckets so the heatmap can render with a single .map().
export interface HeatmapBucket {
  day: string
  fromMinute: number
  toMinute: number
  busyParticipants: { userId: string; displayName: string; sources: string[] }[]
}

export interface HeatmapModel {
  participantCount: number
  // Days × 28 half-hour rows. Indexed first by day, then by bucketIndex.
  byDay: Record<string, HeatmapBucket[]>
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const GRID_START_MIN = 8 * 60
const GRID_END_MIN = 22 * 60
const BUCKET_MIN = 30

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

interface BusyInterval {
  day: string
  from: number
  to: number
  source: string
}

interface SavedSchedulePayload {
  version?: number
  selectedCourses?: { subject_id: string; selectedCommissions: string[]; isPriority?: boolean }[]
  blockedTimes?: { day: string; from: string; to: string; label?: string }[]
}

// A participant's busy time = (each subject where they pinned exactly one
// commission → that commission's slots) ∪ (their blockedTimes). Subjects
// with multiple commissions still selected are NOT counted because the
// participant hasn't committed to a specific time yet.
const busyIntervalsFor = (
  payload: SavedSchedulePayload,
  subjectsByCode: Map<string, Subject>,
): BusyInterval[] => {
  const out: BusyInterval[] = []

  for (const sc of payload.selectedCourses ?? []) {
    if (sc.selectedCommissions.length !== 1) continue
    const commissionName = sc.selectedCommissions[0]
    if (commissionName === 'any') continue

    const subject = subjectsByCode.get(sc.subject_id)
    const commission = subject?.commissions.find((c) => c.name === commissionName)
    if (!commission) continue
    for (const s of commission.schedule ?? []) {
      out.push({
        day: s.day,
        from: timeToMinutes(s.time_from),
        to: timeToMinutes(s.time_to),
        source: subject?.subject_id ? `${subject.subject_id} · ${commissionName}` : commissionName,
      })
    }
  }

  for (const b of payload.blockedTimes ?? []) {
    out.push({
      day: b.day,
      from: timeToMinutes(b.from),
      to: timeToMinutes(b.to),
      source: b.label ?? 'blocked',
    })
  }

  return out
}

export const buildHeatmap = (
  participants: ShareParticipant[],
  subjectsByPlan: Map<string, Subject[]>,
): HeatmapModel => {
  // Pre-bucket participants' busy intervals.
  const intervalsByParticipant: { p: ShareParticipant; intervals: BusyInterval[] }[] = []

  for (const p of participants) {
    if (!p.payload) {
      intervalsByParticipant.push({ p, intervals: [] })
      continue
    }
    const planSubjects = (p.plan && subjectsByPlan.get(p.plan)) || []
    const subjectsByCode = new Map(planSubjects.map((s) => [s.subject_id, s]))
    intervalsByParticipant.push({
      p,
      intervals: busyIntervalsFor(p.payload as SavedSchedulePayload, subjectsByCode),
    })
  }

  const byDay: Record<string, HeatmapBucket[]> = {}
  for (const day of DAYS) {
    const buckets: HeatmapBucket[] = []
    for (let mi = GRID_START_MIN; mi < GRID_END_MIN; mi += BUCKET_MIN) {
      const fromMinute = mi
      const toMinute = mi + BUCKET_MIN
      const busy: HeatmapBucket['busyParticipants'] = []
      for (const { p, intervals } of intervalsByParticipant) {
        const sources = intervals
          .filter((iv) => iv.day === day && iv.from < toMinute && iv.to > fromMinute)
          .map((iv) => iv.source)
        if (sources.length) {
          busy.push({ userId: p.userId, displayName: p.displayName, sources })
        }
      }
      buckets.push({ day, fromMinute, toMinute, busyParticipants: busy })
    }
    byDay[day] = buckets
  }

  return { participantCount: participants.length, byDay }
}

export { DAYS, GRID_START_MIN, GRID_END_MIN, BUCKET_MIN }
