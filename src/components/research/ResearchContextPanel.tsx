import { useEffect, useState } from 'react'
import { CloseIcon, LayersIcon, TagIcon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/Badge'
import { listThemes } from '@/services/researchService'
import { useToast } from '@/hooks/useToast'
import type { ResearchProject, ResearchTheme } from '@/types/research'

interface ResearchContextPanelProps {
  project?: ResearchProject
  open: boolean
  onClose: () => void
}

export function ResearchContextPanel({ project, open, onClose }: ResearchContextPanelProps) {
  const { comingSoon } = useToast()
  const [themes, setThemes] = useState<ResearchTheme[]>([])

  useEffect(() => {
    let cancelled = false
    if (!project) {
      setThemes([])
      return
    }

    listThemes(project.id).then((result) => {
      if (!cancelled) setThemes(result)
    })

    return () => {
      cancelled = true
    }
  }, [project])

  if (!open) {
    return null
  }

  const stats = project
    ? [
        { label: 'Documents', value: project.documentCount },
        { label: 'Interviews', value: project.interviewCount },
        { label: 'Focus groups', value: project.focusGroupCount },
        { label: 'Participants', value: project.participantCount },
      ]
    : []

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] dark:bg-black/60 xl:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-[20rem] max-w-[88vw] shrink-0 flex-col border-l border-ink-100 bg-surface max-xl:shadow-raised xl:static xl:z-auto"
        style={{ animation: 'rise 200ms ease-out' }}
        aria-label="Research context"
      >
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-ink-100 px-4">
          <LayersIcon className="size-4 text-ink-400" />
          <h2 className="text-[0.82rem] font-semibold text-ink-900">Research Context</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close research context"
            className="ml-auto rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <section>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
              Current Project
            </p>
            <p className="mt-1.5 font-serif text-[1.05rem] font-semibold leading-snug tracking-tight text-ink-900">
              {project?.name ?? 'No project selected'}
            </p>
            {project ? (
              <p className="mt-1 text-[0.78rem] leading-6 text-ink-500">{project.description}</p>
            ) : null}
          </section>

          {stats.length > 0 ? (
            <section className="mt-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
                Data
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-ink-100 bg-canvas px-3 py-2"
                  >
                    <p className="text-lg font-semibold tabular-nums leading-tight text-ink-900">
                      {stat.value}
                    </p>
                    <p className="text-[0.68rem] text-ink-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-5">
            <div className="flex items-center gap-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
                Themes
              </p>
              <span className="text-[0.72rem] font-semibold tabular-nums text-ink-400">
                {themes.length}
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {themes.map((theme) => (
                <li key={theme.id}>
                  <button
                    type="button"
                    onClick={() => comingSoon('Reviewing theme evidence')}
                    className="w-full rounded-xl border border-ink-100 px-3 py-2 text-left transition-colors hover:border-brand-200 hover:bg-brand-50/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[0.82rem] font-medium text-ink-800">
                        {theme.name}
                      </span>
                      <span className="shrink-0 text-[0.68rem] tabular-nums text-ink-400">
                        {theme.excerptCount} excerpts
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-brand-400"
                        style={{ width: `${Math.round(theme.confidence * 100)}%` }}
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5">
            <div className="flex items-center gap-2">
              <TagIcon className="size-3.5 text-ink-400" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
                Codes
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project?.codes.map((code) => (
                <Badge key={code} tone="outline">
                  {code}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}
