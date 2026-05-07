import { apiGet, apiSend } from './client'

export interface ShareParticipant {
  userId: string
  displayName: string
  isCreator: boolean
  // null when the user later deleted the saved_schedule they had attached.
  careerId: string | null
  plan: string | null
  payload: Record<string, unknown> | null
  joinedAt: string
}

export interface ShareSession {
  id: string
  token: string
  name: string | null
  creatorDisplayName: string | null
  expiresAt: string | null
  createdAt: string
  participants: ShareParticipant[]
}

export interface CreateShareSessionRequest {
  savedScheduleId: string
  displayName?: string
  name?: string
}

export interface JoinShareSessionRequest {
  savedScheduleId: string
  displayName?: string
}

export function createShareSession(req: CreateShareSessionRequest): Promise<ShareSession> {
  return apiSend('POST', '/share/sessions', req)
}

export function getShareSession(token: string): Promise<ShareSession> {
  return apiGet(`/share/sessions/${encodeURIComponent(token)}`)
}

export function joinShareSession(token: string, req: JoinShareSessionRequest): Promise<ShareSession> {
  return apiSend('POST', `/share/sessions/${encodeURIComponent(token)}/join`, req)
}

export function leaveShareSession(token: string): Promise<void> {
  return apiSend('DELETE', `/share/sessions/${encodeURIComponent(token)}/leave`)
}

export function deleteShareSession(token: string): Promise<void> {
  return apiSend('DELETE', `/share/sessions/${encodeURIComponent(token)}`)
}
