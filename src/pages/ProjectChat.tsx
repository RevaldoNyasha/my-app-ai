import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useProjectContext } from '@/hooks/useProjectContext'
import { useAuth } from '@/auth/AuthContext'
import { getMessages, sendChatMessage } from '@/services/researchService'
import type { ChatMessage } from '@/types/research'

export function ProjectChat() {
  const { project, openEvidence } = useProjectContext()
  const { isAuthenticated, usageCount, recordUsage, openLogin } = useAuth()
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get('conversation')
  const newChatToken = searchParams.get('new')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const requestRef = useRef(0)

  useEffect(() => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setMessages([])
    setInput('')

    if (newChatToken) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    getMessages(project.id).then((result) => {
      if (requestRef.current !== requestId) return
      setMessages(result)
      setIsLoading(false)
    })
  }, [project.id, conversationId, newChatToken, isAuthenticated])

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

      setMessages((previous) => [...previous, userMessage])
      setInput('')
      setIsSending(true)

      try {
        const assistantMessage = await sendChatMessage(project.id, content)
        setMessages((previous) => [...previous, assistantMessage])
      } finally {
        setIsSending(false)
      }
    },
    [input, isSending, project.id, isAuthenticated, usageCount, recordUsage, openLogin],
  )

  return (
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
  )
}
