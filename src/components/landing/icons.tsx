import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IdeaIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 3.5h6l4 4V20.5H7z" />
    <path d="M13 3.5V8h4" />
    <path d="M9.1 12.7a1.9 1.9 0 1 1 1.3 1.85c-.5.18-.8.5-.8.9" />
    <path d="M9.9 17.9h.01" />
  </Icon>
)

export const BrainIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="2.4" />
    <path d="M9.1 9.1 7.2 7.2M14.9 9.1l1.9-1.9M9.1 14.9l-1.9 1.9M14.9 14.9l1.9 1.9" />
    <circle cx="7.2" cy="7.2" r="1.5" />
    <circle cx="16.8" cy="7.2" r="1.5" />
    <circle cx="7.2" cy="16.8" r="1.5" />
    <circle cx="16.8" cy="16.8" r="1.5" />
  </Icon>
)

export const ChartUpIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 19.5h15" />
    <path d="m7 15 3.2-3.2 2.6 1.9 4.7-6" />
    <circle cx="17.5" cy="7.5" r="1.6" />
  </Icon>
)

export const TargetIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.4" />
  </Icon>
)

export const UsersIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="8.4" r="3.2" />
    <path d="M3.5 19.6c.6-2.9 2.8-4.6 5.5-4.6s4.9 1.7 5.5 4.6" />
    <path d="M15.6 5.6a3.2 3.2 0 0 1 0 5.7M17.8 14.7c1.6.7 2.5 2.2 2.8 4.1" />
  </Icon>
)

export const LockIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
  </Icon>
)

export const PlayIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.8 8.9v6.2l5.2-3.1z" />
  </Icon>
)