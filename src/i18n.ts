import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'
import { readLocalLang, writeLocalLang, type Lang } from './store/prefsStore'
import { subscribe } from './store/authStore'

const savedLang = readLocalLang() ?? 'es'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  })

// Mirror local-only language toggles to the server when signed in.
i18n.on('languageChanged', (lang) => {
  if (lang === 'es' || lang === 'en') writeLocalLang(lang)
})

// Server-side language wins after login — applyServerPrefs already wrote the
// localStorage value; pick it up if it differs from the current i18n state.
subscribe(() => {
  const saved = readLocalLang()
  if (saved && i18n.language !== saved) i18n.changeLanguage(saved)
})

export default i18n
export type { Lang }
