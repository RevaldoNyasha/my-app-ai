/**
 * Browser side of "Sign in with Google" (API_CONTRACT.md §2.3).
 *
 * 1. `beginOAuthSignIn` asks the backend for the provider's consent URL, keeps
 *    the `state` and the current page in sessionStorage, and leaves the app.
 * 2. The provider sends the browser back to `/auth/callback/:provider`, where
 *    `OAuthCallback` checks the state and lets the backend finish the sign-in.
 */
import { startOAuthRequest } from '@/services/authService'
import type { OAuthProvider } from '@/types/auth'

const PENDING_KEY = 'researchmind.oauth.pending'

interface PendingSignIn {
  provider: OAuthProvider
  state: string
  returnTo: string
}

export async function beginOAuthSignIn(provider: OAuthProvider): Promise<void> {
  const { authorizationUrl, state } = await startOAuthRequest(provider)
  const pending: PendingSignIn = {
    provider,
    state,
    returnTo: window.location.pathname + window.location.search,
  }
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  window.location.assign(authorizationUrl)
}

/** The sign-in this tab started, removed so a reload cannot replay it. */
export function takePendingSignIn(): PendingSignIn | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    sessionStorage.removeItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingSignIn) : null
  } catch {
    return null
  }
}
