// Student-suggested schedule corrections (CEITBA-API web/corrections).
// These endpoints answer in camelCase, unlike the snake_case subjects
// catalog that embeds the corrections; toCommissionCorrection bridges them.
import { apiGet, apiSend } from './client'
import type { CommissionCorrection, CommissionSchedule, CorrectionStatus, VoteType } from '../types/scheduler'

export interface CorrectionSlotInput {
  day: string
  time_from: string
  time_to: string
}

interface ApiSlot {
  day: string
  time_from: string
  time_to: string
  classroom: string | null
  building: string | null
}

export interface Correction {
  id: string
  commissionId: string
  status: CorrectionStatus
  schedule: ApiSlot[]
  confirms: number
  rejects: number
  myVote: VoteType | null
  createdAt: string
}

export interface MyCorrection extends Correction {
  subjectId: string
  subjectName: string
  commissionName: string
  appliedAt: string | null
  seen: boolean
}

export interface SuggestResult {
  // false when an identical pending suggestion already existed; the
  // returned correction is that one.
  created: boolean
  correction: Correction
}

const slot = (s: ApiSlot): CommissionSchedule => ({
  day: s.day,
  time_from: s.time_from,
  time_to: s.time_to,
  classroom: s.classroom ?? '',
  building: s.building ?? '',
})

export function toCommissionCorrection(c: Correction): CommissionCorrection {
  return {
    id: c.id,
    status: c.status,
    schedule: (c.schedule ?? []).map(slot),
    confirms: c.confirms,
    rejects: c.rejects,
    my_vote: c.myVote ?? null,
    created_at: c.createdAt,
  }
}

export function suggestCorrection(commissionId: string, schedule: CorrectionSlotInput[]): Promise<SuggestResult> {
  return apiSend<SuggestResult>('POST', `/commissions/${encodeURIComponent(commissionId)}/schedule-corrections`, { schedule })
}

export function voteCorrection(id: string, type: VoteType): Promise<Correction> {
  return apiSend<Correction>('PUT', `/schedule-corrections/${encodeURIComponent(id)}/vote`, { type })
}

export function removeCorrectionVote(id: string): Promise<Correction> {
  return apiSend<Correction>('DELETE', `/schedule-corrections/${encodeURIComponent(id)}/vote`)
}

export function listMyCorrections(): Promise<MyCorrection[]> {
  return apiGet<MyCorrection[]>('/me/schedule-corrections')
}

export function markCorrectionSeen(id: string): Promise<void> {
  return apiSend<void>('POST', `/me/schedule-corrections/${encodeURIComponent(id)}/seen`)
}
