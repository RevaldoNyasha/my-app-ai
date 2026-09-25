import { Link } from 'react-router-dom'
import { ArrowRightIcon, TrashIcon } from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/format'
import type { ResearchProject } from '@/types/research'

interface ProjectCardProps {
  project: ResearchProject
  onDelete?: (project: ResearchProject) => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const metrics = [
    { label: 'interviews', value: project.interviewCount },
    { label: 'focus groups', value: project.focusGroupCount },
    { label: 'documents', value: project.documentCount },
  ]

  return (
    <div className="group relative">
      <Link
        to={`/projects/${project.id}/chat`}
        className="flex h-full flex-col rounded-2xl border border-ink-200 bg-surface p-5 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:border-brand-300 group-hover:shadow-panel"
      >
        <div className={`flex items-start justify-between gap-3 ${onDelete ? 'pr-8' : ''}`}>
          <h3 className="font-serif text-[1.05rem] font-semibold leading-snug tracking-tight text-ink-900">
            {project.name}
          </h3>
          {project.status === 'archived' ? (
            <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[0.66rem] font-medium text-ink-500">
              Archived
            </span>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-2 text-[0.82rem] leading-6 text-ink-500">
          {project.description || 'New research project. Upload data to begin analysis.'}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          {metrics.map((metric) => (
            <span key={metric.label} className="text-[0.78rem] text-ink-600">
              <span className="font-semibold tabular-nums text-ink-900">{metric.value}</span>{' '}
              {metric.label}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
          <span className="text-[0.72rem] text-ink-400">
            Last updated {formatRelativeTime(project.updatedAt)}
          </span>
          <span className="flex items-center gap-1 text-[0.72rem] font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
            Open project
            <ArrowRightIcon className="size-3.5" />
          </span>
        </div>
      </Link>

      {onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(project)}
          aria-label={`Delete ${project.name}`}
          title="Delete project"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-ink-400 transition-all hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 group-hover:-translate-y-0.5"
        >
          <TrashIcon className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
