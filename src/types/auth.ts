/** Mirrors the backend `UserResponse` (API_CONTRACT.md §2.1). */
export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  title: string | null
  organization: string | null
  avatarUrl: string | null
  createdAt: string
}

/** Returned by `POST /auth/login` and `POST /auth/register`. */
export interface AuthSession {
  user: AuthUser
  accessToken: string
  /** Seconds until `accessToken` expires. */
  expiresIn: number
}

export type OAuthProvider = 'google' | 'github'

/** Returned by `POST /auth/oauth/{provider}`. */
export interface OAuthStart {
  authorizationUrl: string
  state: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  organization?: string
}
