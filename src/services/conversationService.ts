import { announceLlmUsage, ApiError, apiRequest, apiStream } from '@/lib/api'
import { isAuthenticated } from '@/auth/session'
import type { ChatMessage, Conversation } from '@/types/research'

const conversationsPath = (projectId: string) =>
  `/projects/${encodeURIComponent(projectId)}/conversations`

const conversationPath = (projectId: string, conversationId: string) =>
  `${conversationsPath(projectId)}/${encodeURIComponent(conversationId)}`

/**
 * Dispatched on `window` when a project's chats change (a question created or
 * reordered one, or one was deleted), so the sidebar and the chat page stay in step.
 */
export const CONVERSATIONS_CHANGED_EVENT = 'researchmind:conversations-changed'

export interface ConversationsChangedDetail {
  projectId: string
  /** Set when a chat was deleted. */
  deletedId?: string
}

export function announceConversationsChanged(detail: ConversationsChangedDetail) {
  window.dispatchEvent(new CustomEvent(CONVERSATIONS_CHANGED_EVENT, { detail }))
}

/** `GET /projects/{id}/conversations` — most recently active first. */
export async function listConversations(projectId: string): Promise<Conversation[]> {
  if (!isAuthenticated()) return []
  return apiRequest<Conversation[]>(conversationsPath(projectId))
}

/** `POST /projects/{id}/conversations` — untitled chats are named after their first question. */
export function createConversation(projectId: string, title?: string): Promise<Conversation> {
  return apiRequest<Conversation>(conversationsPath(projectId), {
    method: 'POST',
    body: title ? { title } : {},
  })
}

/** `PATCH /projects/{id}/conversations/{conversationId}` */
export function renameConversation(
  projectId: string,
  conversationId: string,
  title: string,
): Promise<Conversation> {
  return apiRequest<Conversation>(conversationPath(projectId, conversationId), {
    method: 'PATCH',
    body: { title },
  })
}

/** `DELETE /projects/{id}/conversations/{conversationId}` — removes its messages too. */
export function deleteConversation(projectId: string, conversationId: string): Promise<void> {
  return apiRequest<void>(conversationPath(projectId, conversationId), { method: 'DELETE' })
}

/**
 * `POST /projects/{id}/chat` — ask the project assistant. Returns the answer;
 * its `conversationId` is where the exchange was saved (new when none was given).
 * Takes a few seconds to about a minute on the local model.
 */
export async function sendChatMessage(
  projectId: string,
  question: string,
  conversationId?: string | null,
): Promise<ChatMessage> {
  const { usage, ...message } = await apiRequest<ChatMessage & { usage?: unknown }>(
    `/projects/${encodeURIComponent(projectId)}/chat`,
    {
      method: 'POST',
      body: { question, projectId, conversationId: conversationId ?? undefined },
    },
  )
  announceLlmUsage(usage)
  return message
}

/**
 * `POST /projects/{id}/chat/stream` — ask the assistant and receive the answer
 * as it is written. `onToken` gets each new piece of text; the promise resolves
 * with the saved message (with `evidence` and `conversationId`).
 */
export async function streamChatMessage(
  projectId: string,
  question: string,
  conversationId: string | null,
  onToken: (text: string) => void,
): Promise<ChatMessage> {
  let finished: ChatMessage | null = null
  await apiStream(
    `/projects/${encodeURIComponent(projectId)}/chat/stream`,
    { question, projectId, conversationId: conversationId ?? undefined },
    (event, data) => {
      const payload = data as {
        text?: string
        message?: ChatMessage | string
        detail?: string
        usage?: unknown
      }
      if (event === 'token' && payload.text) onToken(payload.text)
      else if (event === 'done' && payload.message && typeof payload.message === 'object') {
        finished = payload.message
        announceLlmUsage(payload.usage)
      } else if (event === 'error') {
        announceLlmUsage(payload.usage)
        throw new ApiError(0, payload.detail ?? 'The answer failed')
      }
    },
  )
  if (!finished) throw new ApiError(0, 'The answer was cut off. Please try again.')
  return finished
}

/** `GET /projects/{id}/conversations/{conversationId}/messages` — oldest first. */
export async function listMessages(
  projectId: string,
  conversationId: string,
): Promise<ChatMessage[]> {
  if (!isAuthenticated()) return []
  return apiRequest<ChatMessage[]>(`${conversationPath(projectId, conversationId)}/messages`)
}
