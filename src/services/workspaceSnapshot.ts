import type { SchedulerOptions, TimeBlock } from '../types/scheduler'

// Payload shape we round-trip through the saved_schedules.payload JSONB
// column, and also the body of the pending-workspace snapshot below. Bump
// `version` if the shape ever changes; restores refuse unknown versions
// instead of silently mis-restoring. (Older payloads also carry an unused
// `isPriority` per course and `avoidBuildingChange` in options; both are
// ignored on restore.)
export interface SavedSchedulePayload {
  version: 1
  selectedCourses: { subject_id: string; selectedCommissions: string[] }[]
  options: SchedulerOptions
  blockedTimes: TimeBlock[]
}

// The career workspace lives only in React state, so signing in (a full
// redirect to Google and back) would empty it. Right before redirecting,
// the workspace is written here; when the same career + plan mounts again
// it is restored once and the key deleted.
export const PENDING_WORKSPACE_KEY = 'scheduler.pendingWorkspace'
export const PENDING_WORKSPACE_MAX_AGE_MS = 30 * 60 * 1000

export interface PendingWorkspace {
  version: 1
  career: string
  // Normalized plan id, as it appears in the ?plan= query param.
  plan: string
  savedAt: number
  activeTab: number
  payload: SavedSchedulePayload
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')

export const restoreOptions = (raw: Partial<SchedulerOptions> | undefined): SchedulerOptions => ({
  allowOverlap: !!raw?.allowOverlap,
  allowUnlimitedOverlap: !!raw?.allowUnlimitedOverlap,
  allowFreeDay: !!raw?.allowFreeDay,
})

// A well-formed version 1 payload, normalized (unknown fields dropped), or
// null. Shared by the saved-schedule restore and the pending snapshot.
export function parsePayload(raw: unknown): SavedSchedulePayload | null {
  if (!isObject(raw) || raw.version !== 1) return null
  const courses = raw.selectedCourses ?? []
  const blocks = raw.blockedTimes ?? []
  if (!Array.isArray(courses) || !Array.isArray(blocks)) return null
  if (!courses.every((c) => isObject(c) && typeof c.subject_id === 'string' && isStringArray(c.selectedCommissions))) return null
  if (!blocks.every((b) => isObject(b) && typeof b.day === 'string' && typeof b.from === 'string' && typeof b.to === 'string')) return null
  return {
    version: 1,
    selectedCourses: (courses as Record<string, unknown>[]).map((c) => ({
      subject_id: c.subject_id as string,
      selectedCommissions: c.selectedCommissions as string[],
    })),
    options: restoreOptions(isObject(raw.options) ? (raw.options as Partial<SchedulerOptions>) : undefined),
    blockedTimes: (blocks as Record<string, unknown>[]).map((b) => ({
      ...(typeof b.id === 'string' ? { id: b.id } : {}),
      day: b.day as string,
      from: b.from as string,
      to: b.to as string,
      ...(typeof b.label === 'string' ? { label: b.label } : {}),
    })),
  }
}

export function serializePendingWorkspace(snapshot: Omit<PendingWorkspace, 'version'>): string {
  return JSON.stringify({ version: 1, ...snapshot })
}

// The snapshot if it is well formed, for this career + plan and not older
// than the max age; null otherwise. Never throws.
export function parsePendingWorkspace(
  raw: string | null,
  expected: { career: string; plan: string; now: number },
): PendingWorkspace | null {
  if (!raw) return null
  let data: unknown
  try { data = JSON.parse(raw) } catch { return null }
  if (!isObject(data) || data.version !== 1) return null
  if (data.career !== expected.career || data.plan !== expected.plan) return null
  const savedAt = data.savedAt
  if (typeof savedAt !== 'number' || !Number.isFinite(savedAt)) return null
  const age = expected.now - savedAt
  // A timestamp from the future (clock change) is as untrustworthy as a stale one.
  if (age < 0 || age > PENDING_WORKSPACE_MAX_AGE_MS) return null
  const payload = parsePayload(data.payload)
  if (!payload) return null
  const activeTab = typeof data.activeTab === 'number' && Number.isInteger(data.activeTab) && data.activeTab >= 0 ? data.activeTab : 0
  return { version: 1, career: expected.career, plan: expected.plan, savedAt, activeTab, payload }
}

// Writes the snapshot, or removes any previous one when the workspace is
// empty (nothing worth bringing back). Storage may be unavailable.
export function savePendingWorkspace(snapshot: Omit<PendingWorkspace, 'version'>): void {
  try {
    const p = snapshot.payload
    const empty = p.selectedCourses.length === 0 && p.blockedTimes.length === 0
    if (empty) sessionStorage.removeItem(PENDING_WORKSPACE_KEY)
    else sessionStorage.setItem(PENDING_WORKSPACE_KEY, serializePendingWorkspace(snapshot))
  } catch { /* storage unavailable: the workspace just won't survive sign-in */ }
}

// Reads and always deletes the stored snapshot (a mismatched, stale or
// malformed one is discarded too); returns it only when it applies here.
export function takePendingWorkspace(career: string, plan: string): PendingWorkspace | null {
  try {
    const raw = sessionStorage.getItem(PENDING_WORKSPACE_KEY)
    if (raw === null) return null
    sessionStorage.removeItem(PENDING_WORKSPACE_KEY)
    return parsePendingWorkspace(raw, { career, plan, now: Date.now() })
  } catch {
    return null
  }
}
