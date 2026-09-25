import { ApiError, apiRequest } from '@/lib/api'
import { isAuthenticated } from '@/auth/session'
import type { ResearchProject } from '@/types/research'

/** Dispatched on `window` after a project is created or deleted, so lists can refresh. */
export const PROJECTS_CHANGED_EVENT = 'researchmind:projects-changed'

const announceChange = () => window.dispatchEvent(new Event(PROJECTS_CHANGED_EVENT))

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
export async function createProject(payload: CreateProjectPayload): Promise<ResearchProject> {
  const project = await apiRequest<ResearchProject>('/projects', { method: 'POST', body: payload })
  announceChange()
  return project
}

/** `DELETE /projects/{id}` — permanent; removes the project's documents too. */
export async function deleteProject(projectId: string): Promise<void> {
  await apiRequest<void>(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' })
  announceChange()
}
