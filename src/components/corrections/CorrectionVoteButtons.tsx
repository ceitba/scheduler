import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useCorrections } from '../../context/correctionsContext'
import { removeCorrectionVote, toCommissionCorrection, voteCorrection } from '../../api/corrections'
import { correctionErrorKey, nextVoteAction } from '../../services/corrections'
import type { CommissionCorrection, VoteType } from '../../types/scheduler'
import SignInPrompt from './SignInPrompt'

interface Props {
  subjectId: string
  commissionName: string
  correction: CommissionCorrection
  // Accessible name of the group, e.g. "Vote on the suggestion Tue 08:00–10:00".
  label: string
}

const base =
  'min-h-[32px] px-2.5 py-1 rounded-sm font-mono text-label uppercase tracking-widest border transition-colors duration-150 disabled:opacity-50'
const idle =
  'bg-white dark:bg-[#27272a] text-ink-secondary dark:text-[#a1a1aa] border-border dark:border-[#3f3f46] hover:border-primary hover:text-primary'
const active = 'bg-primary text-white border-primary'

// [Confirmar] [No es así]. The caller's vote shows pressed; pressing it
// again removes it. Anonymous visitors get a sign-in prompt instead.
// The list updates from the correction the API returns (no optimistic
// state to roll back).
export default function CorrectionVoteButtons({ subjectId, commissionName, correction, label }: Props) {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const corrections = useCorrections()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [askSignIn, setAskSignIn] = useState(false)

  async function vote(type: VoteType) {
    if (!profile) { setAskSignIn(true); return }
    const action = nextVoteAction(correction.my_vote, type)
    setBusy(true)
    setError(null)
    try {
      const updated = action === 'remove'
        ? await removeCorrectionVote(correction.id)
        : await voteCorrection(correction.id, action)
      corrections?.onCorrectionChange(subjectId, commissionName, toCommissionCorrection(updated))
    } catch (e) {
      setError(t(`corrections.errors.${correctionErrorKey(e)}`))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2" role="group" aria-label={label} aria-busy={busy}>
        {(['CONFIRM', 'REJECT'] as const).map((type) => {
          const pressed = correction.my_vote === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => vote(type)}
              disabled={busy}
              aria-pressed={pressed}
              className={`${base} ${pressed ? active : idle}`}
            >
              {t(type === 'CONFIRM' ? 'corrections.confirm' : 'corrections.reject')}
            </button>
          )
        })}
      </div>
      {askSignIn && !profile && <SignInPrompt compact message={t('corrections.signInToVote')} />}
      {error && (
        <p role="alert" className="font-body text-body-sm text-red-700 dark:text-red-300">{error}</p>
      )}
    </div>
  )
}
