import { ApiError, apiRequest } from '@/lib/api'
import { isAuthenticated } from '@/auth/session'
import type { ResearchProject } from '@/types/research'

export interface CreateProjectPayload {
  name: string
  description?: string
}

/** `GET /projects` — newest `updatedAt` first. Guests get an empty workspace. */
export async function listProjects(): Promise<ResearchProject[]> {
  if (!isAuthenticated()) return []
  return apiRequest<ResearchProject[]>('/projects')
}

/** `GET /projects/{id}` — `undefined` when missing or not owned by the caller. */
export async function getProject(projectId?: string): Promise<ResearchProject | undefined> {
  if (!projectId || !isAuthenticated()) return undefined
  try {
    return await apiRequest<ResearchProject>(`/projects/${encodeURIComponent(projectId)}`)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 401)) return undefined
    throw error
  }
}

/** `POST /projects` */
export function createProject(payload: CreateProjectPayload): Promise<ResearchProject> {
  return apiRequest<ResearchProject>('/projects', { method: 'POST', body: payload })
}

/** `DELETE /projects/{id}` — permanent; removes the project's documents too. */
export function deleteProject(projectId: string): Promise<void> {
  return apiRequest<void>(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' })
}
