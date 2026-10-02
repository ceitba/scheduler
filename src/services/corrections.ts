// Pure helpers for student-suggested schedule corrections: slot validation
// (mirrors the API's rules so most mistakes never reach it), slot-set
// comparison, labels like "Mar 08:00–10:00", merging an updated correction
// into a commission, and mapping API errors to translation keys.
// No DOM, React or runtime imports, so it can be checked with plain Node.
import type {
  Commission,
  CommissionCorrection,
  CommissionSchedule,
  VoteType,
} from '../types/scheduler'

export const MAX_SLOTS = 6
export const MIN_TIME = '07:00'
export const MAX_TIME = '23:30'
export const SUGGESTION_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const
// Corrections are applied automatically from this many confirms (and more
// confirms than rejects); shown in the copy only.
export const APPLY_THRESHOLD = 3

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

// Minimal slot shape shared by catalog slots and correction slots.
export interface TimeSlot {
  day: string
  time_from: string
  time_to: string
}

// One editable row of the suggestion form. Times are "HH:mm" (what
// <input type="time"> produces); classroom/building are read-only context.
export interface DraftSlot {
  day: string
  from: string
  to: string
  classroom: string
  building: string
}

// "08:00:00" | "08:00" | "8:00" → "08:00"; anything else → "".
export function hhmm(time: string | null | undefined): string {
  const m = /^(\d{1,2}):(\d{2})/.exec((time ?? '').trim())
  if (!m) return ''
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return ''
  return `${String(h).padStart(2, '0')}:${m[2]}`
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function compareSlots(a: TimeSlot, b: TimeSlot): number {
  return (
    DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) ||
    hhmm(a.time_from).localeCompare(hhmm(b.time_from)) ||
    hhmm(a.time_to).localeCompare(hhmm(b.time_to))
  )
}

export function sortSlots<T extends TimeSlot>(slots: T[]): T[] {
  return [...slots].sort(compareSlots)
}

// Canonical form of a set of slots (day + start + end; rooms and order
// ignored, duplicates collapsed), the same notion of "same schedule" the
// API uses for SameAsSga and for deduplicating identical suggestions.
export function slotSetKey(slots: TimeSlot[]): string {
  const keys = new Set(slots.map((s) => `${s.day} ${hhmm(s.time_from)}-${hhmm(s.time_to)}`))
  return [...keys].sort().join('|')
}

export function sameSlotSet(a: TimeSlot[], b: TimeSlot[]): boolean {
  return slotSetKey(a) === slotSetKey(b)
}

// "Mar 08:00–10:00". dayLabel maps "TUESDAY" → the short localized name.
export function formatSlot(slot: TimeSlot, dayLabel: (day: string) => string): string {
  return `${dayLabel(slot.day)} ${hhmm(slot.time_from)}–${hhmm(slot.time_to)}`
}

// "Lun 08:00–10:00, Mie 08:00–10:00", in week order.
export function formatSlots(slots: TimeSlot[], dayLabel: (day: string) => string): string {
  return sortSlots(slots).map((s) => formatSlot(s, dayLabel)).join(', ')
}

export function draftFromSchedule(schedule: CommissionSchedule[]): DraftSlot[] {
  return sortSlots(schedule).map((s) => ({
    day: s.day,
    from: hhmm(s.time_from),
    to: hhmm(s.time_to),
    classroom: s.classroom ?? '',
    building: s.building ?? '',
  }))
}

export function draftToSlots(draft: DraftSlot[]): TimeSlot[] {
  return draft.map((d) => ({ day: d.day, time_from: d.from, time_to: d.to }))
}

export type SlotError = 'incomplete' | 'order' | 'range' | 'overlap'
export type FormError = 'empty' | 'tooMany' | 'sameAsCurrent' | 'sameAsSga'

export interface DraftValidation {
  // One entry per draft row, null when the row is fine.
  slotErrors: (SlotError | null)[]
  formError: FormError | null
  ok: boolean
}

// Client-side mirror of the API's rules: 1..6 slots, each a known day with
// from < to inside 07:00–23:30, no two slots overlapping on the same day,
// and the set must differ from both what the app shows now and from SGA.
export function validateDraft(
  draft: DraftSlot[],
  current: TimeSlot[],
  sga: TimeSlot[],
): DraftValidation {
  const slotErrors: (SlotError | null)[] = draft.map((d) => {
    const from = hhmm(d.from)
    const to = hhmm(d.to)
    if (!(SUGGESTION_DAYS as readonly string[]).includes(d.day) || !from || !to) return 'incomplete'
    if (toMinutes(from) >= toMinutes(to)) return 'order'
    if (toMinutes(from) < toMinutes(MIN_TIME) || toMinutes(to) > toMinutes(MAX_TIME)) return 'range'
    return null
  })
  // Overlaps only between rows that are individually valid.
  draft.forEach((a, i) => {
    if (slotErrors[i]) return
    draft.forEach((b, j) => {
      if (i === j || slotErrors[j] === 'incomplete' || slotErrors[j] === 'order' || slotErrors[j] === 'range') return
      if (a.day !== b.day) return
      if (toMinutes(hhmm(a.from)) < toMinutes(hhmm(b.to)) && toMinutes(hhmm(b.from)) < toMinutes(hhmm(a.to))) {
        slotErrors[i] = 'overlap'
      }
    })
  })

  let formError: FormError | null = null
  if (draft.length === 0) formError = 'empty'
  else if (draft.length > MAX_SLOTS) formError = 'tooMany'
  else if (slotErrors.every((e) => e === null)) {
    const slots = draftToSlots(draft)
    if (sameSlotSet(slots, current)) formError = 'sameAsCurrent'
    else if (sameSlotSet(slots, sga)) formError = 'sameAsSga'
  }
  return { slotErrors, formError, ok: formError === null && slotErrors.every((e) => e === null) }
}

