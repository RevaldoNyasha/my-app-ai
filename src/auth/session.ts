import { AUTH_USER_KEY } from '@/auth/AuthContext'

/** Synchronous check used by the mock service layer (no hooks allowed). */
export function isAuthenticated(): boolean {
  try {
    return localStorage.getItem(AUTH_USER_KEY) !== null
  } catch {
    return false
  }
}