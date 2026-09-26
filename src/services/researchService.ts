import { themeRelationships, themes } from '@/data/mockAnalysis'
import { participants } from '@/data/mockProjects'
import { isAuthenticated } from '@/auth/session'
import type {
  Participant,
  ResearchTheme,
  ThemeRelationship,
} from '@/types/research'

/**
 * Mock service layer.
 *
 * Every function below returns a Promise so that the call sites in the UI stay
 * identical when these implementations are replaced with FastAPI `fetch`
 * calls. Components must import from here rather than reading mock files
 * directly.
 */

const simulateLatency = (ms = 320) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const clone = <T,>(value: T): T => structuredClone(value)

/** First-time visitors (not logged in) start with an empty workspace. */
const onlyForUsers = <T,>(value: T): T => (isAuthenticated() ? clone(value) : ([] as T))

/* Projects and documents now come from the backend — see `projectService.ts` and `documentService.ts`. */

export async function listThemes(projectId?: string): Promise<ResearchTheme[]> {
  await simulateLatency(220)
  const result = projectId ? themes.filter((theme) => theme.projectId === projectId) : themes
  return onlyForUsers(result)
}

export async function listThemeRelationships(projectId?: string): Promise<ThemeRelationship[]> {
  await simulateLatency(160)
  const result = projectId
    ? themeRelationships.filter((relationship) => {
        const source = themes.find((theme) => theme.id === relationship.sourceThemeId)
        const target = themes.find((theme) => theme.id === relationship.targetThemeId)
        return source?.projectId === projectId && target?.projectId === projectId
      })
    : themeRelationships
  return onlyForUsers(result)
}

/* Conversations now come from the backend — see `conversationService.ts`. */

export async function listParticipants(projectId?: string): Promise<Participant[]> {
  await simulateLatency(160)
  const result = projectId
    ? participants.filter((participant) => participant.projectId === projectId)
    : participants
  return onlyForUsers(result)
}

/* The assistant now answers through the backend — see `sendChatMessage` in `conversationService.ts`. */
