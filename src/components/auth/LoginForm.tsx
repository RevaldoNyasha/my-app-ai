import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/AuthContext'
import { beginOAuthSignIn } from '@/auth/oauth'
import { ApiError } from '@/lib/api'
import type { OAuthProvider } from '@/types/auth'

function GoogleIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
      />
    </svg>
  )
}

function GithubIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.41-5.25 5.69.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.14 0 .3.2.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  )
}

type Mode = 'login' | 'register'

const MIN_PASSWORD_LENGTH = 8

const inputClass =
  'h-10 w-full rounded-xl border border-ink-200 bg-surface px-3 text-[0.86rem] text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="mt-1 block text-[0.72rem] text-red-600">{message}</span>
}

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isRegister = mode === 'register'

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setFieldErrors({})
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      if (isRegister) {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          organization: organization.trim() || undefined,
        })
      } else {
        await login({ email: email.trim(), password })
      }
      setPassword('')
      onSuccess?.()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message)
        setFieldErrors(caught.fieldErrors)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const [redirecting, setRedirecting] = useState<OAuthProvider | null>(null)

  const signInWith = async (provider: OAuthProvider) => {
    setRedirecting(provider)
    setError(null)
    try {
      await beginOAuthSignIn(provider) // leaves the page on success
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Something went wrong. Please try again.')
      setRedirecting(null)
    }
  }

  const canSubmit =
    email.trim().length > 0 &&
    (isRegister
      ? name.trim().length > 0 && password.length >= MIN_PASSWORD_LENGTH
      : password.length > 0)

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1 text-[0.8rem] font-medium">
        {(['login', 'register'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchMode(option)}
            aria-pressed={mode === option}
            className={`h-8 rounded-lg transition-colors ${
              mode === option ? 'bg-surface text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {option === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isRegister && (
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Dr. T. Moyo"
              autoComplete="name"
              className={inputClass}
            />
            <FieldError message={fieldErrors.name} />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="you@researchmind.ai"
            autoComplete="email"
            className={inputClass}
          />
          <FieldError message={fieldErrors.email} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder={isRegister ? `At least ${MIN_PASSWORD_LENGTH} characters` : '••••••••'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            className={inputClass}
          />
          <FieldError message={fieldErrors.password} />
        </label>

        {isRegister && (
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
              Organization <span className="font-normal text-ink-400">(optional)</span>
            </span>
            <input
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              placeholder="e.g. University of Zimbabwe"
              autoComplete="organization"
              className={inputClass}
            />
            <FieldError message={fieldErrors.organization} />
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-[0.76rem] text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={!canSubmit || submitting} className="mt-5 w-full">
        {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
      </Button>

      <div className="my-5 flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-400">
        <span className="h-px flex-1 bg-ink-200" />
        or
        <span className="h-px flex-1 bg-ink-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void signInWith('google')}
          disabled={redirecting !== null}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface px-2 text-[0.82rem] font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {redirecting === 'google' ? 'Opening Google…' : 'Sign in with Google'}
        </button>
        <button
          type="button"
          onClick={() => void signInWith('github')}
          disabled={redirecting !== null}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface px-2 text-[0.82rem] font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GithubIcon />
          {redirecting === 'github' ? 'Opening GitHub…' : 'Sign in with GitHub'}
        </button>
      </div>
    </form>
  )
}