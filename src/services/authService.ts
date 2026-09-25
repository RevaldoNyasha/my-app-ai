import { apiRequest } from '@/lib/api'
import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

/** `POST /auth/login` */
export function loginRequest(payload: LoginPayload): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', { method: 'POST', body: payload, auth: false })
}

/** `POST /auth/register` */
export function registerRequest(payload: RegisterPayload): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/register', { method: 'POST', body: payload, auth: false })
}

/** `GET /auth/me` — session restore. */
export function fetchCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me')
}
