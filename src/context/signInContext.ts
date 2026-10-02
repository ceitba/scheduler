import { createContext, useCallback, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { startGoogleSignIn } from '../store/authStore'

// Every "sign in" button goes through here. The career workspace provides
// its own beginSignIn, which snapshots the unsaved workspace before
// redirecting to Google; elsewhere it's a plain sign-in that comes back to
// the current page.
export const SignInContext = createContext<(() => void) | null>(null)

export function useBeginSignIn(): () => void {
  const provided = useContext(SignInContext)
  const location = useLocation()
  const fallback = useCallback(
    () => startGoogleSignIn(location.pathname + location.search),
    [location.pathname, location.search],
  )
  return provided ?? fallback
}
