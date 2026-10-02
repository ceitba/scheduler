import { createContext, useContext } from 'react'
import type { Subject } from '../hooks/useSubjects'
import type { Commission, CommissionCorrection } from '../types/scheduler'

// Provided by the career workspace, which owns the live subjects catalog.
// Components that show a commission (the commission picker, the calendar's
// class detail) read the current commission from here and report every
// correction the API returns, so the catalog (and, when the effective
// schedule changes, the generator inputs) update in place.
export interface CorrectionsContextValue {
  findCommission(subjectId: string, commissionName: string): { subject: Subject; commission: Commission } | null
  onCorrectionChange(subjectId: string, commissionName: string, correction: CommissionCorrection): void
}

export const CorrectionsContext = createContext<CorrectionsContextValue | null>(null)

// null outside a career workspace (comparison/share views): corrections are
// then simply not offered.
export function useCorrections(): CorrectionsContextValue | null {
  return useContext(CorrectionsContext)
}
