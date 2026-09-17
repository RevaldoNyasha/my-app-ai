import { documents } from '@/data/mockDocuments'
import { themeRelationships, themes } from '@/data/mockAnalysis'
import { mockResponses, seededMessages, type MockResponse } from '@/data/mockMessages'
import { conversations, dashboardStats, participants, projects } from '@/data/mockProjects'
import { reports } from '@/data/mockReports'
import type {
  ChatMessage,
  Conversation,
  DashboardStats,
  Participant,
  ResearchDocument,
  ResearchProject,
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

export async function listProjects(): Promise<ResearchProject[]> {
  await simulateLatency(200)
  return clone(projects)
}

export async function getProject(projectId: string): Promise<ResearchProject | undefined> {
  await simulateLatency(160)
  return clone(projects.find((project) => project.id === projectId))
}

export async function listDocuments(projectId?: string): Promise<ResearchDocument[]> {
  await simulateLatency(240)
  const result = projectId
    ? documents.filter((document) => document.projectId === projectId)
    : documents
  return clone(result)
}

export async function listThemes(projectId?: string): Promise<ResearchTheme[]> {
  await simulateLatency(220)
  const result = projectId ? themes.filter((theme) => theme.projectId === projectId) : themes
  return clone(result)
}

export async function listThemeRelationships(): Promise<ThemeRelationship[]> {
  await simulateLatency(160)
  return clone(themeRelationships)
}

export async function listReports(projectId?: string): Promise<ResearchReport[]> {
  await simulateLatency(200)
  const result = projectId
    ? reports.filter((report) => report.projectId === projectId)
    : reports
  return clone(result)
}

export async function listConversations(projectId?: string): Promise<Conversation[]> {
  await simulateLatency(180)
  const result = projectId
    ? conversations.filter((conversation) => conversation.projectId === projectId)
    : conversations
  return clone(result)
}

export async function listParticipants(projectId?: string): Promise<Participant[]> {
  await simulateLatency(160)
  const result = projectId
    ? participants.filter((participant) => participant.projectId === projectId)
    : participants
  return clone(result)
}

export async function getMessages(projectId: string): Promise<ChatMessage[]> {
  await simulateLatency(240)
  return clone(seededMessages.filter((message) => message.projectId === projectId))
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await simulateLatency(160)
  return clone(dashboardStats)
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

/** Simulates an upload. Files are never read or processed. */
export async function uploadDocuments(
  projectId: string,
  files: { name: string; size: number }[],
): Promise<ResearchDocument[]> {
  await simulateLatency(600)

  return files.map((file, index) => {
    const extension = file.name.split('.').pop()?.toUpperCase() ?? 'FILE'
    const extensionToKind: Record<string, ResearchDocument['kind']> = {
      PDF: 'pdf',
      DOCX: 'docx',
      CSV: 'csv',
      MP3: 'audio',
      WAV: 'audio',
      MP4: 'video',
    }

    return {
      id: `doc-upload-${Date.now()}-${index}`,
      projectId,
      name: file.name,
      kind: extensionToKind[extension] ?? 'notes',
      type: extension === 'MP3' || extension === 'WAV' ? 'Interview' : 'Research Notes',
      extension,
      fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      status: 'processing' as const,
      participantCount: 0,
      language: 'English',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
}
