import { useTranslation } from 'react-i18next'
import { useBeginSignIn } from '../../context/signInContext'

// Short explanation + Google sign-in that comes back to this same page
// (career and plan included, they live in the path and query; inside the
// career workspace the unsaved workspace comes back too).
export default function SignInPrompt({ message, compact = false }: { message: string; compact?: boolean }) {
  const { t } = useTranslation()
  const beginSignIn = useBeginSignIn()
  return (
    <div className={`flex ${compact ? 'flex-wrap items-center gap-x-3 gap-y-1' : 'flex-col gap-3'}`}>
      <p className="font-body text-body-sm text-ink-secondary dark:text-[#a1a1aa]">{message}</p>
      <button
        type="button"
        onClick={beginSignIn}
        className={
          compact
            ? 'font-body text-body-sm font-semibold text-primary dark:text-primary-300 hover:underline underline-offset-2'
            : 'self-start min-h-[44px] px-4 py-2 rounded-sm bg-primary text-surface font-body font-semibold text-body-sm hover:bg-primary-600 transition-colors duration-150'
        }
      >
        {t('corrections.signIn')}
      </button>
    </div>
  )
}
