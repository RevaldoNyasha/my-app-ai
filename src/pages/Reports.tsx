import { useEffect, useState } from 'react'
import { PageContainer, PageHeading } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { DownloadIcon, EyeIcon, ReportIcon, SparkleIcon } from '@/components/ui/icons'
import { formatDate } from '@/lib/format'
import { listReports } from '@/services/researchService'
import { useToast } from '@/hooks/useToast'
import type { ResearchReport } from '@/types/research'

interface ReportsPageProps {
  projectId?: string
}

export function ReportsPage({ projectId }: ReportsPageProps) {
  const { comingSoon } = useToast()
  const [reports, setReports] = useState<ResearchReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    listReports(projectId).then((result) => {
      if (cancelled) return
      setReports(result)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  return (
    <PageContainer>
      <PageHeading
        eyebrow={projectId ? 'Project reports' : 'All reports'}
        title="Reports"
        description="Generated thematic analyses and evidence summaries. Export drafts for review or include them in your write-up."
        actions={
          <Button onClick={() => comingSoon('Report generation')}>
            <SparkleIcon className="size-4" />
            Generate Report
          </Button>
        }
      />

      {!isLoading && reports.length === 0 ? (
        <EmptyState
          icon={<ReportIcon className="size-5" />}
          title="No reports yet"
          description="Generate a report from your themes and evidence to see it listed here."
        />
      ) : (
        <div className="grid gap-3.5 lg:grid-cols-2">
          {reports.map((report) => (
            <article
              key={report.id}
              className="flex flex-col rounded-2xl border border-ink-200 bg-surface p-5 transition-colors hover:border-brand-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ReportIcon className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  <div className="min-w-0">
                    <h3 className="font-serif text-[1.02rem] font-semibold leading-snug tracking-tight text-ink-900">
                      {report.title}
                    </h3>
                    <p className="mt-1 text-[0.72rem] text-ink-400">
                      Created {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge tone={report.status === 'final' ? 'success' : 'neutral'}>
                  {report.status === 'final' ? 'Final' : 'Draft'}
                </Badge>
              </div>

              <p className="mt-3 text-[0.82rem] leading-6 text-ink-500">{report.summary}</p>

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
                  onClick={() => comingSoon('The report viewer')}
                >
                  <EyeIcon className="size-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => comingSoon('PDF export')}
                >
                  <DownloadIcon className="size-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => comingSoon('DOCX export')}
                >
                  <DownloadIcon className="size-4" />
                  Export DOCX
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
