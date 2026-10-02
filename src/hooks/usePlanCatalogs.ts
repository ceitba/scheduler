import { useEffect, useRef, useState } from 'react'
import { loadCatalogs, type Subject } from './useSubjects'

export interface PlanCatalogs {
  subjectsByPlan: Map<string, Subject[]>
  // Plans whose catalog request failed (they map to an empty list).
  failedPlans: string[]
}

// Loads the subject catalog of every plan in `plans`, each at most once per
// mount. A request in flight is never cancelled or repeated just because
// the caller's plan list changed identity (e.g. a polled share session), so
// late-joining plans only fetch what's new.
export function usePlanCatalogs(plans: string[]): PlanCatalogs {
  const [catalogs, setCatalogs] = useState<PlanCatalogs>({ subjectsByPlan: new Map(), failedPlans: [] })
  const requested = useRef(new Set<string>())
  const mounted = useRef(false)
  const key = Array.from(new Set(plans)).sort().join('\n')

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    const missing = key ? key.split('\n').filter((p) => !requested.current.has(p)) : []
    if (missing.length === 0) return
    missing.forEach((p) => requested.current.add(p))
    loadCatalogs(missing).then(({ loaded, failed }) => {
      if (!mounted.current) return
      setCatalogs((prev) => {
        const subjectsByPlan = new Map(prev.subjectsByPlan)
        loaded.forEach(([p, subs]) => subjectsByPlan.set(p, subs))
        return { subjectsByPlan, failedPlans: [...prev.failedPlans, ...failed] }
      })
    })
  }, [key])

  return catalogs
}
