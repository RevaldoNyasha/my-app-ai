import { useEffect, useState } from 'react'
import { SectionHeading } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { changePassword, getSecurity } from '@/services/userService'
import type { AccountSecurity } from '@/services/userService'

const MIN_PASSWORD_LENGTH = 8
const PROVIDER_LABELS = { google: 'Google', github: 'GitHub' } as const

const inputClass =
  'h-10 w-full rounded-xl border border-ink-200 bg-surface px-3 text-[0.86rem] text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400'

/** How the account signs in (password, Google, GitHub), and changing the password. */
export function SecuritySection() {
  const { showToast } = useToast()
  const [security, setSecurity] = useState<AccountSecurity | null>(null)
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getSecurity()
      .then((result) => {
        if (!cancelled) setSecurity(result)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const hasPassword = security?.hasPassword ?? true
  const mismatch = confirm.length > 0 && confirm !== next
  const canSave =
    !saving &&
    next.length >= MIN_PASSWORD_LENGTH &&
    confirm === next &&
    (!hasPassword || current.length > 0)

  const openEditor = () => {
    setCurrent('')
    setNext('')
    setConfirm('')
    setError(null)
    setEditing(true)
  }

  const save = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await changePassword(next, hasPassword ? current : undefined)
      setSecurity((previous) => (previous ? { ...previous, hasPassword: true } : previous))
      setEditing(false)
      showToast({ title: hasPassword ? 'Password changed' : 'Password added' })
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not change your password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
      <SectionHeading title="Sign-in & security" />
      {security === null ? (
        <p className="text-[0.8rem] text-ink-400">Loading…</p>
      ) : (
        <div className="divide-y divide-ink-100">
          <div className="flex items-center justify-between gap-4 pb-3.5">
            <div className="min-w-0">
              <p className="text-[0.86rem] font-medium text-ink-800">Password</p>
              <p className="mt-0.5 text-[0.76rem] text-ink-500">
                {hasPassword
                  ? 'You can sign in with your email and password.'
                  : 'No password yet: you sign in with Google or GitHub. Add one to also sign in with your email.'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={openEditor}>
              {hasPassword ? 'Change password' : 'Add password'}
            </Button>
          </div>
          {(['google', 'github'] as const).map((provider) => {
            const linked = security.providers.find((item) => item.provider === provider)
            return (
              <div key={provider} className="flex items-center justify-between gap-4 py-3.5 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[0.86rem] font-medium text-ink-800">
                    {PROVIDER_LABELS[provider]}
                  </p>
                  <p className="mt-0.5 truncate text-[0.76rem] text-ink-500">
                    {linked
                      ? `${linked.email ?? 'Connected'} · since ${formatDate(linked.linkedAt)}`
                      : hasPassword
                        ? // Password accounts are never linked automatically (see oauth.py).
                          `Not connected to this account.`
                        : `Sign in with ${PROVIDER_LABELS[provider]} using the same email to connect it.`}
                  </p>
                </div>
                <Badge tone={linked ? 'success' : 'outline'}>
                  {linked ? 'Connected' : 'Not connected'}
                </Badge>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={editing}
        onClose={() => !saving && setEditing(false)}
        title={hasPassword ? 'Change password' : 'Add a password'}
        description={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={!canSave}>
              {saving ? 'Saving…' : 'Save password'}
            </Button>
          </>
        }
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          {hasPassword ? (
            <label className="block">
              <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
                Current password
              </span>
              <input
                type="password"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </label>
          ) : null}
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">New password</span>
            <input
              type="password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
              Confirm new password
            </span>
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
            {mismatch ? (
              <span className="mt-1 block text-[0.72rem] text-red-600">Passwords do not match</span>
            ) : null}
          </label>
          {error ? (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[0.76rem] text-red-700">
              {error}
            </p>
          ) : null}
          <button type="submit" hidden />
        </form>
      </Modal>
    </section>
  )
}
