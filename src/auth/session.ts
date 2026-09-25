import { AUTH_USER_KEY } from '@/auth/AuthContext'
import { getToken } from '@/lib/api'

/** Synchronous check used by the mock service layer (no hooks allowed). */
export function isAuthenticated(): boolean {
  try {
    return localStorage.getItem(AUTH_USER_KEY) !== null && getToken() !== null
  } catch {
    return false
  }
}
