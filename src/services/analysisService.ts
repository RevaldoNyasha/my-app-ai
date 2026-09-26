import { ApiError, apiRequest } from '@/lib/api'
import type { ProjectAnalysis } from '@/types/research'

const projectPath = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`

/** `GET /projects/{id}/analysis` — `null` when the project has not been analysed (404). */
export async function getAnalysis(projectId: string): Promise<ProjectAnalysis | null> {
  try {
    return await apiRequest<ProjectAnalysis>(`${projectPath(projectId)}/analysis`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** `POST /projects/{id}/analyze` — start (or redo) the analysis in the background. */
export function requestAnalysis(projectId: string): Promise<ProjectAnalysis> {
  return apiRequest<ProjectAnalysis>(`${projectPath(projectId)}/analyze`, { method: 'POST' })
}
