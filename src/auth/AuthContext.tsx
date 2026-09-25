import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, TOKEN_KEY, UNAUTHORIZED_EVENT, getToken } from '@/lib/api'
import { fetchCurrentUser, loginRequest, registerRequest } from '@/services/authService'
import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
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

  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
    setExpiresAt(null)
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => startSession(await loginRequest(payload)),
    [startSession],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => startSession(await registerRequest(payload)),
    [startSession],
  )

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
        if (!cancelled && error instanceof ApiError && error.status === 401) logout()
      })
    return () => {
      cancelled = true
    }
  }, [logout])

  // Any authenticated request rejected with 401 means the session is gone.
  useEffect(() => {
    const handleUnauthorized = () => {
      if (!localStorage.getItem(TOKEN_KEY)) return
      logout()
      setLoginOpen(true)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [logout])

  // There is no refresh token yet, so sign out when the access token expires.
  useEffect(() => {
    if (expiresAt === null) return
    const timer = window.setTimeout(
      () => {
        logout()
        setLoginOpen(true)
      },
      Math.max(0, expiresAt - Date.now()),
    )
    return () => window.clearTimeout(timer)
  }, [expiresAt, logout])

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
      logout,
      usageCount,
      recordUsage,
      loginOpen,
      openLogin,
      closeLogin,
    }),
    [user, login, register, logout, usageCount, recordUsage, loginOpen, openLogin, closeLogin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
