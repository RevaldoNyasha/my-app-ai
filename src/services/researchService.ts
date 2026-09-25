import { themeRelationships, themes } from '@/data/mockAnalysis'
import { mockResponses, seededMessages, type MockResponse } from '@/data/mockMessages'
import { participants } from '@/data/mockProjects'
import { reports } from '@/data/mockReports'
import { isAuthenticated } from '@/auth/session'
import type {
  ChatMessage,
  Conversation,
  Participant,
  ResearchReport,
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

export async function listReports(projectId?: string): Promise<ResearchReport[]> {
  await simulateLatency(200)
  const result = projectId
    ? reports.filter((report) => report.projectId === projectId)
    : reports
  return onlyForUsers(result)
}

/**
 * Recent chats. Returns nothing until the backend has conversations
 * (`GET /projects/{id}/conversations`); the old mock list is gone.
 */
export async function listConversations(projectId?: string): Promise<Conversation[]> {
  void projectId
  return []
}

export async function listParticipants(projectId?: string): Promise<Participant[]> {
  await simulateLatency(160)
  const result = projectId
    ? participants.filter((participant) => participant.projectId === projectId)
    : participants
  return onlyForUsers(result)
}

export async function getMessages(projectId: string): Promise<ChatMessage[]> {
  await simulateLatency(240)
  if (!isAuthenticated()) return []
  return clone(seededMessages.filter((message) => message.projectId === projectId))
}

/** Matches a question against the mock response catalogue. */
function matchResponse(question: string): MockResponse {
  const normalized = question.toLowerCase()

  const matchers: { keywords: string[]; key: string }[] = [
    { keywords: ['compare', 'urban', 'rural', 'differ', 'difference'], key: 'compare participants' },
    { keywords: ['evidence', 'quote', 'quotes', 'source', 'supporting'], key: 'evidence' },
    { keywords: ['theme', 'themes', 'recurring', 'pattern'], key: 'themes' },
    { keywords: ['method', 'methodology', 'sample', 'approach'], key: 'methodology' },
    { keywords: ['barrier', 'barriers', 'access', 'challenge'], key: 'healthcare barriers' },
  ]

  const match = matchers.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  )

  return mockResponses[match?.key ?? 'healthcare barriers']
}

/**
 * Simulates the full round-trip of asking the research assistant a question.
 * Later this becomes `POST /projects/{id}/chat`.
 */
export async function sendChatMessage(
  projectId: string,
  question: string,
): Promise<ChatMessage> {
  await simulateLatency(900)
  const response = matchResponse(question)

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: response.content,
    createdAt: new Date().toISOString(),
    projectId,
    evidence: response.evidence,
  }
}
