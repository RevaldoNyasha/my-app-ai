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
  /** A structured `detail` object from the backend (e.g. the Groq limit details on 429). */
  details: Record<string, unknown> | null

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
    details: Record<string, unknown> | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.details = details
  }
}

/** Dispatched on `window` with the latest Groq usage report whenever the backend sends one. */
export const LLM_USAGE_EVENT = 'researchmind:llm-usage'

export function announceLlmUsage(usage: unknown) {
  if (usage && typeof usage === 'object') {
    window.dispatchEvent(new CustomEvent(LLM_USAGE_EVENT, { detail: usage }))
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

  // Structured details, e.g. `{ blocked, reason, message, retryAfter, usage }` when a
  // Groq development limit was reached.
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const details = detail as Record<string, unknown>
    announceLlmUsage(details.usage)
    const message =
      typeof details.message === 'string' ? details.message : `Request failed (${response.status})`
    return new ApiError(response.status, message, {}, details)
  }

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

/** Send a request with the auth header; throws `ApiError` for network or HTTP errors. */
async function send(
  path: string,
  options: RequestOptions & { accept?: string },
): Promise<Response> {
  const { method = 'GET', body, auth = true, accept = 'application/json' } = options
  const headers: Record<string, string> = { Accept: accept }

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
  return response
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/**
 * GET a file (e.g. a PDF export) with the auth header and hand it to the
 * browser as a download, named from `Content-Disposition` when present.
 */
export async function apiDownload(path: string, fallbackName: string): Promise<void> {
  const response = await send(path, { accept: '*/*' })
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? fallbackName
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Give the browser a moment to start the download before freeing the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * POST a JSON body and read a Server-Sent Events reply, calling `onEvent` for
 * each `event:`/`data:` block as it arrives. Errors before the stream starts are
 * thrown as `ApiError`, like `apiRequest`. (`EventSource` cannot POST or send
 * an Authorization header, so this reads the fetch body directly.)
 */
export async function apiStream(
  path: string,
  body: unknown,
  onEvent: (event: string, data: unknown) => void,
): Promise<void> {
  const response = await send(path, { method: 'POST', body, accept: 'text/event-stream' })
  if (!response.body) throw new ApiError(0, 'The server did not stream a response.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    let separator = buffer.indexOf('\n\n')
    while (separator !== -1) {
      const block = buffer.slice(0, separator)
      buffer = buffer.slice(separator + 2)
      dispatchSseBlock(block, onEvent)
      separator = buffer.indexOf('\n\n')
    }
    if (done) break
  }
  if (buffer.trim()) dispatchSseBlock(buffer, onEvent)
}

function dispatchSseBlock(block: string, onEvent: (event: string, data: unknown) => void) {
  let event = 'message'
  const dataLines: string[] = []
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
  }
  if (dataLines.length === 0) return
  const raw = dataLines.join('\n')
  let data: unknown = raw
  try {
    data = JSON.parse(raw)
  } catch {
    // not JSON: pass the text through
  }
  onEvent(event, data) // outside the try, so errors thrown by the handler propagate
}
