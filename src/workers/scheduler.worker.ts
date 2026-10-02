// Runs schedule generation off the main thread so a large search can't
// freeze the UI. Type-checked with the WebWorker lib via tsconfig.worker.json
// (it's excluded from tsconfig.app.json, whose DOM lib would clash).
import { generateSchedules } from '../services/scheduler'
import type { GenerateRequest, GenerateResponse } from './protocol'

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (event: MessageEvent<GenerateRequest>) => {
  const { id, subjects, options, blockedTimes } = event.data
  let response: GenerateResponse
  try {
    response = { id, ok: true, result: generateSchedules(subjects, options, blockedTimes) }
  } catch (error) {
    response = { id, ok: false, error: error instanceof Error ? error.message : String(error) }
  }
  self.postMessage(response)
}
