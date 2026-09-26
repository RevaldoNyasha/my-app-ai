import { apiRequest } from '@/lib/api'
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  OAuthProvider,
  OAuthStart,
  RegisterPayload,
} from '@/types/auth'

/** `POST /auth/login` */
export function loginRequest(payload: LoginPayload): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', { method: 'POST', body: payload, auth: false })
}

/** `POST /auth/register` */
export function registerRequest(payload: RegisterPayload): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/register', { method: 'POST', body: payload, auth: false })
}

/** `POST /auth/oauth/{provider}` — where to send the browser to sign in. */
export function startOAuthRequest(provider: OAuthProvider): Promise<OAuthStart> {
  return apiRequest<OAuthStart>(`/auth/oauth/${provider}`, { method: 'POST', auth: false })
}

/** `GET /auth/callback/{provider}` — finish signing in with the code the provider sent back. */
export function finishOAuthRequest(
  provider: OAuthProvider,
  code: string,
  state: string,
): Promise<AuthSession> {
  const query = new URLSearchParams({ code, state })
  return apiRequest<AuthSession>(`/auth/callback/${provider}?${query}`, { auth: false })
}

/** `POST /auth/logout` — revokes `token` on the server so it can no longer be used. */
export function logoutRequest(token: string): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST', token })
}

/** `GET /auth/me` — session restore. */
export function fetchCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me')
}
