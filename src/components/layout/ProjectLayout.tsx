import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import {
  AnalysisIcon,
  ChatIcon,
  DatabaseIcon,
  FolderIcon,
  PanelIcon,
  ReportIcon,
} from '@/components/ui/icons'
import { Badge, Dot } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ResearchContextPanel } from '@/components/research/ResearchContextPanel'
import { EvidencePanel } from '@/components/research/EvidencePanel'
import { getProject } from '@/services/researchService'
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
  const [project, setProject] = useState<ResearchProject | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [contextOpen, setContextOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches,
  )
  const [evidence, setEvidence] = useState<Evidence | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    if (!projectId) {
      setProject(undefined)
      setIsLoading(false)
      return
    }

    getProject(projectId).then((result) => {
      if (!cancelled) {
        setProject(result)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  const handleSelectEvidence = useCallback((selected: Evidence) => setEvidence(selected), [])

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
    contextOpen,
    setContextOpen,
  }

  const meta = `${project.documentCount} documents · ${project.interviewCount} interviews · ${project.focusGroupCount} focus groups`

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-ink-100 bg-surface/60 px-4 pt-3.5 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-serif text-[1.15rem] font-semibold tracking-tight text-ink-900">
                  {project.name}
                </h1>
                {project.status === 'archived' ? (
                  <Badge tone="neutral">Archived</Badge>
                ) : (
                  <Badge tone="success">
                    <Dot tone="success" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-[0.76rem] text-ink-500">{meta}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setContextOpen(!contextOpen)}
              aria-pressed={contextOpen}
              className="shrink-0"
            >
              <PanelIcon className="size-4" />
              {contextOpen ? 'Hide context' : 'Research context'}
            </Button>
          </div>

          <nav className="-mb-px mt-3 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  [
                    'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[0.8rem] font-medium transition-colors',
                    isActive
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-ink-500 hover:border-ink-200 hover:text-ink-800',
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

      <ResearchContextPanel
        project={project}
        open={contextOpen}
        onClose={() => setContextOpen(false)}
      />

      <EvidencePanel
        evidence={evidence}
        onClose={() => setEvidence(null)}
        projectName={project.name}
      />
    </div>
  )
}
