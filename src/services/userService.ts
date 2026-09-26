import { apiRequest } from '@/lib/api'
import type { AuthUser } from '@/types/auth'

export interface ProfileChanges {
  name?: string
  /** Empty clears it. */
  title?: string
  organization?: string
}

/** Settings-page preferences, saved on the account (the theme stays per device). */
export interface Preferences {
  autoTranscribe: boolean
  autoTranslate: boolean
  showEvidence: boolean
}

export const DEFAULT_PREFERENCES: Preferences = {
  autoTranscribe: true,
  autoTranslate: false,
  showEvidence: true,
}

export interface AccountSecurity {
  hasPassword: boolean
  providers: { provider: 'google' | 'github'; email: string | null; linkedAt: string }[]
}

/** `PATCH /users/me` */
export function updateProfile(changes: ProfileChanges): Promise<AuthUser> {
  return apiRequest<AuthUser>('/users/me', { method: 'PATCH', body: changes })
}

/** `GET /users/me/preferences` */
export function getPreferences(): Promise<Preferences> {
  return apiRequest<Preferences>('/users/me/preferences')
}

/** `PUT /users/me/preferences` — only the keys sent change. */
export function savePreferences(changes: Partial<Preferences>): Promise<Preferences> {
  return apiRequest<Preferences>('/users/me/preferences', { method: 'PUT', body: changes })
}

/** `GET /users/me/security` — password and linked Google / GitHub accounts. */
export function getSecurity(): Promise<AccountSecurity> {
  return apiRequest<AccountSecurity>('/users/me/security')
}

/** `PATCH /auth/password` — `currentPassword` is needed once the account has a password. */
export function changePassword(newPassword: string, currentPassword?: string): Promise<void> {
  return apiRequest<void>('/auth/password', {
    method: 'PATCH',
    body: { newPassword, currentPassword },
  })
}
