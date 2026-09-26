import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/ui/Markdown'
import { Modal } from '@/components/ui/Modal'
import { DownloadIcon } from '@/components/ui/icons'
import { ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { getReport } from '@/services/reportService'
import type { ResearchReport } from '@/types/research'

interface ReportViewerProps {
  projectId: string
  report: ResearchReport | null
  onClose: () => void
  onExport: (report: ResearchReport, format: 'pdf' | 'docx') => void
}

/** Read a generated report in the app, with its export buttons. */
export function ReportViewer({ projectId, report, onClose, onExport }: ReportViewerProps) {
  const [full, setFull] = useState<ResearchReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!report) return
    let cancelled = false
    setFull(null)
    setError(null)
    getReport(projectId, report.id)
      .then((result) => {
        if (!cancelled) setFull(result)
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof ApiError ? caught.message : 'Could not open the report.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [projectId, report])

  const documents = full?.documents ?? report?.documents ?? []

  return (
    <Modal
      open={report !== null}
      onClose={onClose}
      size="xl"
      title={report?.title ?? 'Report'}
      description={
        report
          ? `Created ${formatDate(report.createdAt)} · Based on ${documents.length} ${
              documents.length === 1 ? 'document' : 'documents'
            }`
          : undefined
      }
      footer={
        report ? (
          <>
            <Button variant="outline" size="sm" onClick={() => onExport(report, 'pdf')}>
              <DownloadIcon className="size-4" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport(report, 'docx')}>
              <DownloadIcon className="size-4" />
              Export DOCX
            </Button>
          </>
        ) : null
      }
    >
      {error ? (
        <p className="text-[0.84rem] text-red-700">{error}</p>
      ) : !full ? (
        <p className="text-[0.84rem] text-ink-400">Opening the report…</p>
      ) : (
        <>
          {documents.length > 0 ? (
            <p className="mb-4 text-[0.74rem] leading-5 text-ink-400">
              Sources: {documents.map((document) => document.name).join(', ')}
            </p>
          ) : null}
          <Markdown content={full.content ?? ''} />
          <p className="mt-6 border-t border-ink-100 pt-3 text-[0.7rem] text-ink-400">
            Written by {full.model ?? 'the AI model'} from the project's documents. AI-generated
            reports can contain mistakes; check important points against the sources.
          </p>
        </>
      )}
    </Modal>
  )
}
