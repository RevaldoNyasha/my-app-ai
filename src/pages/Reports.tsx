import { useCallback, useEffect, useState } from 'react'
import { PageContainer, PageHeading } from '@/components/layout/PageContainer'
import { GenerateReportModal } from '@/components/research/GenerateReportModal'
import { ReportViewer } from '@/components/research/ReportViewer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import {
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  ReportIcon,
  SparkleIcon,
  TrashIcon,
} from '@/components/ui/icons'
import { formatDate } from '@/lib/format'
import { ApiError } from '@/lib/api'
import {
  deleteReport,
  downloadReport,
  listReportTemplates,
  listReports,
  updateReport,
} from '@/services/reportService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/auth/AuthContext'
import type { ReportTemplate, ResearchReport } from '@/types/research'

const POLL_MS = 4000

interface ReportsPageProps {
  projectId?: string
}

function stateOf(report: ResearchReport) {
  return report.generation?.state ?? 'ready'
}

export function ReportsPage({ projectId }: ReportsPageProps) {
  const { showToast } = useToast()
  const { isAuthenticated, openLogin } = useAuth()
  const [reports, setReports] = useState<ResearchReport[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [viewing, setViewing] = useState<ResearchReport | null>(null)
  const [deleting, setDeleting] = useState<ResearchReport | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!projectId) return []
    const result = await listReports(projectId).catch(() => null)
    if (result) setReports(result)
    return result ?? []
  }, [projectId])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    load().finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    if (isAuthenticated) {
      listReportTemplates()
        .then((result) => {
          if (!cancelled) setTemplates(result)
        })
        .catch(() => undefined)
    }
    return () => {
      cancelled = true
    }
  }, [load, isAuthenticated])

  // Reports are written in the background: refresh while any is still being written.
  const writing = reports.some((report) => stateOf(report) === 'processing')
  useEffect(() => {
    if (!writing) return
    const timer = window.setInterval(() => void load(), POLL_MS)
    return () => window.clearInterval(timer)
  }, [writing, load])

  const openGenerate = () => {
    if (!isAuthenticated) {
      openLogin()
      return
    }
    setGenerateOpen(true)
  }

  const showError = (title: string, error: unknown) =>
    showToast({ title, description: error instanceof ApiError ? error.message : undefined })

  const exportReport = async (report: ResearchReport, format: 'pdf' | 'docx') => {
    if (!projectId) return
    setBusy(`${report.id}-${format}`)
    try {
      await downloadReport(projectId, report, format)
    } catch (error) {
      showError(`Could not export ${format.toUpperCase()}`, error)
    } finally {
      setBusy(null)
    }
  }

  const toggleFinal = async (report: ResearchReport) => {
    if (!projectId) return
    try {
      const updated = await updateReport(projectId, report.id, {
        status: report.status === 'final' ? 'draft' : 'final',
      })
      setReports((previous) => previous.map((item) => (item.id === updated.id ? updated : item)))
    } catch (error) {
      showError('Could not update the report', error)
    }
  }

  const confirmDelete = async () => {
    if (!projectId || !deleting) return
    setBusy(`${deleting.id}-delete`)
    try {
      await deleteReport(projectId, deleting.id)
      setReports((previous) => previous.filter((item) => item.id !== deleting.id))
      showToast({ title: 'Report deleted' })
    } catch (error) {
      showError('Could not delete the report', error)
    } finally {
      setBusy(null)
      setDeleting(null)
    }
  }

  return (
    <PageContainer>
      <PageHeading
        eyebrow={projectId ? 'Project reports' : 'All reports'}
        title="Reports"
        description="Thematic analyses, evidence summaries and comparisons written from your documents. Export them as PDF or Word for your write-up."
        actions={
          projectId ? (
            <Button onClick={openGenerate}>
              <SparkleIcon className="size-4" />
              Generate Report
            </Button>
          ) : null
        }
      />

      {!isLoading && reports.length === 0 ? (
        <EmptyState
          icon={<ReportIcon className="size-5" />}
          title="No reports yet"
          description={
            projectId
              ? 'Generate a report from a template to see it listed here.'
              : 'Open a project to generate and view its reports.'
          }
        />
      ) : (
        <div className="grid gap-3.5 lg:grid-cols-2">
          {reports.map((report) => {
            const state = stateOf(report)
            const ready = state === 'ready'
            return (
              <article
                key={report.id}
                className="flex flex-col rounded-2xl border border-ink-200 bg-surface p-5 transition-colors hover:border-brand-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <ReportIcon className="mt-0.5 size-4 shrink-0 text-ink-300" />
                    <div className="min-w-0">
                      <h3 className="font-serif text-[1.02rem] font-semibold leading-snug tracking-tight text-ink-900">
                        {report.title}
                      </h3>
                      <p className="mt-1 text-[0.72rem] text-ink-400">
                        Created {formatDate(report.createdAt)}
                        {report.documents
                          ? ` · ${report.documents.length} ${
                              report.documents.length === 1 ? 'document' : 'documents'
                            }`
                          : ''}
                      </p>
                    </div>
                  </div>
                  {state === 'processing' ? (
                    <Badge tone="brand">Writing…</Badge>
                  ) : state === 'failed' ? (
                    <Badge tone="danger">Failed</Badge>
                  ) : (
                    <Badge tone={report.status === 'final' ? 'success' : 'neutral'}>
                      {report.status === 'final' ? 'Final' : 'Draft'}
                    </Badge>
                  )}
                </div>

                {state === 'processing' ? (
                  <p className="mt-3 text-[0.82rem] leading-6 text-ink-500">
                    {report.generation?.progress ?? 'Waiting to start'}…
                  </p>
                ) : state === 'failed' ? (
                  <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[0.8rem] leading-6 text-rose-700">
                    {report.generation?.error ?? 'The report could not be written.'} Delete it and
                    generate again.
                  </p>
                ) : (
                  <p className="mt-3 text-[0.82rem] leading-6 text-ink-500">{report.summary}</p>
                )}

                <div className="mt-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
                    Sections
                  </p>
                  <p className="mt-1.5 text-[0.76rem] leading-6 text-ink-600">
                    {report.sections.join(' · ')}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!ready}
                    onClick={() => setViewing(report)}
                  >
                    <EyeIcon className="size-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!ready || busy === `${report.id}-pdf`}
                    onClick={() => void exportReport(report, 'pdf')}
                  >
                    <DownloadIcon className="size-4" />
                    {busy === `${report.id}-pdf` ? 'Exporting…' : 'Export PDF'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!ready || busy === `${report.id}-docx`}
                    onClick={() => void exportReport(report, 'docx')}
                  >
                    <DownloadIcon className="size-4" />
                    {busy === `${report.id}-docx` ? 'Exporting…' : 'Export DOCX'}
                  </Button>
                  <div className="ml-auto flex gap-1">
                    {ready ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void toggleFinal(report)}
                        title={report.status === 'final' ? 'Mark as draft' : 'Mark as final'}
                      >
                        <CheckIcon className="size-4" />
                        <span className="hidden sm:inline">
                          {report.status === 'final' ? 'Mark draft' : 'Mark final'}
                        </span>
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(report)}
                      aria-label="Delete report"
                      title="Delete report"
                      className="text-ink-500! hover:bg-red-50! hover:text-red-600!"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {projectId ? (
        <>
          <GenerateReportModal
            open={generateOpen}
            projectId={projectId}
            templates={templates}
            onClose={() => setGenerateOpen(false)}
            onCreated={(report) => {
              setGenerateOpen(false)
              setReports((previous) => [report, ...previous])
              showToast({
                title: 'Report started',
                description: 'It is being written in the background; this page updates by itself.',
              })
            }}
          />
          <ReportViewer
            projectId={projectId}
            report={viewing}
            onClose={() => setViewing(null)}
            onExport={(report, format) => void exportReport(report, format)}
          />
        </>
      ) : null}

      <Modal
        open={deleting !== null}
        onClose={() => busy === null && setDeleting(null)}
        title="Delete report?"
        description={deleting ? `“${deleting.title}” will be deleted.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)} disabled={busy !== null}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirmDelete()}
              disabled={busy !== null}
              className="bg-red-600! text-white! hover:bg-red-700!"
            >
              {busy ? 'Deleting…' : 'Delete report'}
            </Button>
          </>
        }
      >
        <p className="text-[0.85rem] leading-6 text-ink-600">
          Your project's documents are not affected.
        </p>
      </Modal>
    </PageContainer>
  )
}
