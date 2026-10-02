import { useTranslation } from 'react-i18next'
import { writeLocalLang, type Lang } from '../store/prefsStore'

// ES <-> EN toggle for the headers. Persists the explicit choice to
// prefs.lang and the user's profile. Language changes that come from
// hydrating server prefs (App.tsx Bootstrap) only call changeLanguage, so
// they never PATCH the value straight back.
export function useLanguageToggle() {
  const { i18n } = useTranslation()
  return () => {
    const next: Lang = i18n.language === 'es' ? 'en' : 'es'
    void i18n.changeLanguage(next)
    writeLocalLang(next)
  }
}
