import { ApiError, apiRequest } from '@/lib/api'
import { isAuthenticated } from '@/auth/session'
import type { DocumentSummary, DocumentTranscript, ResearchDocument } from '@/types/research'

const documentsPath = (projectId: string) => `/projects/${encodeURIComponent(projectId)}/documents`

/** `GET /projects/{id}/documents` — newest `uploadedAt` first. */
export async function listDocuments(projectId?: string): Promise<ResearchDocument[]> {
  if (!projectId || !isAuthenticated()) return []
  return apiRequest<ResearchDocument[]>(documentsPath(projectId))
}

/**
 * `POST /projects/{id}/documents` — multipart, one `files` part per file.
 * Responds `202` with a record for every accepted file, each `processing`.
 */
export function uploadDocuments(projectId: string, files: File[]): Promise<ResearchDocument[]> {
  const form = new FormData()
  for (const file of files) form.append('files', file, file.name)
  return apiRequest<ResearchDocument[]>(documentsPath(projectId), { method: 'POST', body: form })
}

/** `POST /projects/{id}/documents/{documentId}/reprocess` — queue a failed document again. */
export function reprocessDocument(projectId: string, documentId: string): Promise<ResearchDocument> {
  return apiRequest<ResearchDocument>(
    `${documentsPath(projectId)}/${encodeURIComponent(documentId)}/reprocess`,
    { method: 'POST' },
  )
}

const summaryPath = (projectId: string, documentId: string) =>
  `${documentsPath(projectId)}/${encodeURIComponent(documentId)}/summary`

/** `GET …/summary` — `null` when no summary has been generated yet (404). */
export async function getSummary(
  projectId: string,
  documentId: string,
): Promise<DocumentSummary | null> {
  try {
    return await apiRequest<DocumentSummary>(summaryPath(projectId, documentId))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** `POST …/summary` — start (or redo) a summary; it is generated in the background. */
export function requestSummary(projectId: string, documentId: string): Promise<DocumentSummary> {
  return apiRequest<DocumentSummary>(summaryPath(projectId, documentId), { method: 'POST' })
}

/** `GET …/transcript` — the timed transcript of an audio or video document. */
export function getTranscript(projectId: string, documentId: string): Promise<DocumentTranscript> {
  return apiRequest<DocumentTranscript>(
    `${documentsPath(projectId)}/${encodeURIComponent(documentId)}/transcript`,
  )
}

/** `DELETE /projects/{id}/documents/{documentId}` — removes the record and the stored file. */
export function deleteDocument(projectId: string, documentId: string): Promise<void> {
  return apiRequest<void>(`${documentsPath(projectId)}/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
  })
}
