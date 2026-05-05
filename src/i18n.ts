import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'

// Top-level i18n configuration only. We deliberately avoid calling into any
// other app module at module-init time: previous versions called
// readLocalLang() and subscribe() at the top level, which Rollup interleaved
// across the bundle and produced TDZ errors at runtime. Reading localStorage
// directly keeps this module dependency-free; the auth-driven language sync
// is wired up from a React effect in App.tsx.

const savedLang = readLangFromStorage()

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

// Mirror language toggles to localStorage. Server PATCH for signed-in
// users is fired by prefsStore.setLang from elsewhere (Navbar/HomePage).
i18n.on('languageChanged', (lang) => {
  if (lang === 'es' || lang === 'en') localStorage.setItem('prefs.lang', lang)
})

function readLangFromStorage(): string {
  const v = localStorage.getItem('prefs.lang')
  return v === 'es' || v === 'en' ? v : 'es'
}

export default i18n
export type Lang = 'es' | 'en'
