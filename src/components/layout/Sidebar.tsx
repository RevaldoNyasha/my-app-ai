import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  AnalysisIcon,
  CardIcon,
  ChatIcon,
  CloseIcon,
  DatabaseIcon,
  FolderIcon,
  HelpIcon,
  HomeIcon,
  LogOutIcon,
  PlusIcon,
  ReportIcon,
  SettingsIcon,
  SparkleIcon,
} from '@/components/ui/icons'
import { listConversations } from '@/services/researchService'
import { useToast } from '@/hooks/useToast'
import type { Conversation } from '@/types/research'
import { formatRelativeTime, initials } from '@/lib/format'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/projects', label: 'Research Projects', icon: FolderIcon, end: false },
  { to: '/data', label: 'Research Data', icon: DatabaseIcon, end: false },
  { to: '/analysis', label: 'Analysis', icon: AnalysisIcon, end: false },
  { to: '/reports', label: 'Reports', icon: ReportIcon, end: false },
] as const

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { comingSoon } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    setUserMenuOpen(false)
    navigate('/')
  }

  const projectMatch = /^\/projects\/([^/]+)/.exec(location.pathname)
  const activeProjectId = projectMatch?.[1]
  const activeConversationId = new URLSearchParams(location.search).get('conversation')

  useEffect(() => {
    let cancelled = false
    listConversations().then((result) => {
      if (!cancelled) setConversations(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleNewChat = () => {
    const targetProject = activeProjectId ?? 'healthcare-access'
    navigate(`/projects/${targetProject}/chat?new=${Date.now()}`)
    onCloseMobile()
  }

  const isIconOnly = collapsed && !mobileOpen

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    [
      'group flex items-center gap-3 rounded-xl px-3 py-2 text-[0.84rem] font-medium transition-colors',
      isIconOnly ? 'justify-center px-0' : '',
      isActive
        ? 'bg-ink-100 text-ink-900'
        : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900',
    ].join(' ')

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] dark:bg-black/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={[
          'z-50 flex h-full shrink-0 flex-col border-r border-ink-100 bg-surface transition-[width,transform] duration-200 ease-out',
          isIconOnly ? 'w-[4.75rem]' : 'w-[17rem]',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-[17rem]',
          mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        ].join(' ')}
      >
        <div
          className={`flex h-14 items-center gap-2.5 border-b border-ink-100 ${isIconOnly ? 'justify-center px-2' : 'px-4'}`}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <SparkleIcon className="size-4.5" />
          </div>
          {!isIconOnly ? (
            <div className="min-w-0">
              <p className="truncate text-[0.86rem] font-semibold tracking-tight text-ink-900">
                ResearchMind AI
              </p>
              <p className="truncate text-[0.68rem] text-ink-400">Qualitative research assistant</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="ml-auto rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 lg:hidden"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        <div className={isIconOnly ? 'px-2 pt-3' : 'px-3 pt-3'}>
          <button
            type="button"
            onClick={handleNewChat}
            title="New Chat"
            className={`flex w-full items-center gap-2.5 rounded-xl border border-ink-200 bg-surface px-3 py-2.5 text-[0.84rem] font-medium text-ink-800 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 ${
              isIconOnly ? 'justify-center px-0' : ''
            }`}
          >
            <PlusIcon className="size-4 shrink-0" />
            {!isIconOnly ? <span>New Chat</span> : null}
          </button>
        </div>

        <nav className={`mt-4 space-y-0.5 ${isIconOnly ? 'px-2' : 'px-3'}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={itemClass}
              onClick={onCloseMobile}
            >
              <item.icon className="size-4.5 shrink-0" />
              {!isIconOnly ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        {!isIconOnly ? (
          <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
              Recent Chats
            </p>
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pb-2">
              {conversations.map((conversation) => {
                const isActive = activeConversationId === conversation.id
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      navigate(
                        `/projects/${conversation.projectId}/chat?conversation=${conversation.id}`,
                      )
                      onCloseMobile()
                    }}
                    className={[
                      'flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900',
                    ].join(' ')}
                  >
                    <ChatIcon className="mt-0.5 size-4 shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.82rem] font-medium">
                        {conversation.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] text-ink-400">
                        <span className="truncate">{formatRelativeTime(conversation.updatedAt)}</span>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className={`relative border-t border-ink-100 p-3 ${isIconOnly ? 'px-2' : ''}`} dir="ltr">
          <div className={`flex items-center gap-2.5 ${isIconOnly ? 'flex-col' : ''}`}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              aria-label="Account menu"
              className="flex shrink-0 items-center rounded-full transition-opacity hover:opacity-80"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-ink-800 text-[0.7rem] font-semibold text-white dark:bg-ink-100 dark:text-ink-800">
                {initials('Dr. T. Moyo')}
              </div>
            </button>

            {!isIconOnly ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8rem] font-medium text-ink-800">Dr. T. Moyo</p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide text-brand-700 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-300">
                  <span className="size-1 rounded-full bg-emerald-500" />
                  Researcher plan
                </span>
              </div>
            ) : null}
          </div>

          {userMenuOpen ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                aria-label="Account"
                className={[
                  'absolute bottom-full z-20 mb-1.5 w-56 origin-bottom-right overflow-hidden rounded-xl border border-ink-200 bg-surface py-1 shadow-raised',
                  isIconOnly ? 'left-1/2 right-0' : 'right-2',
                ].join(' ')}
              >
                <div className="border-b border-ink-100 px-3 py-2.5">
                  <p className="truncate text-[0.8rem] font-medium text-ink-800">Dr. T. Moyo</p>
                  <p className="truncate text-[0.7rem] text-ink-400">t.moyo@researchmind.ai</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false)
                    navigate('/settings')
                    onCloseMobile()
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[0.82rem] font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  <SettingsIcon className="size-4 shrink-0 text-ink-400" />
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false)
                    navigate('/subscription')
                    onCloseMobile()
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[0.82rem] font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  <CardIcon className="size-4 shrink-0 text-ink-400" />
                  Subscription
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false)
                    comingSoon('The help centre')
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[0.82rem] font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  <HelpIcon className="size-4 shrink-0 text-ink-400" />
                  Help
                </button>
                <div className="my-1 border-t border-ink-100" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[0.82rem] font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  <LogOutIcon className="size-4 shrink-0 text-ink-400" />
                  Log out
                </button>
              </div>
            </>
          ) : null}
        </div>
      </aside>
    </>
  )
}
