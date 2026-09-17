/**
 * Shared domain models for ResearchMind AI.
 *
 * These interfaces are intentionally shaped like the payloads the future
 * FastAPI/Pydantic backend will return, so that swapping the mock service
 * layer (`src/services/researchService.ts`) for HTTP calls requires no
 * component redesign.
 */

export type DocumentStatus = 'processing' | 'processed' | 'failed'

export type DocumentKind =
  | 'interview'
  | 'focus_group'
  | 'survey'
  | 'notes'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'docx'
  | 'csv'

export interface ResearchProject {
  id: string
  name: string
  description: string
  /** Total uploaded files (transcripts, recordings, documents, datasets). */
  documentCount: number
  /** Distinct research participants across all data. */
  participantCount: number
  interviewCount: number
  focusGroupCount: number
  themes: string[]
  codes: string[]
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface ResearchDocument {
  id: string
  projectId: string
  name: string
  kind: DocumentKind
  /** Human readable file type, e.g. "Interview". */
  type: string
  extension: string
  fileSize: string
  status: DocumentStatus
  participantCount: number
  language: string
  uploadedAt: string
  updatedAt: string
}

export interface Participant {
  id: string
  label: string
  projectId: string
  age?: number
  location?: string
  interviewCount: number
}

export interface Evidence {
  id: string
  source: string
  participant: string
  timestamp?: string
  page?: number
  quote: string
  theme?: string
  code?: string
  documentId?: string
  language?: string
  relevance?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  projectId?: string
  evidence?: Evidence[]
}

export interface Conversation {
  id: string
  projectId: string
  title: string
  updatedAt: string
  preview: string
  messageCount: number
}

export interface ResearchCode {
  id: string
  name: string
  excerptCount: number
}

export interface ResearchTheme {
  id: string
  projectId: string
  name: string
  description: string
  /** Number of source documents contributing to the theme. */
  sourceCount: number
  /** Number of supporting excerpts. */
  excerptCount: number
  participantCount: number
  /** Model confidence in the theme, 0–1. */
  confidence: number
  codes: ResearchCode[]
}

export interface ThemeRelationship {
  id: string
  sourceThemeId: string
  targetThemeId: string
  /** Co-occurrence strength, 0–1. */
  strength: number
}

export interface ResearchReport {
  id: string
  projectId: string
  title: string
  summary: string
  createdAt: string
  sections: string[]
  status: 'draft' | 'final'
}

export interface DashboardStats {
  projects: number
  documents: number
  themes: number
  excerpts: number
}
