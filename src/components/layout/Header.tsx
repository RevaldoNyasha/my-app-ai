import { MenuIcon, MoonIcon, PanelLeftIcon, SunIcon } from '@/components/ui/icons'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  collapsed: boolean
  onToggleSidebar: () => void
  onOpenMobileSidebar: () => void
}

export function Header({ collapsed, onToggleSidebar, onOpenMobileSidebar }: HeaderProps) {
  const { resolved, toggle } = useTheme()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-100 bg-surface/80 px-3 backdrop-blur-sm sm:px-4">
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        aria-label="Open navigation"
        className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 lg:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 lg:inline-flex"
      >
        <PanelLeftIcon className="size-5" />
      </button>

      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[0.84rem] font-semibold tracking-tight text-ink-900">
          ResearchMind AI
        </span>
        <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 text-[0.68rem] font-medium text-brand-700 sm:inline-flex">
          <span className="size-1.5 rounded-full bg-brand-500" />
          Prototype
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={resolved === 'dark' ? 'Light theme' : 'Dark theme'}
          className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
        >
          {resolved === 'dark' ? (
            <SunIcon className="size-4.5" />
          ) : (
            <MoonIcon className="size-4.5" />
          )}
        </button>
      </div>
    </header>
  )
}
