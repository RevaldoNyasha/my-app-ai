import { Button } from '@/components/ui/Button'
import { CloseIcon, QuoteIcon, SourceIcon } from '@/components/ui/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { Evidence } from '@/types/research'

interface EvidencePanelProps {
  evidence: Evidence | null
  onClose: () => void
  projectName?: string
}

export function EvidencePanel({ evidence, onClose, projectName }: EvidencePanelProps) {
  const navigate = useNavigate()
  const { projectId } = useParams()

  if (!evidence) {
    return null
  }

  // Take the researcher to the file the quote came from. Without a documentId, search the
  // data for the source label, which is the file name written as prose ("Interview 03").
  const openSource = () => {
    const params = new URLSearchParams()
    if (evidence.documentId) {
      params.set('document', evidence.documentId)
      if (evidence.timestamp) params.set('t', evidence.timestamp)
    } else {
      params.set('q', evidence.source)
    }
    onClose()
    navigate(`/projects/${projectId}/data?${params.toString()}`)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-[24rem] max-w-[92vw] flex-col border-l border-ink-100 bg-surface shadow-raised"
        style={{ animation: 'rise 200ms ease-out' }}
        aria-label="Evidence detail"
      >
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-ink-100 px-4">
          <SourceIcon className="size-4 text-ink-300" />
          <h2 className="text-[0.82rem] font-semibold text-ink-900">Evidence</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence"
            className="ml-auto rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
            Source
          </p>
          <p className="mt-1 font-serif text-lg font-semibold tracking-tight text-ink-900">
            {evidence.source}
          </p>
          {projectName ? (
            <p className="mt-0.5 text-[0.76rem] text-ink-500">{projectName}</p>
          ) : null}

          <section className="mt-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
              Original Evidence
            </p>
            <blockquote className="relative mt-2 rounded-2xl border border-ink-100 bg-canvas px-4 py-4">
              <QuoteIcon className="absolute right-3 top-3 size-5 text-ink-300" />
              <p className="font-serif text-[0.95rem] leading-7 text-ink-800 italic">
                {evidence.quote}
              </p>
            </blockquote>
          </section>
        </div>

        <footer className="shrink-0 border-t border-ink-100 bg-ink-50/60 px-4 py-3">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            disabled={!projectId}
            onClick={openSource}
          >
            <SourceIcon className="size-4" />
            Open source
          </Button>
          <p className="mt-2 text-center text-[0.68rem] text-ink-400">
            Opens {evidence.source} in your data.
          </p>
        </footer>
      </aside>
    </>
  )
}
