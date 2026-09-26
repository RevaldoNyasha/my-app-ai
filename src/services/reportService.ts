import { apiDownload, apiRequest } from '@/lib/api'
import { isAuthenticated } from '@/auth/session'
import type { ReportTemplate, ReportType, ResearchReport } from '@/types/research'

const reportsPath = (projectId: string) => `/projects/${encodeURIComponent(projectId)}/reports`
const reportPath = (projectId: string, reportId: string) =>
  `${reportsPath(projectId)}/${encodeURIComponent(reportId)}`

/** `GET /report-templates` — the report types and their section outlines. */
export function listReportTemplates(): Promise<ReportTemplate[]> {
  return apiRequest<ReportTemplate[]>('/report-templates')
}

/** `GET /projects/{id}/reports` — newest first. */
export async function listReports(projectId: string): Promise<ResearchReport[]> {
  if (!isAuthenticated()) return []
  return apiRequest<ResearchReport[]>(reportsPath(projectId))
}

export interface CreateReportPayload {
  type: ReportType
  title?: string
  /** Headings for a custom report. */
  sections?: string[]
  /** Limit to these documents (default: every processed document). */
  documentIds?: string[]
}

/** `POST /projects/{id}/reports` — starts generation; poll until `generation.state` is done. */
export function createReport(projectId: string, payload: CreateReportPayload): Promise<ResearchReport> {
  return apiRequest<ResearchReport>(reportsPath(projectId), { method: 'POST', body: payload })
}

/** `GET /projects/{id}/reports/{reportId}` — with Markdown `content` once ready. */
export function getReport(projectId: string, reportId: string): Promise<ResearchReport> {
  return apiRequest<ResearchReport>(reportPath(projectId, reportId))
}

/** `PATCH /projects/{id}/reports/{reportId}` — rename, or mark final / draft. */
export function updateReport(
  projectId: string,
  reportId: string,
  changes: { title?: string; status?: 'draft' | 'final' },
): Promise<ResearchReport> {
  return apiRequest<ResearchReport>(reportPath(projectId, reportId), {
    method: 'PATCH',
    body: changes,
  })
}

/** `DELETE /projects/{id}/reports/{reportId}` */
export function deleteReport(projectId: string, reportId: string): Promise<void> {
  return apiRequest<void>(reportPath(projectId, reportId), { method: 'DELETE' })
}

/** `GET …/export?format=pdf|docx` — downloads the file. */
export function downloadReport(
  projectId: string,
  report: ResearchReport,
  format: 'pdf' | 'docx',
): Promise<void> {
  return apiDownload(`${reportPath(projectId, report.id)}/export?format=${format}`, `report.${format}`)
}
