import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, TOKEN_KEY, UNAUTHORIZED_EVENT, getToken } from '@/lib/api'
import {
  fetchCurrentUser,
  finishOAuthRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '@/services/authService'
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  OAuthProvider,
  RegisterPayload,
} from '@/types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  /** Finish a Google / GitHub sign-in with the code the provider sent back. */
  completeOAuthSignIn: (provider: OAuthProvider, code: string, state: string) => Promise<void>
  /** Show an updated profile (e.g. after editing it) everywhere, without signing in again. */
  updateUser: (user: AuthUser) => void
  logout: () => void
  usageCount: number
  recordUsage: () => void
  loginOpen: boolean
  openLogin: () => void
  closeLogin: () => void
}

/** Cached user, so the UI renders signed-in immediately while `/auth/me` confirms it. */
export const AUTH_USER_KEY = 'researchmind.auth.user'
const EXPIRES_AT_KEY = 'researchmind.auth.expiresAt'
const USAGE_KEY = 'researchmind.usage.count'

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredExpiry(): number | null {
  const raw = localStorage.getItem(EXPIRES_AT_KEY)
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    const expiresAt = readStoredExpiry()
    if (!raw || !getToken() || (expiresAt !== null && expiresAt <= Date.now())) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [expiresAt, setExpiresAt] = useState<number | null>(() =>
    readStoredUser() ? readStoredExpiry() : null,
  )
  const [loginOpen, setLoginOpen] = useState(false)
  const [usageCount, setUsageCount] = useState(() => {
    const raw = localStorage.getItem(USAGE_KEY)
    const parsed = raw ? Number(raw) : 0
    return Number.isFinite(parsed) ? parsed : 0
  })

  const startSession = useCallback((session: AuthSession) => {
    const nextExpiresAt = Date.now() + session.expiresIn * 1000
    localStorage.setItem(TOKEN_KEY, session.accessToken)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user))
    localStorage.setItem(EXPIRES_AT_KEY, String(nextExpiresAt))
    setUser(session.user)
    setExpiresAt(nextExpiresAt)
  }, [])

  /** Forget the session locally, e.g. when the server already rejected the token. */
  const clearSession = useCallback(() => {
    clearStoredSession()
    setUser(null)
    setExpiresAt(null)
  }, [])

  /** User-initiated sign out: revoke the token on the server, then forget it here. */
  const logout = useCallback(() => {
    const token = getToken()
    clearSession()
    localStorage.removeItem(USAGE_KEY)
    setUsageCount(0)
    // Fire and forget: the local session is already gone even if this fails.
    if (token) logoutRequest(token).catch(() => undefined)
  }, [clearSession])

  const login = useCallback(
    async (payload: LoginPayload) => startSession(await loginRequest(payload)),
    [startSession],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => startSession(await registerRequest(payload)),
    [startSession],
  )

  const completeOAuthSignIn = useCallback(
    async (provider: OAuthProvider, code: string, state: string) =>
      startSession(await finishOAuthRequest(provider, code, state)),
    [startSession],
  )

  const updateUser = useCallback((next: AuthUser) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next))
    setUser(next)
  }, [])

  // Confirm the cached session with the backend on load.
  useEffect(() => {
    if (!getToken()) {
      clearStoredSession()
      return
    }
    let cancelled = false
    fetchCurrentUser()
      .then((current) => {
        if (cancelled) return
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(current))
        setUser(current)
      })
      .catch((error: unknown) => {
        if (!cancelled && error instanceof ApiError && error.status === 401) clearSession()
      })
    return () => {
      cancelled = true
    }
  }, [clearSession])

  // Any authenticated request rejected with 401 means the session is gone.
  useEffect(() => {
    const handleUnauthorized = () => {
      if (!localStorage.getItem(TOKEN_KEY)) return
      clearSession()
      setLoginOpen(true)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [clearSession])

  // There is no refresh token yet, so sign out when the access token expires.
  useEffect(() => {
    if (expiresAt === null) return
    const timer = window.setTimeout(
      () => {
        clearSession()
        setLoginOpen(true)
      },
      Math.max(0, expiresAt - Date.now()),
    )
    return () => window.clearTimeout(timer)
  }, [expiresAt, clearSession])

  const recordUsage = useCallback(() => {
    setUsageCount((previous) => {
      const next = previous + 1
      localStorage.setItem(USAGE_KEY, String(next))
      return next
    })
  }, [])

  const openLogin = useCallback(() => setLoginOpen(true), [])
  const closeLogin = useCallback(() => setLoginOpen(false), [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      completeOAuthSignIn,
      updateUser,
      logout,
      usageCount,
      recordUsage,
      loginOpen,
      openLogin,
      closeLogin,
    }),
    [
      user,
      login,
      register,
      completeOAuthSignIn,
      updateUser,
      logout,
      usageCount,
      recordUsage,
      loginOpen,
      openLogin,
      closeLogin,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
