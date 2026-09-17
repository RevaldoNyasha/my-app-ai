import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  /** Set to false for pages that manage their own scrolling (e.g. chat). */
  scroll?: boolean
  className?: string
}

export function PageContainer({ children, scroll = true, className = '' }: PageContainerProps) {
  return (
    <div className={`h-full min-h-0 ${scroll ? 'overflow-y-auto' : 'overflow-hidden'}`}>
      <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 ${className}`}>
        {children}
      </div>
    </div>
  )
}

interface PageHeadingProps {
  title: string
  description?: string
  actions?: ReactNode
  eyebrow?: string
}

export function PageHeading({ title, description, actions, eyebrow }: PageHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-brand-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-900 sm:text-[1.7rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[0.86rem] leading-6 text-ink-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

interface SectionHeadingProps {
  title: string
  action?: ReactNode
  className?: string
}

export function SectionHeading({ title, action, className = '' }: SectionHeadingProps) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 ${className}`}>
      <h2 className="text-[0.92rem] font-semibold tracking-tight text-ink-900">{title}</h2>
      {action}
    </div>
  )
}
