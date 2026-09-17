import type { ReactNode } from 'react'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'outline'

const tones: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300',
  outline: 'border border-ink-200 text-ink-600',
}

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.72rem] font-medium tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Dot({ tone = 'brand' }: { tone?: Tone }) {
  const colors: Record<Tone, string> = {
    neutral: 'bg-ink-400',
    brand: 'bg-brand-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    outline: 'bg-ink-400',
  }

  return <span className={`size-1.5 shrink-0 rounded-full ${colors[tone]}`} />
}
