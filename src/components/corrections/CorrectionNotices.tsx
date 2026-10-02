import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { listMyCorrections, markCorrectionSeen, type MyCorrection } from '../../api/corrections'

// The "applied" notices are fetched once per page load and signed-in
// user; effects (re)subscribe to the same request.
let request: { userId: string; promise: Promise<MyCorrection[]> } | null = null

function unseenApplied(userId: string): Promise<MyCorrection[]> {
  if (request?.userId !== userId) {
    request = {
      userId,
      promise: listMyCorrections()
        .then((list) => list.filter((c) => c.status === 'APPLIED' && !c.seen))
        .catch(() => []), // older API or offline: no notices
    }
  }
  return request.promise
}

// Dismissed this page load (the seen POST may still be in flight).
const dismissed = new Set<string>()

// "Tu corrección de X · Comisión G fue aplicada" notices for the signed-in
// student's own suggestions that got applied and weren't acknowledged yet.
// A notice is marked seen (POST …/seen) when the student dismisses it, not
// when it is shown, so one that scrolls by unnoticed comes back next visit.

export default function CorrectionNotices() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const [notices, setNotices] = useState<MyCorrection[]>([])
  const userId = profile?.id ?? null

  useEffect(() => {
    if (!userId) return
    let ignore = false
    unseenApplied(userId).then((list) => {
      if (!ignore) setNotices(list.filter((n) => !dismissed.has(n.id)))
    })
    return () => { ignore = true }
  }, [userId])

  const visible = userId ? notices : []
  if (visible.length === 0) return null

  const dismiss = (id: string) => {
    dismissed.add(id)
    setNotices((list) => list.filter((n) => n.id !== id))
    markCorrectionSeen(id).catch(() => { /* shown again next session */ })
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto">
      {visible.slice(0, 3).map((n) => (
        <div
          key={n.id}
          role="status"
          aria-live="polite"
          className="bg-white dark:bg-[#27272a] border border-border dark:border-[#3f3f46] rounded-card shadow-card-hover p-4 flex items-start gap-3 animate-slide-up"
        >
          <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary dark:text-primary-200">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-body-sm font-semibold text-ink-primary dark:text-[#f4f4f5]">
              {t('corrections.noticeTitle', { subject: n.subjectName, commission: n.commissionName })}
            </p>
            <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">{t('corrections.noticeBody')}</p>
          </div>
          <button
            type="button"
            onClick={() => dismiss(n.id)}
            aria-label={t('corrections.noticeDismiss')}
            className="text-ink-secondary dark:text-[#a1a1aa] hover:text-ink-primary"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
