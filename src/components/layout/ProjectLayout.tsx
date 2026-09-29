import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  AnalysisIcon,
  ChatIcon,
  DatabaseIcon,
  FolderIcon,
  MenuIcon,
  ReportIcon,
} from '@/components/ui/icons'
import { Badge } from '@/components/ui/Badge'
import { EvidencePanel } from '@/components/research/EvidencePanel'
import { getProject } from '@/services/projectService'
import { useAuth } from '@/auth/AuthContext'
import { type ProjectOutletContext } from '@/hooks/useProjectContext'
import type { Evidence, ResearchProject } from '@/types/research'

const TABS = [
  { to: '.', label: 'Overview', icon: FolderIcon, end: true },
  { to: 'chat', label: 'Assistant', icon: ChatIcon, end: false },
  { to: 'data', label: 'Data', icon: DatabaseIcon, end: false },
  { to: 'analysis', label: 'Analysis', icon: AnalysisIcon, end: false },
  { to: 'reports', label: 'Reports', icon: ReportIcon, end: false },
] as const

export function ProjectLayout() {
  const { projectId } = useParams()
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<ResearchProject | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [evidence, setEvidence] = useState<Evidence | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    if (!projectId) {
      setProject(undefined)
      setIsLoading(false)
      return
    }

    getProject(projectId)
      .catch(() => undefined)
      .then((result) => {
        if (cancelled) return
        setProject(result)
        setIsLoading(false)
        if (!result && !isAuthenticated) {
          navigate('/projects', { replace: true })
        }
      })

    return () => {
      cancelled = true
    }
  }, [projectId, isAuthenticated, navigate])

  const handleSelectEvidence = useCallback((selected: Evidence) => setEvidence(selected), [])

  const refreshProject = useCallback(() => {
    getProject(projectId)
      .then((result) => {
        if (result) setProject(result)
      })
      .catch(() => undefined)
  }, [projectId])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-400">
        Loading project…
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="font-serif text-lg font-semibold text-ink-900">Project not found</p>
        <p className="text-[0.84rem] text-ink-500">
          This research project may have been removed or the link is incorrect.
        </p>
      </div>
    )
  }

  const context: ProjectOutletContext = {
    project,
    openEvidence: handleSelectEvidence,
    refreshProject,
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-ink-100 bg-surface/60 px-4 pb-3 pt-3.5 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openMobileSidebar}
                  aria-label="Open navigation"
                  className="-ml-1.5 rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 lg:hidden"
                >
                  <MenuIcon className="size-5" />
                </button>
                <h1 className="truncate font-serif text-[1.15rem] font-semibold tracking-tight text-ink-900">
                  {project.name}
                </h1>
                {project.status === 'archived' ? <Badge tone="neutral">Archived</Badge> : null}
              </div>
            </div>
          </div>

          <nav className="mt-3 flex gap-1.5 overflow-x-auto">
            {TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  [
                    'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors',
                    isActive
                      ? 'border-neutral-800 bg-neutral-800 text-white shadow-sm'
                      : 'border-transparent text-ink-900 hover:border-ink-300',
                  ].join(' ')
                }
              >
                <tab.icon className="size-4" />
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <Outlet context={context} />
        </div>
      </div>

      <EvidencePanel
        evidence={evidence}
        onClose={() => setEvidence(null)}
        projectName={project.name}
      />
    </div>
  )
}
