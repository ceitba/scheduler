// Shared time helpers for schedule math. API times are "HH:mm:ss" strings and
// blocked times drawn in the settings calendar are "HH:mm"; both parse here.

export interface DayInterval {
  day: string
  from: number // minutes since midnight
  to: number
}

export const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const

export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + (m || 0)
}

// Minutes two intervals share. Back-to-back intervals (one ends exactly when
// the other starts) share 0 minutes, i.e. they do not overlap.
export const overlapMinutes = (a: DayInterval, b: DayInterval): number => {
  if (a.day !== b.day) return 0
  const start = Math.max(a.from, b.from)
  const end = Math.min(a.to, b.to)
  return Math.max(0, end - start)
}
