import { Badge, Dot } from '@/components/ui/Badge'
import { ClockIcon, ExclamationIcon, SourceIcon } from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/format'
import type { DocumentStatus, ResearchDocument } from '@/types/research'

const STATUS_TONE: Record<DocumentStatus, 'success' | 'warning' | 'danger'> = {
  processed: 'success',
  processing: 'warning',
  failed: 'danger',
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
  processed: 'Processed',
  processing: 'Processing',
  failed: 'Failed',
}

function StatusPill({ status }: { status: DocumentStatus }) {
  if (status === 'processing') {
    return (
      <Badge tone="warning">
        <span
          className="size-1.5 rounded-full bg-amber-500"
          style={{ animation: 'pulse-dot 1.4s ease-in-out infinite' }}
        />
        {STATUS_LABEL[status]}
      </Badge>
    )
  }

  return (
    <Badge tone={STATUS_TONE[status]}>
      {status === 'failed' ? <ExclamationIcon className="size-3" /> : <Dot tone="success" />}
      {STATUS_LABEL[status]}
    </Badge>
  )
}

function TypeGlyph({ extension }: { extension: string }) {
  return (
    <span className="w-9 shrink-0 text-[0.62rem] font-semibold uppercase tracking-wide text-ink-400">
      {extension.slice(0, 4)}
    </span>
  )
}

interface DataTableProps {
  documents: ResearchDocument[]
  showProjectColumn?: boolean
  projectNames?: Record<string, string>
}

export function DataTable({
  documents,
  showProjectColumn = false,
  projectNames = {},
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-100 bg-canvas/70">
              <th className="px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-ink-500">
                File
              </th>
              <th className="px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-ink-500">
                Type
              </th>
              {showProjectColumn ? (
                <th className="px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-ink-500">
                  Project
                </th>
              ) : null}
              <th className="px-4 py-3 text-right text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-ink-500">
                Participants
              </th>
              <th className="px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-ink-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-ink-500">
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr
                key={document.id}
                className="border-b border-ink-100/80 transition-colors last:border-0 hover:bg-canvas/60"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <TypeGlyph extension={document.extension} />
                    <div className="min-w-0">
                      <p className="truncate text-[0.83rem] font-medium text-ink-800">
                        {document.name}
                      </p>
                      <p className="text-[0.7rem] text-ink-400">
                        {document.fileSize} · {document.language}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="outline">{document.type}</Badge>
                </td>
                {showProjectColumn ? (
                  <td className="px-4 py-3">
                    <span className="text-[0.8rem] text-ink-600">
                      {projectNames[document.projectId] ?? '—'}
                    </span>
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right text-[0.82rem] tabular-nums text-ink-700">
                  {document.participantCount || '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={document.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-ink-500">
                    <ClockIcon className="size-3.5 text-ink-300" />
                    {formatRelativeTime(document.updatedAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
          <SourceIcon className="size-5 text-ink-300" />
          <p className="text-[0.84rem] font-medium text-ink-700">No research data found</p>
          <p className="text-[0.78rem] text-ink-500">
            Try a different search or upload new research data.
          </p>
        </div>
      ) : null}
    </div>
  )
}
