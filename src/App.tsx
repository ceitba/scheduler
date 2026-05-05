import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import HomePage from './pages/HomePage'
import CareerPage from './pages/CareerPage'
import { getSession } from './store/authStore'

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
  // waiting for an interaction.
  useEffect(() => { getSession() }, [])
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
          <Route path="/:career" element={<CareerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
