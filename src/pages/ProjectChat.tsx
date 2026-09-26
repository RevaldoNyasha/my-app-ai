import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { LlmUsageIndicator } from '@/components/chat/LlmUsageIndicator'
import { useProjectContext } from '@/hooks/useProjectContext'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/hooks/useToast'
import { ApiError } from '@/lib/api'
import {
  CONVERSATIONS_CHANGED_EVENT,
  announceConversationsChanged,
  listConversations,
  listMessages,
  streamChatMessage,
} from '@/services/conversationService'
import type { ConversationsChangedDetail } from '@/services/conversationService'
import type { ChatMessage } from '@/types/research'

export function ProjectChat() {
  const { project, openEvidence } = useProjectContext()
  const { isAuthenticated, usageCount, recordUsage, openLogin } = useAuth()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const conversationId = searchParams.get('conversation')
  const isNewChat = searchParams.has('new')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const requestRef = useRef(0)
  // A chat created by its first question is already on screen; don't reload it.
  const skipLoadForRef = useRef<string | null>(null)

  const openConversation = useCallback(
    (id: string | null, replace = false) => {
      setSearchParams(id ? { conversation: id } : { new: String(Date.now()) }, { replace })
    },
    [setSearchParams],
  )

  // The chat list itself lives in the sidebar; here we only need it to pick a chat.
  const fetchConversations = useCallback(
    () => listConversations(project.id).catch(() => []),
    [project.id],
  )

  // With no chat in the URL, open the project's most recent one.
  useEffect(() => {
    let cancelled = false
    fetchConversations().then((result) => {
      if (cancelled || conversationId || isNewChat) return
      if (result.length > 0) openConversation(result[0].id, true)
      else setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
    // Only on project/login changes; switching chats does not need a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, isAuthenticated])

  // Load the selected chat's messages.
  useEffect(() => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    if (conversationId && skipLoadForRef.current === conversationId) {
      skipLoadForRef.current = null
      return
    }
    setMessages([])
    setInput('')

    if (!conversationId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    listMessages(project.id, conversationId)
      .then((result) => {
        if (requestRef.current === requestId) setMessages(result)
      })
      .catch((error: unknown) => {
        if (requestRef.current !== requestId) return
        showToast({
          title: 'Could not open this chat',
          description: error instanceof ApiError ? error.message : undefined,
        })
        openConversation(null, true)
      })
      .finally(() => {
        if (requestRef.current === requestId) setIsLoading(false)
      })
  }, [project.id, conversationId, showToast, openConversation])

  // The open chat was deleted from the sidebar: move to the most recent remaining one.
  useEffect(() => {
    const onChanged = (event: Event) => {
      const { projectId, deletedId } = (event as CustomEvent<ConversationsChangedDetail>).detail
      if (projectId !== project.id || !deletedId || deletedId !== conversationId) return
      void fetchConversations().then((remaining) =>
        openConversation(remaining[0]?.id ?? null, true),
      )
    }
    window.addEventListener(CONVERSATIONS_CHANGED_EVENT, onChanged)
    return () => window.removeEventListener(CONVERSATIONS_CHANGED_EVENT, onChanged)
  }, [project.id, conversationId, fetchConversations, openConversation])

  const handleSend = useCallback(
    async (question?: string) => {
      const content = (question ?? input).trim()
      if (!content || isSending) return

      if (!isAuthenticated && usageCount >= 1) {
        openLogin()
        return
      }
      recordUsage()

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
        projectId: project.id,
      }

      // The answer streams into this placeholder as the model writes it.
      const streamId = `stream-${Date.now()}`
      const placeholder: ChatMessage = {
        id: streamId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        projectId: project.id,
      }

      setMessages((previous) => [...previous, userMessage, placeholder])
      setInput('')
      setIsSending(true)

      try {
        const answer = await streamChatMessage(project.id, content, conversationId, (text) => {
          setMessages((previous) =>
            previous.map((message) =>
              message.id === streamId ? { ...message, content: message.content + text } : message,
            ),
          )
        })
        // Swap the placeholder for the saved answer (with its evidence).
        setMessages((previous) =>
          previous.map((message) => (message.id === streamId ? answer : message)),
        )
        if (answer.conversationId && answer.conversationId !== conversationId) {
          // The first question created a chat: show it in the URL and the sidebar.
          skipLoadForRef.current = answer.conversationId
          openConversation(answer.conversationId, true)
        }
        // A new chat, or this one moving to the top: the sidebar reloads its list.
        announceConversationsChanged({ projectId: project.id })
      } catch (error) {
        // Nothing was saved: take the question (and any partial answer) back out
        // and let the user retry.
        setMessages((previous) =>
          previous.filter((message) => message.id !== userMessage.id && message.id !== streamId),
        )
        setInput(content)
        showToast({
          title: 'The assistant could not answer',
          description: error instanceof ApiError ? error.message : undefined,
        })
      } finally {
        setIsSending(false)
      }
    },
    [
      input,
      isSending,
      project.id,
      conversationId,
      isAuthenticated,
      usageCount,
      recordUsage,
      openLogin,
      openConversation,
      showToast,
    ],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {import.meta.env.DEV ? <LlmUsageIndicator /> : null}
      <div className="min-h-0 flex-1">
        <ChatWindow
          project={project}
          messages={messages}
          isLoading={isLoading}
          isSending={isSending}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onSelectEvidence={openEvidence}
        />
      </div>
    </div>
  )
}
