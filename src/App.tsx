import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import i18n from './i18n'
import { ThemeProvider } from './context/ThemeContext'
import HomePage from './pages/HomePage'
import CareerPage from './pages/CareerPage'
import SavedSchedulesPage from './pages/SavedSchedulesPage'
import ComparisonPage from './pages/ComparisonPage'
import { getSession, subscribe } from './store/authStore'

// Lands here after the API redirects post-OAuth. The session cookie is
// already set; we just refresh the cache and bounce home.
function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  useEffect(() => {
    const error = params.get('error')
    if (error) {
      navigate(`/?authError=${encodeURIComponent(error)}`, { replace: true })
      return
    }
    getSession({ force: true }).finally(() => navigate('/', { replace: true }))
  }, [navigate, params])
  return null
}

function Bootstrap() {
  // Fire one /me on first mount so the navbar avatar can paint without
  // waiting for an interaction. We also wire the auth → i18n bridge here
  // (used to live as a top-level subscribe in i18n.ts but Rollup hoisting
  // produced TDZ errors on init in some chunk orderings).
  useEffect(() => {
    getSession()
    return subscribe(() => {
      const saved = localStorage.getItem('prefs.lang')
      if ((saved === 'es' || saved === 'en') && i18n.language !== saved) {
        i18n.changeLanguage(saved)
      }
    })
  }, [])
  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Bootstrap />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/saved" element={<SavedSchedulesPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/:career" element={<CareerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
