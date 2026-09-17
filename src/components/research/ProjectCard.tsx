import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/format'
import type { ResearchProject } from '@/types/research'

export function ProjectCard({ project }: { project: ResearchProject }) {
  const metrics = [
    { label: 'interviews', value: project.interviewCount },
    { label: 'focus groups', value: project.focusGroupCount },
    { label: 'documents', value: project.documentCount },
  ]

  return (
    <Link
      to={`/projects/${project.id}/chat`}
      className="group flex flex-col rounded-2xl border border-ink-200 bg-surface p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-panel"
    >
      <div className="flex items-start justify-between gap-3">
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
        {project.description}
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
  )
}
