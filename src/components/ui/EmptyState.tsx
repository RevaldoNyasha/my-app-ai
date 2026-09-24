import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-surface/60 px-6 py-12 text-center ${className}`}
    >
      {icon ? <div className="mb-3 text-ink-300">{icon}</div> : null}
      <p className="text-sm font-semibold text-ink-800">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-[0.83rem] leading-6 text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
