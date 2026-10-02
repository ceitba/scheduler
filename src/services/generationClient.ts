// Main-thread side of the schedule-generation worker. Owns one Worker,
// matches responses to requests by id, and degrades to running
// generateSchedules on the main thread when workers aren't available
// (old browser, CSP, failed chunk load) or the worker crashes.
import { generateSchedules, type GenerationResult } from './scheduler'
import type { GenerateRequest, GenerateResponse, GenerationInputs } from '../workers/protocol'

export class GenerationCancelledError extends Error {
  constructor() {
    super('Schedule generation superseded by a newer request')
    this.name = 'GenerationCancelledError'
  }
}

interface Pending {
  inputs: GenerationInputs
  resolve: (result: GenerationResult) => void
  reject: (error: Error) => void
}

const EMPTY_RESULT: GenerationResult = { schedules: [], truncated: false, stepLimitReached: false }

function generateOnMainThread({ subjects, options, blockedTimes }: GenerationInputs): GenerationResult {
  try {
    return generateSchedules(subjects, options, blockedTimes)
  } catch (error) {
    console.error('Schedule generation failed:', error)
    return EMPTY_RESULT
  }
}

// Yields once before computing so the caller's loading state can paint
// before the synchronous search blocks the thread.
function generateOnMainThreadAsync(inputs: GenerationInputs): Promise<GenerationResult> {
  return new Promise(resolve => setTimeout(() => resolve(generateOnMainThread(inputs)), 0))
}

export class ScheduleGenerationClient {
  private worker: Worker | null = null
  // Set once creating or running the worker fails; from then on every
  // request is served on the main thread.
  private workerUnavailable = typeof Worker === 'undefined'
  private nextId = 0
  private readonly pending = new Map<number, Pending>()

  generate(inputs: GenerationInputs): Promise<GenerationResult> {
    // Only the newest request matters. A worker busy with an older search
    // can't be interrupted (the search is synchronous), so drop it and
    // start a fresh one instead of queueing behind it.
    if (this.pending.size > 0) this.cancelPending()

    const worker = this.ensureWorker()
    if (!worker) return generateOnMainThreadAsync(inputs)

    const id = ++this.nextId
    const request: GenerateRequest = { id, ...inputs }
    return new Promise<GenerationResult>((resolve, reject) => {
      this.pending.set(id, { inputs, resolve, reject })
      try {
        worker.postMessage(request)
      } catch (error) {
        // DataCloneError: inputs weren't plain data. Still answer the caller.
        console.error('Could not post to the schedule worker:', error)
        this.pending.delete(id)
        generateOnMainThreadAsync(inputs).then(resolve)
      }
    })
  }

  dispose(): void {
    this.cancelPending()
  }

  private ensureWorker(): Worker | null {
    if (this.workerUnavailable) return null
    if (this.worker) return this.worker
    try {
      const worker = new Worker(new URL('../workers/scheduler.worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (event: MessageEvent<GenerateResponse>) => this.handleResponse(event.data)
      worker.onerror = event => {
        event.preventDefault()
        this.handleWorkerFailure(event.message || 'worker error')
      }
      worker.onmessageerror = () => this.handleWorkerFailure('undeserializable worker message')
      this.worker = worker
      return worker
    } catch (error) {
      console.warn('Schedule worker unavailable, generating on the main thread:', error)
      this.workerUnavailable = true
      return null
    }
  }

  private handleResponse(response: GenerateResponse): void {
    const entry = this.pending.get(response.id)
    // Not pending: a superseded request whose answer arrived late. Drop it.
    if (!entry) return
    this.pending.delete(response.id)
    if (response.ok) {
      entry.resolve(response.result)
    } else {
      console.error('Schedule worker failed, retrying on the main thread:', response.error)
      generateOnMainThreadAsync(entry.inputs).then(entry.resolve)
    }
  }

  // The worker script failed to load or crashed: stop using workers and
  // serve whatever was waiting on it from the main thread.
  private handleWorkerFailure(reason: string): void {
    console.warn(`Schedule worker failed (${reason}), generating on the main thread`)
    this.workerUnavailable = true
    this.terminateWorker()
    const waiting = Array.from(this.pending.values())
    this.pending.clear()
    waiting.forEach(entry => generateOnMainThreadAsync(entry.inputs).then(entry.resolve))
  }

  private cancelPending(): void {
    this.terminateWorker()
    const cancelled = Array.from(this.pending.values())
    this.pending.clear()
    cancelled.forEach(entry => entry.reject(new GenerationCancelledError()))
  }

  private terminateWorker(): void {
    this.worker?.terminate()
    this.worker = null
  }
}
