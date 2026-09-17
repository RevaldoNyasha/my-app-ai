import { useId } from 'react'

export function LandingLogo({ className = 'size-8' }: { className?: string }) {
  const id = useId()
  const gradientId = `rm-gradient-${id}`

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8.5" fill={`url(#${gradientId})`} />
      <path
        d="M8 21.5 13 16l4 3 6-8.5"
        stroke="#04110c"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="23" cy="10.5" r="1.8" fill="#04110c" />
    </svg>
  )
}