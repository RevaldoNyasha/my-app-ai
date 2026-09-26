import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { LLM_USAGE_EVENT } from '@/lib/api'
import { fetchLlmUsage } from '@/services/usageService'
import type { LlmUsage } from '@/services/usageService'

const number = new Intl.NumberFormat()

function describeWait(usage: LlmUsage): string {
  if (!usage.retryAfter) return ''
  if (usage.retryAfter < 120) return ` Try again in about ${usage.retryAfter} s.`
  if (usage.retryAt) {
    const at = new Date(usage.retryAt).toLocaleString([], {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
    return ` Our tracked window frees up around ${at}.`
  }
  return ''
}

/**
 * Development-only bar showing how much of the Groq allowance is used, so the
 * free quota is never spent by surprise. Updated after every answer.
 */
export function LlmUsageIndicator() {
  const { isAuthenticated } = useAuth()
  const [usage, setUsage] = useState<LlmUsage | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    fetchLlmUsage()
      .then((report) => {
        if (!cancelled) setUsage(report)
      })
      .catch(() => undefined) // the indicator is optional
    const onUsage = (event: Event) => setUsage((event as CustomEvent<LlmUsage>).detail)
    window.addEventListener(LLM_USAGE_EVENT, onUsage)
    return () => {
      cancelled = true
      window.removeEventListener(LLM_USAGE_EVENT, onUsage)
    }
  }, [isAuthenticated])

  if (!usage || !usage.metered || !usage.requests || !usage.tokens) return null

  const tone = usage.blocked
    ? 'border-red-200 bg-red-50 text-red-800'
    : usage.warning
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-ink-100 bg-canvas text-ink-500'

  return (
    <div className={`border-b px-4 py-1.5 text-[0.72rem] ${tone}`} role="status">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
        <span className="font-semibold">Groq (dev)</span>
        <span>
          Requests: {number.format(usage.requests.today)} / {number.format(usage.requests.dailyLimit)}
        </span>
        <span>
          Tokens: {number.format(usage.tokens.today)} / {number.format(usage.tokens.dailyLimit)}
        </span>
        <span className="opacity-70">
          this minute: {usage.requests.minute}/{usage.requests.minuteLimit} req ·{' '}
          {number.format(usage.tokens.minute)}/{number.format(usage.tokens.minuteLimit)} tok
        </span>
      </div>
      {usage.blocked && usage.message ? (
        <p className="mt-0.5 font-medium">
          {usage.message}
          {describeWait(usage)}
        </p>
      ) : usage.warning && usage.warningMessage ? (
        <p className="mt-0.5 font-medium">⚠ {usage.warningMessage}</p>
      ) : null}
    </div>
  )
}
