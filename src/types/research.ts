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
  /** Pre-formatted display string, e.g. "2.4 MB". */
  fileSize: string
  /** Exact size in bytes; only present on documents from the backend. */
  fileSizeBytes?: number
  status: DocumentStatus
  participantCount: number
  /** Detected language; `null` until the backend processes the file. */
  language: string | null
  /** Why processing failed; only set when `status` is `failed`. */
  processingError?: string | null
  /** What slow processing is doing, e.g. "Transcribing: 43%"; only while `processing`. */
  processingProgress?: string | null
  uploadedAt: string
  updatedAt: string
}

export interface TranscriptSegment {
  /** Seconds from the start of the recording. */
  start: number
  end: number
  text: string
}

/** A recording's timed transcript (`GET …/documents/{id}/transcript`). */
export interface DocumentTranscript {
  documentId: string
  language: string | null
  /** Seconds. */
  duration: number | null
  model: string | null
  segments: TranscriptSegment[]
  /** English translation, when "Translate transcripts to English" made one. */
  translation: TranscriptSegment[] | null
}

/** An AI summary of one document (`GET/POST …/documents/{id}/summary`). */
export interface DocumentSummary {
  documentId: string
  status: 'processing' | 'ready' | 'failed'
  /** Markdown; only set when `status` is `ready`. */
  content: string | null
  error: string | null
  model: string | null
  createdAt: string
  completedAt: string | null
}

/** A project's cross-document analysis (`POST …/analyze`, `GET …/analysis`). */
export interface ProjectAnalysis {
  projectId: string
  status: 'processing' | 'ready' | 'failed'
  /** Markdown with ## sections; only set when `status` is `ready`. */
  content: string | null
  error: string | null
  model: string | null
  /** e.g. "Reading documents (2 of 5): Interview_03.docx" while processing. */
  progress: string | null
  /** The documents the analysis covered. */
  documents: { id: string; name: string }[]
  createdAt: string
  completedAt: string | null
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
  /** Pseudonymous speaker label. Not shown: participants can't be identified reliably yet. */
  participant?: string
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
  /** Set on messages stored by the backend. */
  conversationId?: string
  evidence?: Evidence[] | null
}

export interface Conversation {
  id: string
  projectId: string
  title: string
  /** The conversation's first question. */
  preview: string
  messageCount: number
  createdAt?: string
  updatedAt: string
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

export type ReportType = 'thematic_analysis' | 'evidence_summary' | 'comparison' | 'custom'

export interface ReportGeneration {
  state: 'processing' | 'ready' | 'failed'
  /** e.g. "Reading documents (2 of 5)" while processing. */
  progress?: string | null
  error?: string | null
  startedAt: string
  completedAt?: string | null
}

export interface ResearchReport {
  id: string
  projectId: string
  title: string
  summary: string
  createdAt: string
  sections: string[]
  status: 'draft' | 'final'
  type?: ReportType
  documents?: { id: string; name: string }[]
  model?: string | null
  generation?: ReportGeneration
  /** Markdown with `## ` sections; only on `GET` one report, once ready. */
  content?: string | null
}

/** `GET /report-templates`: a report type and its section outline. */
export interface ReportTemplate {
  type: ReportType
  label: string
  description: string
  /** Fixed headings; empty when `customSections` (the user supplies them). */
  sections: string[]
  customSections: boolean
}
