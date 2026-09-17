import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SparkleIcon, CloseIcon } from '@/components/ui/icons'
import { ToastContext, type Toast, type ToastOptions } from '@/context/toast'

const DEFAULT_DURATION = 3400
const MAX_VISIBLE = 3

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-5"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-ink-200 bg-surface px-4 py-3 shadow-raised"
          style={{ animation: 'rise 180ms ease-out' }}
        >
          <SparkleIcon className="mt-0.5 size-4 shrink-0 text-brand-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.82rem] font-semibold text-ink-900">{toast.title}</p>
            {toast.description ? (
              <p className="mt-0.5 text-[0.74rem] leading-5 text-ink-500">{toast.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="-mr-1 -mt-0.5 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, number>())

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (options: ToastOptions, duration = DEFAULT_DURATION) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((previous) => [...previous.slice(-(MAX_VISIBLE - 1)), { id, ...options }])

      const timer = window.setTimeout(() => dismissToast(id), duration)
      timers.current.set(id, timer)
    },
    [dismissToast],
  )

  const comingSoon = useCallback(
    (feature: string) => {
      showToast({
        title: `${feature} is coming soon`,
        description: 'This part of ResearchMind is not wired up in the frontend prototype yet.',
      })
    },
    [showToast],
  )

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
      pending.clear()
    }
  }, [])

  const value = useMemo(
    () => ({ showToast, comingSoon, dismissToast }),
    [showToast, comingSoon, dismissToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}
