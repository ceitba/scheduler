import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  type ShareSession,
  getShareSession,
  joinShareSession,
  leaveShareSession,
  deleteShareSession,
} from '../api/share'
import { listSavedSchedules, type SavedSchedule } from '../api/schedules'
import { fetchSubjectsByPlan, type Subject } from '../hooks/useSubjects'
import { useAuth } from '../hooks/useAuth'
import { startGoogleSignIn } from '../store/authStore'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingDots from '../components/LoadingDots'
import ErrorView from '../components/ErrorView'
import SimpleHeader from '../components/SimpleHeader'
import { buildHeatmap } from '../services/heatmap'

export default function SharePage() {
  const { t } = useTranslation()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [session, setSession] = useState<ShareSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjectsByPlan, setSubjectsByPlan] = useState<Map<string, Subject[]>>(new Map())
  const [showJoin, setShowJoin] = useState(false)
  const [savedList, setSavedList] = useState<SavedSchedule[]>([])
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getShareSession(token)
      .then((s) => {
        setSession(s)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  // Fetch the subject catalog for every distinct plan present in the
  // session so the heatmap can resolve commission times. Plans missing
  // from this map degrade gracefully (no course slots, just blocked time).
  useEffect(() => {
    if (!session) return
    const plans = Array.from(
      new Set(session.participants.map((p) => p.plan).filter((p): p is string => !!p)),
    )
    const missing = plans.filter((p) => !subjectsByPlan.has(p))
    if (missing.length === 0) return
    let cancelled = false
    Promise.all(missing.map((p) => fetchSubjectsByPlan(p).then((subs) => [p, subs] as const)))
      .then((pairs) => {
        if (cancelled) return
        setSubjectsByPlan((prev) => {
          const next = new Map(prev)
          pairs.forEach(([p, subs]) => next.set(p, subs))
          return next
        })
      })
      .catch((e: Error) => setError(e.message))
    return () => {
      cancelled = true
    }
  }, [session, subjectsByPlan])

  useEffect(() => {
    if (!profile) return
    listSavedSchedules().then(setSavedList).catch(() => undefined)
  }, [profile])

  const heatmap = useMemo(
    () => (session ? buildHeatmap(session.participants, subjectsByPlan) : null),
    [session, subjectsByPlan],
  )

  const isParticipant = !!profile && !!session?.participants.some((p) => p.userId === profile.id)
  const isCreator = !!profile && !!session && session.participants.some((p) => p.isCreator && p.userId === profile.id)

  async function handleJoin(savedScheduleId: string) {
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      const updated = await joinShareSession(token, { savedScheduleId })
      setSession(updated)
      setShowJoin(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleLeave() {
    if (!token) return
    if (!confirm(t('share.confirmLeave'))) return
    setBusy(true)
    setError(null)
    try {
      await leaveShareSession(token)
      const refreshed = await getShareSession(token)
      setSession(refreshed)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!token) return
    if (!confirm(t('share.confirmDelete'))) return
    setBusy(true)
    setError(null)
    try {
      await deleteShareSession(token)
      navigate('/', { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#18181b]">
      <SimpleHeader />

      <main className="flex-1 container-content py-section-mobile lg:py-section">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingDots size="lg" />
          </div>
        ) : error && !session ? (
          <ErrorView message={error} className="h-64" />
        ) : session && heatmap ? (
          <>
            <header className="mb-6">
              <p className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
                {t('share.heatmap.label')}
              </p>
              <h1 className="font-display font-bold text-h2 text-ink-primary dark:text-[#f4f4f5]">
                {session.name ?? t('share.untitledSession')}
              </h1>
              <p className="font-body text-body text-ink-secondary dark:text-[#a1a1aa] mt-1">
                {t('share.participantCount', { count: session.participants.length })}
                {session.creatorDisplayName && ` · ${t('share.createdBy', { name: session.creatorDisplayName })}`}
              </p>
            </header>

            {error && (
              <p className="mb-4 px-3 py-2 rounded-sm bg-red-50 text-red-700 font-body text-body-sm border border-red-200">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={copyLink}
                className="px-3 py-1.5 rounded-sm border border-border dark:border-[#3f3f46] text-ink-primary dark:text-[#f4f4f5] font-mono text-label uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
              >
                {copied ? t('save.linkCopied') : t('share.copyLink')}
              </button>
              {!profile && (
                <button
                  onClick={() => startGoogleSignIn()}
                  className="px-3 py-1.5 rounded-sm bg-primary text-white font-mono text-label uppercase tracking-widest hover:bg-primary-600 transition-colors"
                >
                  {t('share.signInToJoin')}
                </button>
              )}
              {profile && !isParticipant && (
                <button
                  onClick={() => setShowJoin(true)}
                  className="px-3 py-1.5 rounded-sm bg-primary text-white font-mono text-label uppercase tracking-widest hover:bg-primary-600 transition-colors"
                >
                  {t('share.addMySchedule')}
                </button>
              )}
              {profile && isParticipant && !isCreator && (
                <button
                  onClick={handleLeave}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-sm border border-red-200 text-red-600 font-mono text-label uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {t('share.leave')}
                </button>
              )}
              {isCreator && (
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-sm border border-red-200 text-red-600 font-mono text-label uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {t('share.deleteSession')}
                </button>
              )}
            </div>

            <section className="bg-white dark:bg-[#27272a] rounded-card border border-border dark:border-[#3f3f46] px-4 py-4">
              <HeatmapGrid model={heatmap} />
            </section>

            <section className="mt-6">
              <h2 className="font-body font-semibold text-body text-ink-primary dark:text-[#f4f4f5] mb-2">
                {t('share.participantsHeading')}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {session.participants.map((p) => (
                  <li
                    key={p.userId}
                    className="px-3 py-1.5 rounded-card border border-border dark:border-[#3f3f46] bg-white dark:bg-[#27272a] font-mono text-label text-ink-primary dark:text-[#f4f4f5]"
                  >
                    {p.displayName}
                    {p.isCreator && (
                      <span className="ml-2 text-primary uppercase tracking-widest">
                        · {t('share.creatorTag')}
                      </span>
                    )}
                    {!p.payload && (
                      <span className="ml-2 text-ink-secondary dark:text-[#a1a1aa] uppercase tracking-widest">
                        · {t('share.scheduleRemoved')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </main>

      {showJoin && (
        <JoinDialog
          savedList={savedList}
          busy={busy}
          onJoin={handleJoin}
          onClose={() => setShowJoin(false)}
        />
      )}
    </div>
  )
}

function JoinDialog({
  savedList,
  busy,
  onJoin,
  onClose,
}: {
  savedList: SavedSchedule[]
  busy: boolean
  onJoin: (id: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<string | null>(savedList[0]?.id ?? null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/30 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-5 bg-white dark:bg-[#27272a] border border-border dark:border-[#3f3f46] rounded-card shadow-card-hover">
        <h3 className="font-display text-h4 font-bold text-ink-primary dark:text-[#f4f4f5] mb-3">
          {t('share.join.title')}
        </h3>
        <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa] mb-3">
          {t('share.join.hint')}
        </p>
        {savedList.length === 0 ? (
          <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">
            {t('share.join.noSaved')}
          </p>
        ) : (
          <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {savedList.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setPicked(s.id)}
                  className={`w-full px-3 py-2 rounded-card border text-left transition-colors ${
                    picked === s.id
                      ? 'border-primary bg-primary text-white'
                      : 'border-border dark:border-[#3f3f46] bg-surface dark:bg-[#18181b] text-ink-primary dark:text-[#f4f4f5] hover:border-primary'
                  }`}
                >
                  <div className="font-body font-semibold text-body-sm">{s.name}</div>
                  <div className="font-mono text-label uppercase tracking-widest opacity-80">
                    {s.careerId ?? '—'} · {s.plan ?? '—'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border dark:border-[#3f3f46]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-mono text-label uppercase tracking-widest text-ink-secondary"
          >
            {t('saved.cancel')}
          </button>
          <button
            onClick={() => picked && onJoin(picked)}
            disabled={!picked || busy}
            className="px-3 py-1.5 rounded-sm bg-primary text-white font-mono text-label uppercase tracking-widest disabled:opacity-50"
          >
            {t('share.join.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
