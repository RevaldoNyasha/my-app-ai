import { useRef, useState } from 'react'
import { Badge, Dot } from '@/components/ui/Badge'
import {
  CaptionsIcon,
  ClockIcon,
  DotsIcon,
  ExclamationIcon,
  ReportIcon,
  RetryIcon,
  SourceIcon,
  TrashIcon,
} from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'
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

function RowActions({
  document,
  onDelete,
  onRetry,
}: {
  document: ResearchDocument
  onDelete?: (document: ResearchDocument) => void
  onRetry?: (document: ResearchDocument) => void
}) {
  const { comingSoon, showToast } = useToast()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number }>()
  const isAudio = document.kind === 'audio'
  const isFailed = document.status === 'failed'

  const close = () => setOpen(false)

  const toggleMenu = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const menuHeight = isFailed ? 44 : 148
    const gap = 6
    const opensUp = rect.bottom + gap + menuHeight > window.innerHeight
    setMenuPos(
      opensUp
        ? { bottom: window.innerHeight - rect.top + gap, right: window.innerWidth - rect.right }
        : { top: rect.bottom + gap, right: window.innerWidth - rect.right },
    )
    setOpen((value) => !value)
  }

  const handleTranscript = () => {
    close()
    comingSoon('Generating a transcript')
  }

  const handleRetry = () => {
    close()
    if (onRetry) {
      onRetry(document)
    } else {
      showToast({ title: 'Retry is unavailable here' })
    }
  }

  const handleDelete = () => {
    close()
    if (onDelete) {
      onDelete(document)
    } else {
      showToast({ title: 'Delete is unavailable here' })
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label={`Actions for ${document.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Actions"
        className="flex size-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-800"
      >
        <DotsIcon className="size-4.5" />
      </button>

      {open && menuPos ? (
        <>
          <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
          <div
            role="menu"
            aria-label={`Actions for ${document.name}`}
            style={{
              top: menuPos.top,
              bottom: menuPos.bottom,
              right: menuPos.right,
            }}
            className="fixed z-50 w-48 overflow-hidden rounded-xl border border-ink-200 bg-surface py-1 shadow-raised"
          >
            {isFailed ? (
              <button
                type="button"
                role="menuitem"
                onClick={handleRetry}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                <RetryIcon className="size-4 shrink-0 text-ink-400" />
                Retry
              </button>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  disabled={!isAudio}
                  onClick={handleTranscript}
                  title={isAudio ? 'Generate a transcript' : 'Transcripts are only available for audio files'}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent disabled:hover:text-ink-300"
                >
                  <CaptionsIcon className="size-4 shrink-0 text-ink-400" />
                  Transcript
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    close()
                    comingSoon('Generating a report')
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  <ReportIcon className="size-4 shrink-0 text-ink-400" />
                  Report
                </button>
                <div className="my-1 border-t border-ink-100" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[0.82rem] font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <TrashIcon className="size-4 shrink-0 text-red-500" />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      ) : null}
    </>
  )
}

interface DataTableProps {
  documents: ResearchDocument[]
  showProjectColumn?: boolean
  projectNames?: Record<string, string>
  onDelete?: (document: ResearchDocument) => void
  onRetry?: (document: ResearchDocument) => void
}

export function DataTable({
  documents,
  showProjectColumn = false,
  projectNames = {},
  onDelete,
  onRetry,
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
              <th className="w-12 px-2 py-3 text-right text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-ink-500">
                <span className="sr-only">Actions</span>
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
                        {document.language
                          ? `${document.fileSize} · ${document.language}`
                          : document.fileSize}
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
                <td className="px-2 py-3 text-right">
                  <RowActions document={document} onDelete={onDelete} onRetry={onRetry} />
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
