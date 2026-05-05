import { apiGet, apiSend, ApiError } from './client'

export interface SavedSchedule {
  id: string
  name: string
  careerId: string | null
  plan: string | null
  payload: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface SaveScheduleRequest {
  name: string
  careerId?: string | null
  plan?: string | null
  payload: Record<string, unknown>
}

// Server enforces this too (precise 409 on the 6th); the constant is here so
// the SPA can render X/MAX and disable Save without a round-trip.
export const MAX_SAVED_SCHEDULES = 5

export function listSavedSchedules(): Promise<SavedSchedule[]> {
  return apiGet('/me/schedules')
}

export function getSavedSchedule(id: string): Promise<SavedSchedule> {
  return apiGet(`/me/schedules/${id}`)
}

export function createSavedSchedule(req: SaveScheduleRequest): Promise<SavedSchedule> {
  return apiSend('POST', '/me/schedules', req)
}

export function updateSavedSchedule(id: string, req: SaveScheduleRequest): Promise<SavedSchedule> {
  return apiSend('PUT', `/me/schedules/${id}`, req)
}

export function deleteSavedSchedule(id: string): Promise<void> {
  return apiSend('DELETE', `/me/schedules/${id}`)
}

// 409 from the API at the cap; surface it explicitly to callers.
export function isLimitReached(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409
}