// APPLIED first, then by confirms (desc); stable otherwise, like the API.
export function sortCorrections(list: CommissionCorrection[]): CommissionCorrection[] {
  return list
    .map((c, i) => ({ c, i }))
    .sort((a, b) =>
      Number(b.c.status === 'APPLIED') - Number(a.c.status === 'APPLIED') ||
      b.c.confirms - a.c.confirms ||
      a.i - b.i,
    )
    .map(({ c }) => c)
}

// The original SGA slots of a commission, whether or not a correction is
// currently applied.
export function sgaScheduleOf(c: Commission): CommissionSchedule[] {
  return c.sga_schedule ?? c.schedule
}

export function appliedCorrectionOf(c: Commission): CommissionCorrection | null {
  return c.corrections?.find((x) => x.status === 'APPLIED') ?? null
}

export function pendingCorrectionsOf(c: Commission): CommissionCorrection[] {
  return (c.corrections ?? []).filter((x) => x.status === 'PENDING')
}

// Folds a correction returned by the API (after a suggestion or a vote)
// into the commission it belongs to, recomputing the effective schedule:
// - becomes APPLIED → its slots become `schedule`, the SGA slots move to
//   `sga_schedule`, and any previously applied one is superseded (dropped);
// - stops being APPLIED → `schedule` goes back to the SGA slots;
// - anything but PENDING/APPLIED is no longer listed.
export function mergeCorrection(c: Commission, updated: CommissionCorrection): Commission {
  const list = c.corrections ?? []
  const wasApplied = list.some((x) => x.id === updated.id && x.status === 'APPLIED')
  const sga = sgaScheduleOf(c)
  let others = list.filter((x) => x.id !== updated.id)
  let schedule = c.schedule
  let sgaSchedule = c.sga_schedule
  if (updated.status === 'APPLIED') {
    others = others.filter((x) => x.status !== 'APPLIED')
    schedule = updated.schedule
    sgaSchedule = sga
  } else if (wasApplied) {
    schedule = sga
    sgaSchedule = undefined
  }
  const listed = updated.status === 'PENDING' || updated.status === 'APPLIED'
  return {
    ...c,
    schedule,
    sga_schedule: sgaSchedule,
    corrections: sortCorrections(listed ? [...others, updated] : others),
  }
}

// Clicking the vote you already cast removes it; anything else sets it.
export function nextVoteAction(current: VoteType | null, clicked: VoteType): 'remove' | VoteType {
  return current === clicked ? 'remove' : clicked
}

export type CorrectionErrorKey =
  | 'signInRequired'
  | 'sameAsSga'
  | 'alreadySuggested'
  | 'commissionEnded'
  | 'notVotable'
  | 'notFound'
  | 'invalid'
  | 'rateLimited'
  | 'generic'

// Maps an ApiError-like value ({status, code}) to a translation key under
// corrections.errors. Codes are compared loosely ("SameAsSga",
// "SAME_AS_SGA" and "same-as-sga" all match).
export function correctionErrorKey(err: unknown): CorrectionErrorKey {
  const e = (err ?? {}) as { status?: unknown; code?: unknown }
  const status = typeof e.status === 'number' ? e.status : 0
  const code = typeof e.code === 'string' ? e.code.toLowerCase().replace(/[^a-z]/g, '') : ''
  if (status === 429) return 'rateLimited'
  if (status === 401) return 'signInRequired'
  if (code === 'sameassga') return 'sameAsSga'
  if (code === 'alreadysuggested') return 'alreadySuggested'
  if (code === 'commissionended') return 'commissionEnded'
  if (status === 404) return 'notFound'
  if (status === 409) return 'notVotable'
  if (status === 400) return 'invalid'
  return 'generic'
}

// Whether the subject's course is over (course_end is a "YYYY-MM-DD"
// calendar date): ended commissions no longer accept suggestions or votes.
export function courseEnded(courseEnd: string | null | undefined, today: Date = new Date()): boolean {
  if (!courseEnd || !/^\d{4}-\d{2}-\d{2}/.test(courseEnd)) return false
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return courseEnd.slice(0, 10) < `${y}-${m}-${d}`
}
