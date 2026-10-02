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

// Mirror every language change to localStorage and to <html lang> (index.html
// hardcodes "es"; screen readers and the browser's translate prompt read it).
// The server PATCH happens only for explicit toggles
// (hooks/useLanguageToggle → prefsStore).
document.documentElement.lang = i18n.language || savedLang
i18n.on('languageChanged', (lang) => {
  document.documentElement.lang = lang
  if (lang === 'es' || lang === 'en') localStorage.setItem('prefs.lang', lang)
})

function readLangFromStorage(): string {
  const v = localStorage.getItem('prefs.lang')
  return v === 'es' || v === 'en' ? v : 'es'
}

export default i18n
export type Lang = 'es' | 'en'
