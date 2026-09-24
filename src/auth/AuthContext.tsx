import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface AuthUser {
  name: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (name: string, email: string) => void
  logout: () => void
  usageCount: number
  recordUsage: () => void
  loginOpen: boolean
  openLogin: () => void
  closeLogin: () => void
}

export const AUTH_USER_KEY = 'researchmind.auth.user'
const USAGE_KEY = 'researchmind.usage.count'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  })
  const [loginOpen, setLoginOpen] = useState(false)
  const [usageCount, setUsageCount] = useState(() => {
    const raw = localStorage.getItem(USAGE_KEY)
    const parsed = raw ? Number(raw) : 0
    return Number.isFinite(parsed) ? parsed : 0
  })

  const login = useCallback((name: string, email: string) => {
    const value = { name, email }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(value))
    setUser(value)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_USER_KEY)
    setUser(null)
  }, [])

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
      logout,
      usageCount,
      recordUsage,
      loginOpen,
      openLogin,
      closeLogin,
    }),
    [user, login, logout, usageCount, recordUsage, loginOpen, openLogin, closeLogin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}