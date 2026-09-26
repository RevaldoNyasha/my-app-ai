import { useState } from 'react'
import { SectionHeading } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/hooks/useToast'
import { ApiError } from '@/lib/api'
import { formatDate, initials } from '@/lib/format'
import { updateProfile } from '@/services/userService'

const inputClass =
  'h-10 w-full rounded-xl border border-ink-200 bg-surface px-3 text-[0.86rem] text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400'

export function Avatar({ name, url, size = 'md' }: { name: string; url?: string | null; size?: 'md' | 'lg' }) {
  const [broken, setBroken] = useState(false)
  const box = size === 'lg' ? 'size-14 text-base' : 'size-8 text-[0.7rem]'
  if (url && !broken) {
    return (
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={`${box} shrink-0 rounded-full object-cover`}
      />
    )
  }
  return (
    <div
      className={`${box} flex shrink-0 items-center justify-center rounded-full bg-ink-800 font-semibold text-white dark:bg-ink-100 dark:text-ink-800`}
    >
      {initials(name)}
    </div>
  )
}

/** The signed-in researcher's profile, with an edit form (`PATCH /users/me`). */
export function ProfileSection() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  const openEditor = () => {
    setName(user.name)
    setTitle(user.title ?? '')
    setOrganization(user.organization ?? '')
    setError(null)
    setEditing(true)
  }

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      updateUser(
        await updateProfile({
          name: name.trim(),
          title: title.trim(),
          organization: organization.trim(),
        }),
      )
      setEditing(false)
      showToast({ title: 'Profile updated' })
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  const subtitle = [user.title, user.organization].filter(Boolean).join(' · ')

  return (
    <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
      <SectionHeading title="Researcher profile" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <Avatar name={user.name} url={user.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-[0.95rem] font-semibold text-ink-900">{user.name}</p>
            <p className="truncate text-[0.78rem] text-ink-500">{user.email}</p>
            <p className="mt-0.5 truncate text-[0.76rem] text-ink-500">
              {subtitle || (
                <span className="text-ink-400">Add your title and organization</span>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={openEditor}>
          Edit profile
        </Button>
      </div>
      <p className="mt-4 border-t border-ink-100 pt-3 text-[0.72rem] text-ink-400">
        Member since {formatDate(user.createdAt)}
      </p>

      <Modal
        open={editing}
        onClose={() => !saving && setEditing(false)}
        title="Edit profile"
        description="How you appear in ResearchMind."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save'}
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
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              autoComplete="name"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
              Title <span className="font-normal text-ink-400">(optional)</span>
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="e.g. Lead Researcher"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
              Organization <span className="font-normal text-ink-400">(optional)</span>
            </span>
            <input
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              maxLength={255}
              autoComplete="organization"
              placeholder="e.g. University of Zimbabwe"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">Email</span>
            <input value={user.email} disabled className={`${inputClass} opacity-60`} />
            <span className="mt-1 block text-[0.7rem] text-ink-400">
              Your email is your sign-in and cannot be changed here.
            </span>
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
