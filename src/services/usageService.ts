import { apiRequest } from '@/lib/api'

/** `GET /usage/groq`: the development Groq usage, against our own safety limits. */
export interface LlmUsage {
  provider: string
  model: string
  /** False with the local Ollama model: nothing to count. */
  metered: boolean
  requests?: { minute: number; minuteLimit: number; today: number; dailyLimit: number }
  tokens?: { minute: number; minuteLimit: number; today: number; dailyLimit: number }
  dailyPercent?: number
  warning?: boolean
  warningMessage?: string | null
  blocked?: boolean
  reason?: string | null
  message?: string | null
  /** Seconds until the limit frees up, when known. */
  retryAfter?: number | null
  retryAt?: string | null
}

export function fetchLlmUsage(): Promise<LlmUsage> {
  return apiRequest<LlmUsage>('/usage/groq')
}
