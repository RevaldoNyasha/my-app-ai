import { apiRequest } from '@/lib/api'
import { isAuthenticated } from '@/auth/session'
import type { ResearchDocument } from '@/types/research'

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

/** `DELETE /projects/{id}/documents/{documentId}` — removes the record and the stored file. */
export function deleteDocument(projectId: string, documentId: string): Promise<void> {
  return apiRequest<void>(`${documentsPath(projectId)}/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
  })
}
