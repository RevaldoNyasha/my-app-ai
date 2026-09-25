/**
 * Minimal HTTP client for the FastAPI backend.
 *
 * In development `/api` is proxied to the backend by `vite.config.ts`, so the
 * default base URL works without CORS. Set `VITE_API_BASE_URL` to call the API
 * directly instead (e.g. `http://localhost:8000/api/v1`).
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '')

export const TOKEN_KEY = 'researchmind.auth.token'

/** Dispatched on `window` when an authenticated request is rejected with 401. */
export const UNAUTHORIZED_EVENT = 'researchmind:unauthorized'

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

interface ValidationIssue {
  loc?: (string | number)[]
  msg?: string
}

/** Turns FastAPI's `{ detail }` body (a string or a validation list) into an ApiError. */
async function toApiError(response: Response): Promise<ApiError> {
  let detail: unknown
  try {
    detail = ((await response.json()) as { detail?: unknown }).detail
  } catch {
    detail = undefined
  }

  if (typeof detail === 'string') return new ApiError(response.status, detail)

  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of detail as ValidationIssue[]) {
      const field = issue.loc?.at(-1)
      if (typeof field === 'string' && issue.msg && !fieldErrors[field]) {
        fieldErrors[field] = issue.msg.replace(/^Value error, /, '')
      }
    }
    const first = Object.values(fieldErrors)[0]
    return new ApiError(response.status, first ?? 'Please check the form and try again.', fieldErrors)
  }

  return new ApiError(response.status, `Request failed (${response.status})`)
}

interface RequestOptions {
  method?: string
  body?: unknown
  /** Attach the stored bearer token. Defaults to true. */
  auth?: boolean
  /** Use this token instead of the stored one (e.g. while the session is being cleared). */
  token?: string
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const headers: Record<string, string> = { Accept: 'application/json' }

  // FormData sets its own multipart boundary, so only JSON bodies get a Content-Type.
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

  const token = auth ? (options.token ?? getToken()) : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Is the backend running?')
  }

  if (!response.ok) {
    // An expired or revoked token: let AuthContext sign the user out.
    if (response.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    throw await toApiError(response)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
