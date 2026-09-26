import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { takePendingSignIn } from '@/auth/oauth'
import { SparkleIcon } from '@/components/ui/icons'
import { ApiError } from '@/lib/api'
import type { OAuthProvider } from '@/types/auth'

const PROVIDER_LABELS: Record<OAuthProvider, string> = { google: 'Google', github: 'GitHub' }

/**
 * Where Google / GitHub send the browser back after sign-in
 * (`/auth/callback/:provider?code=...&state=...`).
 */
export function OAuthCallback() {
  const { provider = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { completeOAuthSignIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  // The code works only once; React's development double-render must not spend it twice.
  const started = useRef(false)

  const label = PROVIDER_LABELS[provider as OAuthProvider] ?? 'your account'

  useEffect(() => {
    if (started.current) return
    started.current = true

    const pending = takePendingSignIn()
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (searchParams.get('error')) {
      // e.g. `access_denied` when the user pressed Cancel on the consent page.
      setError(`Sign in with ${label} was cancelled.`)
      return
    }
    if (!code || !state || !pending || pending.provider !== provider || pending.state !== state) {
      // Not a sign-in this tab started: never exchange a code we did not ask for.
      setError('This sign-in link is invalid or has already been used. Please try again.')
      return
    }

    completeOAuthSignIn(pending.provider, code, state)
      .then(() => navigate(pending.returnTo || '/projects', { replace: true }))
      .catch((caught: unknown) => {
        setError(
          caught instanceof ApiError ? caught.message : 'Something went wrong. Please try again.',
        )
      })
  }, [completeOAuthSignIn, label, navigate, provider, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <SparkleIcon className="mx-auto mb-4 block size-6 text-ink-300" />
        {error ? (
          <>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-900">
              Could not sign you in
            </h1>
            <p role="alert" className="mt-2 text-[0.86rem] leading-6 text-ink-500">
              {error}
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-ink-100 px-4 text-[0.84rem] font-medium text-ink-800 transition-colors hover:bg-ink-200"
            >
              Back to ResearchMind
            </Link>
          </>
        ) : (
          <p className="text-[0.9rem] text-ink-500">Signing you in with {label}…</p>
        )}
      </div>
    </div>
  )
}
