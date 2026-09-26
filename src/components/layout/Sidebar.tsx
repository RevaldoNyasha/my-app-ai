import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  CardIcon,
  ChevronDownIcon,
  CloseIcon,
  ComposeIcon,
  FolderIcon,
  HelpIcon,
  LogOutIcon,
  PanelIcon,
  PanelLeftIcon,
  PlusIcon,
  SettingsIcon,
  SparkleIcon,
  UserIcon,
} from '@/components/ui/icons'
import { ProjectChats } from '@/components/layout/ProjectChats'
import { Avatar } from '@/components/settings/ProfileSection'
import { PROJECTS_CHANGED_EVENT, listProjects } from '@/services/projectService'
import { useAuth } from '@/auth/AuthContext'
import type { ResearchProject } from '@/types/research'
import { formatRelativeTime, initials } from '@/lib/format'

const RECENT_PROJECT_LIMIT = 8
/** Which recent projects the user opened or closed in the sidebar (projectId -> open). */
const EXPANDED_KEY = 'researchmind.sidebar.expandedProjects'

function readExpanded(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

const NAV_ITEMS = [
  { to: '/projects', label: 'Research Projects', icon: FolderIcon, end: false },
] as const

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
  onToggleCollapsed: () => void
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, openLogin, isAuthenticated } = useAuth()
  const [recentProjects, setRecentProjects] = useState<ResearchProject[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const displayName = user?.name ?? ''
  const displayEmail = user?.email ?? ''

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
    navigate('/')
  }

  const projectMatch = /^\/projects\/([^/]+)(\/chat)?/.exec(location.pathname)
  const activeProjectId = projectMatch?.[1]
  const onChatPage = Boolean(projectMatch?.[2])
  const searchParams = new URLSearchParams(location.search)
  const activeConversationId = onChatPage ? searchParams.get('conversation') : null
  const isNewChatActive = onChatPage && searchParams.has('new')

  // A project's chats show under it; the open project starts expanded.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(readExpanded)
  const isExpanded = (projectId: string) => expanded[projectId] ?? projectId === activeProjectId
  const toggleExpanded = (projectId: string) => {
    setExpanded((previous) => {
      const next = { ...previous, [projectId]: !isExpanded(projectId) }
      try {
        localStorage.setItem(EXPANDED_KEY, JSON.stringify(next))
      } catch {
        // not persisted: fine
      }
      return next
    })
  }

  // Re-fetch on navigation and whenever a project is created or deleted.
  useEffect(() => {
    let cancelled = false
    const load = () => {
      listProjects()
        .then((result) => {
          if (!cancelled) setRecentProjects(result.slice(0, RECENT_PROJECT_LIMIT))
        })
        .catch(() => undefined)
    }
    load()
    window.addEventListener(PROJECTS_CHANGED_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(PROJECTS_CHANGED_EVENT, load)
    }
  }, [isAuthenticated, location.pathname])

  const handleNewProject = () => {
    onCloseMobile()
    if (!isAuthenticated) {
      openLogin()
      return
    }
    // The Projects page opens its create modal when it sees `?new`.
    navigate('/projects?new=1')
  }

  const isIconOnly = collapsed && !mobileOpen

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    [
      'group flex items-center rounded-xl text-[0.84rem] font-medium transition-colors',
      isIconOnly ? 'mx-auto size-10 justify-center' : 'gap-3 px-3 py-2',
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
          className={`flex h-14 shrink-0 items-center border-b border-ink-100 ${isIconOnly ? 'justify-center' : 'gap-2.5 px-3'}`}
        >
          {isIconOnly ? (
            // Collapsed: the logo doubles as the expand button (icon swaps on hover).
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="group flex size-10 items-center justify-center rounded-xl text-ink-800 transition-colors hover:bg-ink-100"
            >
              <SparkleIcon className="size-4.5 group-hover:hidden" />
              <PanelIcon className="hidden size-4.5 text-ink-600 group-hover:block" />
            </button>
          ) : (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <SparkleIcon className="size-4.5 shrink-0 text-ink-800" />
                <div className="min-w-0">
                  <p className="truncate whitespace-nowrap text-[0.86rem] font-semibold tracking-tight text-ink-900">
                    ResearchMind AI
                  </p>
                  <p className="truncate whitespace-nowrap text-[0.68rem] text-ink-400">
                    Qualitative research assistant
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 lg:inline-flex"
              >
                <PanelLeftIcon className="size-4.5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="shrink-0 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 lg:hidden"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        <nav className={`mt-3 space-y-0.5 ${isIconOnly ? 'px-2' : 'px-3'}`}>
          {NAV_ITEMS.map((item) => (
            <div key={item.to} className="relative">
              <NavLink
                to={item.to}
                end={item.end}
                title={item.label}
                className={(state) => `${itemClass(state)} ${isIconOnly ? '' : 'pr-10'}`}
                onClick={onCloseMobile}
              >
                <item.icon className="size-4.5 shrink-0" />
                {!isIconOnly ? (
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                ) : null}
              </NavLink>
              {!isIconOnly && item.to === '/projects' ? (
                <button
                  type="button"
                  onClick={handleNewProject}
                  title="New project"
                  aria-label="New project"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-200/60 hover:text-ink-800"
                >
                  <PlusIcon className="size-4" />
                </button>
              ) : null}
            </div>
          ))}
          {isIconOnly ? (
            // Collapsed: no room beside the icon, so "new project" sits just below it.
            <button
              type="button"
              onClick={handleNewProject}
              title="New project"
              aria-label="New project"
              className="mx-auto flex size-10 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100/70 hover:text-ink-900"
            >
              <PlusIcon className="size-4.5" />
            </button>
          ) : null}
        </nav>

        {!isIconOnly ? (
          <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
              Recent Projects
            </p>
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pb-2">
              {recentProjects.length === 0 ? (
                <p className="px-3 py-1 text-[0.76rem] text-ink-400">No projects yet</p>
              ) : null}
              {recentProjects.map((project) => {
                const isActive = activeProjectId === project.id
                const open = isExpanded(project.id)
                return (
                  <div key={project.id}>
                    <div
                      className={[
                        'group flex w-full items-start rounded-xl transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-800'
                          : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900',
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/projects/${project.id}`)
                          onCloseMobile()
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className="flex min-w-0 flex-1 items-start gap-2.5 py-2 pl-3 text-left"
                      >
                        <FolderIcon className="mt-0.5 size-4 shrink-0 opacity-70" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.82rem] font-medium">
                            {project.name}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] text-ink-400">
                            <span className="truncate">
                              {project.documentCount}{' '}
                              {project.documentCount === 1 ? 'file' : 'files'} ·{' '}
                              {formatRelativeTime(project.updatedAt)}
                            </span>
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/projects/${project.id}/chat?new=${Date.now()}`)
                          onCloseMobile()
                        }}
                        aria-label={`New chat in ${project.name}`}
                        title="New chat"
                        className={[
                          'mt-1.5 shrink-0 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-200/60 hover:text-ink-800',
                          isActive && isNewChatActive ? 'bg-ink-200/60 text-ink-800' : '',
                        ].join(' ')}
                      >
                        <ComposeIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(project.id)}
                        aria-expanded={open}
                        aria-label={`${open ? 'Hide' : 'Show'} chats for ${project.name}`}
                        title={open ? 'Hide chats' : 'Show chats'}
                        className="mr-1.5 ml-0.5 mt-1.5 shrink-0 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-200/60 hover:text-ink-800"
                      >
                        <ChevronDownIcon
                          className={`size-4 transition-transform duration-150 ${open ? '' : '-rotate-90'}`}
                        />
                      </button>
                    </div>
                    {open ? (
                      <ProjectChats
                        projectId={project.id}
                        activeConversationId={isActive ? activeConversationId : null}
                        onNavigate={onCloseMobile}
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          // Collapsed: recent projects as initials badges, name on hover.
          <div className="mt-4 flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto border-t border-ink-100 px-2 pb-2 pt-3">
            {recentProjects.map((project) => {
              const isActive = activeProjectId === project.id
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  title={project.name}
                  aria-label={project.name}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'flex size-10 shrink-0 items-center justify-center rounded-xl text-[0.7rem] font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-ink-500 hover:bg-ink-100/70 hover:text-ink-900',
                  ].join(' ')}
                >
                  {initials(project.name)}
                </button>
              )
            })}
          </div>
        )}

        <div className={`relative border-t border-ink-100 p-3 ${isIconOnly ? 'px-2' : ''}`} dir="ltr">
          {user ? (
            <>
              <div className={`flex items-center gap-2.5 ${isIconOnly ? 'flex-col' : ''}`}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((value) => !value)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                  className="flex shrink-0 items-center rounded-full transition-opacity hover:opacity-80"
                >
                  <Avatar name={displayName} url={user.avatarUrl} />
                </button>

                {!isIconOnly ? (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8rem] font-medium text-ink-800">{displayName}</p>
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
                      isIconOnly ? 'left-2' : 'right-2',
                    ].join(' ')}
                  >
                    <div className="border-b border-ink-100 px-3 py-2.5">
                      <p className="truncate text-[0.8rem] font-medium text-ink-800">{displayName}</p>
                      <p className="truncate text-[0.7rem] text-ink-400">{displayEmail}</p>
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
                        navigate('/help')
                        onCloseMobile()
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
            </>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              aria-label="Log in"
              className={[
                'flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50',
                isIconOnly ? 'mx-auto size-10' : 'w-full px-3 py-2.5 text-[0.84rem]',
              ].join(' ')}
            >
              <UserIcon className="size-4 shrink-0 text-ink-400" />
              {!isIconOnly ? 'Log in' : null}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
