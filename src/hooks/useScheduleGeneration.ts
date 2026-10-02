import { useEffect, useRef, useState } from 'react'
import type { GenerationResult } from '../services/scheduler'
import { GenerationCancelledError, ScheduleGenerationClient } from '../services/generationClient'
import type { GenerationInputs } from '../workers/protocol'

export interface ScheduleGeneration {
  // Result for exactly the current `inputs`; null while generating or when
  // no generation is requested. Never a result computed for older inputs.
  result: GenerationResult | null
  pending: boolean
}

// Generates schedules in a Web Worker whenever `inputs` changes identity
// (memoize it in the caller). Pass null to not generate. Responses for
// superseded inputs are discarded; the worker is terminated on unmount.
export function useScheduleGeneration(inputs: GenerationInputs | null): ScheduleGeneration {
  const clientRef = useRef<ScheduleGenerationClient | null>(null)
  const [settled, setSettled] = useState<{ inputs: GenerationInputs; result: GenerationResult } | null>(null)

  useEffect(() => () => {
    clientRef.current?.dispose()
    clientRef.current = null
  }, [])

  useEffect(() => {
    if (!inputs) return
    let stale = false
    const client = (clientRef.current ??= new ScheduleGenerationClient())
    client.generate(inputs).then(
      result => { if (!stale) setSettled({ inputs, result }) },
      error => { if (!(error instanceof GenerationCancelledError)) console.error(error) },
    )
    return () => { stale = true }
  }, [inputs])

  const result = inputs && settled?.inputs === inputs ? settled.result : null
  return { result, pending: inputs !== null && result === null }
}
