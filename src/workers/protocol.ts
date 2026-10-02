// Message protocol between the main thread (src/hooks/useScheduleGeneration)
// and src/workers/scheduler.worker.ts. Everything here crosses postMessage,
// so it must stay structured-clone-safe: plain objects, arrays, strings,
// numbers and booleans only (no functions, class instances or DOM nodes).
import type { GenerationResult } from '../services/scheduler'
import type { SchedulerOptions, SchedulerSubject, TimeBlock } from '../types/scheduler'

export interface GenerationInputs {
  subjects: SchedulerSubject[]
  options: SchedulerOptions
  blockedTimes: TimeBlock[]
}

export interface GenerateRequest extends GenerationInputs {
  // Monotonic per client; the response echoes it so late answers to
  // superseded requests can be recognised and dropped.
  id: number
}

export type GenerateResponse =
  | { id: number; ok: true; result: GenerationResult }
  | { id: number; ok: false; error: string }
