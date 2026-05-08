import type { ShareParticipant } from '../api/share'
import type { Subject } from '../hooks/useSubjects'

// One concrete time block contributed by a participant. The viewer renders
// these directly (no bucketing) so overlaps can be visualized via horizontal
// subdivision the same way ScheduleGrid handles overlapping commissions.
export interface ParticipantBlock {
  blockId: string
  userId: string
  displayName: string
  isCreator: boolean
  source: string
  day: string
  fromMinute: number
  toMinute: number
  // userIds of every participant whose busy time intersects [fromMinute,
  // toMinute] (inclusive of this block's own owner). Drives the X/Z badge.
  overlapUserIds: string[]
}

export interface HeatmapModel {
  participantCount: number
  byDay: Record<string, ParticipantBlock[]>
}

export const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
export const GRID_START_MIN = 8 * 60
export const GRID_END_MIN = 22 * 60

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

// Every concrete commission the participant has selected counts as a busy
// time. Earlier we only counted subjects with exactly one pick, which
// silently dropped courses for anyone who saved with "Add all" or kept
// multiple options open. Now if the saved selection is 'any' or empty
// (i.e. fully unconstrained), we fall back to every valid commission of
// the subject — the share viewer is meant to surface "potentially busy",
// not "definitely committed".
const busyIntervalsFor = (
  payload: SavedSchedulePayload,
  subjectsByCode: Map<string, Subject>,
): BusyInterval[] => {
  const out: BusyInterval[] = []

  for (const sc of payload.selectedCourses ?? []) {
    const subject = subjectsByCode.get(sc.subject_id)
    if (!subject) continue

    const picks = (sc.selectedCommissions ?? []).filter((n) => n !== 'any')
    const commissions =
      picks.length > 0
        ? subject.commissions.filter((c) => picks.includes(c.name))
        : subject.commissions

    for (const commission of commissions) {
      for (const s of commission.schedule ?? []) {
        out.push({
          day: s.day,
          from: timeToMinutes(s.time_from),
          to: timeToMinutes(s.time_to),
          source: `${subject.subject_id} · ${commission.name}`,
        })
      }
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

  const byDay: Record<string, ParticipantBlock[]> = {}
  for (const day of DAYS) byDay[day] = []

  // First pass: emit a block per (participant, interval).
  for (const { p, intervals } of intervalsByParticipant) {
    for (let i = 0; i < intervals.length; i++) {
      const iv = intervals[i]
      if (!DAYS.includes(iv.day)) continue
      byDay[iv.day].push({
        blockId: `${p.userId}-${iv.day}-${iv.from}-${iv.to}-${i}`,
        userId: p.userId,
        displayName: p.displayName,
        isCreator: p.isCreator,
        source: iv.source,
        day: iv.day,
        fromMinute: iv.from,
        toMinute: iv.to,
        overlapUserIds: [],
      })
    }
  }

  // Second pass: per block, count distinct participants whose intervals
  // intersect [from, to]. Done after blocks are flat so we can answer
  // "how many participants are busy at the same time as this block?"
  // without re-walking the whole catalog.
  for (const day of DAYS) {
    for (const block of byDay[day]) {
      const set = new Set<string>()
      for (const { p, intervals } of intervalsByParticipant) {
        const hit = intervals.some(
          (iv) => iv.day === day && iv.from < block.toMinute && iv.to > block.fromMinute,
        )
        if (hit) set.add(p.userId)
      }
      block.overlapUserIds = Array.from(set)
    }
  }

  return { participantCount: participants.length, byDay }
}
