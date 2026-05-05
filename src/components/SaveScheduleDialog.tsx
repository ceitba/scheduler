import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  count: number
  max: number
  defaultName?: string
  busy?: boolean
  error?: string | null
  onSave: (name: string) => void
  onClose: () => void
}

// Minimal save dialog. Lives next to the calendar; opens when the user
// clicks "Save schedule". Validates name is non-empty and shows the X/MAX
// indicator. The actual cap is enforced server-side; this just prevents
// pressing the button when we already know we're at the limit.
export default function SaveScheduleDialog({ open, count, max, defaultName = '', busy = false, error = null, onSave, onClose }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(defaultName)
  if (!open) return null

  const trimmed = name.trim()
  const atLimit = count >= max
  const canSubmit = trimmed.length > 0 && !atLimit && !busy

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#27272a] rounded-card border border-border dark:border-[#3f3f46] p-5 flex flex-col gap-4">
        <div>
          <h3 className="font-display font-bold text-h4 text-ink-primary dark:text-[#f4f4f5]">{t('saved.dialogTitle')}</h3>
          <p className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa] mt-0.5">
            {t('saved.usage', { count, max })}
          </p>
        </div>

        {atLimit && (
          <p className="px-3 py-2 rounded-sm bg-amber-50 text-amber-800 font-body text-body-sm border border-amber-200">
            {t('saved.limitReached', { max })}
          </p>
        )}

        <label className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
            {t('saved.nameLabel')}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={atLimit}
            maxLength={120}
            placeholder={t('saved.namePlaceholder')}
            className="px-3 py-1.5 rounded-sm border border-border dark:border-[#3f3f46] bg-white dark:bg-[#27272a] font-body text-body-sm disabled:opacity-50"
          />
        </label>

        {error && (
          <p className="px-3 py-2 rounded-sm bg-red-50 text-red-700 font-body text-body-sm border border-red-200">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-3 py-1.5 font-mono text-label uppercase tracking-widest text-ink-secondary dark:text-[#a1a1aa]">
            {t('saved.cancel')}
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSave(trimmed)}
            className="px-3 py-1.5 rounded-sm bg-primary text-white font-mono text-label uppercase tracking-widest disabled:opacity-50"
          >
            {busy ? '…' : t('saved.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
