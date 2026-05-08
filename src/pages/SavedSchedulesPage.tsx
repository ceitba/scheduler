import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import {
  deleteSavedSchedule,
  listSavedSchedules,
  updateSavedSchedule,
  MAX_SAVED_SCHEDULES,
  type SavedSchedule,
} from '../api/schedules'
import { normalizePlanId } from '../utils/planUtils'
import SimpleHeader from '../components/SimpleHeader'

// Read-only list of the user's saved schedules with rename + delete +
// open-into-CareerPage. The actual restoration of selectedCourses /
// scheduler options / blocked times happens on CareerPage by reading the
// "savedSchedule" piece of router state we put here.
export default function SavedSchedulesPage() {
  const { t } = useTranslation()
  const { profile, loading } = useAuth()
  const navigate = useNavigate()
  const [list, setList] = useState<SavedSchedule[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const [comparing, setComparing] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!profile) return
    listSavedSchedules().then(setList).catch((e: Error) => setError(e.message))
  }, [profile])

  if (loading) return null
  if (!profile) return <Navigate to="/" replace />

  function open(s: SavedSchedule) {
    if (!s.careerId || !s.plan) {
      setError(t('saved.openMissingContext'))
      return
    }
    navigate(`/${s.careerId}?plan=${normalizePlanId(s.plan)}`, { state: { savedSchedule: s } })
  }

  async function remove(id: string) {
    if (!confirm(t('saved.confirmDelete'))) return
    setBusyId(id); setError(null)
    try {
      await deleteSavedSchedule(id)
      setList((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  async function commitRename() {
    if (!renaming) return
    const next = renaming.name.trim()
    if (!next) return
    const target = list.find((s) => s.id === renaming.id)
    if (!target) return
    setBusyId(renaming.id); setError(null)
    try {
      const updated = await updateSavedSchedule(renaming.id, {
        name: next,
        careerId: target.careerId,
        plan: target.plan,
        payload: target.payload,
      })
      setList((prev) => prev.map((s) => (s.id === renaming.id ? updated : s)))
      setRenaming(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  function toggleComparing(id: string) {
    setComparing((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function startCompare() {
    const ids = Array.from(comparing)
    if (ids.length < 2) return
    navigate(`/compare?ids=${ids.join(',')}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#18181b]">
      <SimpleHeader />

      <main className="flex-1 container-content py-section-mobile lg:py-section">
        <header className="mb-6 flex items-baseline gap-4">
          <div className="flex-1">
            <h1 className="font-display font-bold text-h2 text-ink-primary dark:text-[#f4f4f5]">{t('saved.pageTitle')}</h1>
            <p className="font-body text-body text-ink-secondary dark:text-[#a1a1aa] mt-1">
              {t('saved.usage', { count: list.length, max: MAX_SAVED_SCHEDULES })}
            </p>
          </div>
          <button
            type="button"
            onClick={startCompare}
            disabled={comparing.size < 2}
            className="px-3 py-1.5 rounded-sm bg-primary text-white font-mono text-label uppercase tracking-widest disabled:opacity-40"
          >
            {comparing.size < 2
              ? t('saved.compareCta')
              : t('saved.compareSelected', { count: comparing.size })}
          </button>
        </header>

        {error && (
          <p className="mb-4 px-3 py-2 rounded-sm bg-red-50 text-red-700 font-body text-body-sm border border-red-200">{error}</p>
        )}

        {list.length === 0 ? (
          <p className="text-ink-secondary dark:text-[#a1a1aa] font-body">{t('saved.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {list.map((s) => (
              <li key={s.id} className="p-4 rounded-card border border-border dark:border-[#3f3f46] bg-white dark:bg-[#27272a] flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={comparing.has(s.id)}
                  aria-label={t('saved.compareToggleAria', { name: s.name })}
                  onClick={() => toggleComparing(s.id)}
                  className={`flex items-center justify-center w-5 h-5 rounded-sm border transition-colors duration-150 flex-shrink-0 ${
                    comparing.has(s.id)
                      ? 'bg-primary border-primary'
                      : 'bg-white dark:bg-[#27272a] border-border dark:border-[#3f3f46] hover:border-primary'
                  }`}
                >
                  {comparing.has(s.id) && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  {renaming?.id === s.id ? (
                    <input
                      autoFocus
                      value={renaming.name}
                      onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null) }}
                      className="w-full px-2 py-1 rounded-sm border border-border dark:border-[#3f3f46] bg-white dark:bg-[#27272a] font-body text-body"
                    />
                  ) : (
                    <p className="font-display font-bold text-h5 text-ink-primary dark:text-[#f4f4f5] truncate">{s.name}</p>
                  )}
                  <p className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa] mt-0.5">
                    {s.careerId ?? '—'} · {s.plan ?? '—'} · {new Date(s.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 sm:ml-auto">
                  {renaming?.id === s.id ? (
                    <>
                      <button onClick={commitRename} disabled={busyId === s.id} className="px-3 py-1.5 rounded-sm bg-primary text-white font-mono text-label uppercase tracking-widest disabled:opacity-50">{t('saved.save')}</button>
                      <button onClick={() => setRenaming(null)} className="px-3 py-1.5 font-mono text-label uppercase tracking-widest text-ink-secondary">{t('saved.cancel')}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => open(s)} className="px-3 py-1.5 rounded-sm bg-primary text-white font-mono text-label uppercase tracking-widest">{t('saved.open')}</button>
                      <button onClick={() => setRenaming({ id: s.id, name: s.name })} className="px-3 py-1.5 font-mono text-label uppercase tracking-widest text-primary border border-primary rounded-sm">{t('saved.rename')}</button>
                      <button onClick={() => remove(s.id)} disabled={busyId === s.id} className="px-3 py-1.5 font-mono text-label uppercase tracking-widest text-red-600 border border-red-200 rounded-sm disabled:opacity-50">{t('saved.delete')}</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
