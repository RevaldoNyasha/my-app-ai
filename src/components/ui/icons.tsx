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

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
  </Icon>
)

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

/** Pencil on a square: start a new chat. */
export const ComposeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V12" />
    <path d="M17.6 3.9a1.9 1.9 0 0 1 2.7 2.7L12.5 14.4l-3.4.8.8-3.4z" />
  </Icon>
)

export const HomeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
  </Icon>
)

export const FolderIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2.5h8A1.5 1.5 0 0 1 20.5 10v7A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17z" />
  </Icon>
)

export const DatabaseIcon = (props: IconProps) => (
  <Icon {...props}>
    <ellipse cx="12" cy="6" rx="7.5" ry="2.8" />
    <path d="M4.5 6v12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8V6" />
    <path d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />
  </Icon>
)

export const AnalysisIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 19.5h16" />
    <path d="M6.5 19.5v-6M11 19.5V8M15.5 19.5v-9M20 19.5V5" />
  </Icon>
)

export const ReportIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6.5 3.5h7L18.5 8v12.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
    <path d="M13.5 3.5V8h5" />
    <path d="M9 13h6M9 16.5h6" />
  </Icon>
)

export const ChatIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4.5 20.5l1.4-4.3A7.5 7.5 0 1 1 20 12.5z" />
  </Icon>
)

export const SettingsIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.05-.06a1.6 1.6 0 0 0-1.78-.32 1.6 1.6 0 0 0-.97 1.47V21a1.9 1.9 0 0 1-3.8 0v-.09A1.6 1.6 0 0 0 9.5 19.4a1.6 1.6 0 0 0-1.78.32l-.05.06a1.9 1.9 0 1 1-2.7-2.7l.06-.06A1.6 1.6 0 0 0 5.35 15a1.6 1.6 0 0 0-1.47-.98H3.8a1.9 1.9 0 0 1 0-3.8h.08A1.6 1.6 0 0 0 5.35 9.2a1.6 1.6 0 0 0-.32-1.78l-.06-.05a1.9 1.9 0 1 1 2.7-2.7l.05.06a1.6 1.6 0 0 0 1.78.32h.08a1.6 1.6 0 0 0 .97-1.47V3.8a1.9 1.9 0 0 1 3.8 0v.08a1.6 1.6 0 0 0 .97 1.47 1.6 1.6 0 0 0 1.78-.32l.05-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.05a1.6 1.6 0 0 0-.32 1.78v.08a1.6 1.6 0 0 0 1.47.97h.09a1.9 1.9 0 0 1 0 3.8h-.09A1.6 1.6 0 0 0 19.4 15z" />
  </Icon>
)

export const HelpIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.4a2.5 2.5 0 0 1 4.85.85c0 1.7-2.45 2.05-2.45 3.6" />
    <path d="M12 17.2h.01" />
  </Icon>
)

export const PanelIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M14.5 4.5v15" />
  </Icon>
)

export const PanelLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M9.5 4.5v15" />
  </Icon>
)

export const CardIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <path d="M6.5 14.5h3" />
  </Icon>
)

export const PaperclipIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M18.5 11.5 12 18a4.5 4.5 0 0 1-6.36-6.36l7.42-7.43a3 3 0 0 1 4.25 4.25l-7.43 7.42a1.5 1.5 0 0 1-2.12-2.12l6.72-6.71" />
  </Icon>
)

export const SendIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12 20 4l-4.5 16-3.8-6.2z" />
    <path d="m11.7 13.8 8.3-9.8" />
  </Icon>
)

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Icon>
)

export const FilterIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 6.5h16M7 12h10M10 17.5h4" />
  </Icon>
)

export const UploadIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 16V4.5M7.5 9 12 4.5 16.5 9" />
    <path d="M4.5 15.5v3a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-3" />
  </Icon>
)

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
  </Icon>
)

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9.5 6.5 5.5 5.5-5.5 5.5" />
  </Icon>
)

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 12h15M14 6.5l5.5 5.5L14 17.5" />
  </Icon>
)

export const ArrowLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19.5 12h-15M10 6.5 4.5 12 10 17.5" />
  </Icon>
)

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
  </Icon>
)

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const ExclamationIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.8v5M12 16.2h.01" />
  </Icon>
)

export const SparkleIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4.5 13.7 9.4 18.5 11l-4.8 1.6L12 17.5l-1.7-4.9L5.5 11l4.8-1.6z" />
    <path d="M18.5 5v3M17 6.5h3" />
  </Icon>
)

export const QuoteIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9.5 6.5C6.9 7.6 5.5 9.7 5.5 12.6v4.9h5v-6h-3c0-1.6.8-2.7 2.6-3.4zM18.5 6.5c-2.6 1.1-4 3.2-4 6.1v4.9h5v-6h-3c0-1.6.8-2.7 2.6-3.4z" />
  </Icon>
)

export const SourceIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6.5 3.5h7L18.5 8v12.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
    <path d="M13.5 3.5V8h5" />
  </Icon>
)

export const DownloadIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4.5V16M7.5 11.5 12 16l4.5-4.5" />
    <path d="M4.5 15.5v3a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-3" />
  </Icon>
)

export const EyeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </Icon>
)

export const UserIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M5 20c.7-3.4 3.5-5.4 7-5.4s6.3 2 7 5.4" />
  </Icon>
)

export const LayersIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m12 4 8 4.2-8 4.2-8-4.2z" />
    <path d="m4 12.5 8 4.2 8-4.2M4 16.4l8 4.2 8-4.2" />
  </Icon>
)

export const TagIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 11.4V5.5a1 1 0 0 1 1-1h5.9l8.1 8.1a1.4 1.4 0 0 1 0 2l-4.4 4.4a1.4 1.4 0 0 1-2 0z" />
    <path d="M8.2 8.2h.01" />
  </Icon>
)

export const ClockIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Icon>
)

export const GlobeIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5z" />
  </Icon>
)

export const MicrophoneIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="9.2" y="3.5" width="5.6" height="10" rx="2.8" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
  </Icon>
)

export const SunIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  </Icon>
)

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2z" />
  </Icon>
)

export const MonitorIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
    <path d="M9 20h6M12 16.5V20" />
  </Icon>
)

export const LogOutIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 5.5H6.5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 6.5 18.5H9" />
    <path d="M15.5 8.5 19 12l-3.5 3.5" />
    <path d="M19 12H10" />
  </Icon>
)

export const DotsIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </Icon>
)

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 6.5h17" />
    <path d="M8.5 6.5V5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1.5" />
    <path d="M6 6.5 6.8 19a1.5 1.5 0 0 0 1.5 1.4h7.4a1.5 1.5 0 0 0 1.5-1.4L18 6.5" />
    <path d="M10 10.5v6.5M14 10.5v6.5" />
  </Icon>
)

export const CaptionsIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <path d="M7 9.5h10M7 13h7M7 16.5h4" />
  </Icon>
)

export const RetryIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
    <path d="M20.5 3.5V8H16" />
  </Icon>
)
