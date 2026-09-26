import { useEffect, useRef } from 'react'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { WelcomeScreen } from '@/components/chat/WelcomeScreen'
import { TypingIndicator } from '@/components/ui/TypingIndicator'
import { SparkleIcon } from '@/components/ui/icons'
import type { ChatMessage as ChatMessageType, Evidence, ResearchProject } from '@/types/research'

interface ChatWindowProps {
  project?: ResearchProject
  messages: ChatMessageType[]
  isLoading: boolean
  isSending: boolean
  input: string
  onInputChange: (value: string) => void
  onSend: (question?: string) => void
  onSelectEvidence: (evidence: Evidence) => void
}

export function ChatWindow({
  project,
  messages,
  isLoading,
  isSending,
  input,
  onInputChange,
  onSend,
  onSelectEvidence,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending])

  // A streaming answer starts as an empty message; show the typing dots until
  // its first words arrive, then the growing answer itself.
  const visibleMessages = messages.filter(
    (message) => !(message.role === 'assistant' && message.content === ''),
  )
  const isStreamingAnswer = isSending && visibleMessages.at(-1)?.role === 'assistant'
  const isEmpty = visibleMessages.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <SparkleIcon className="size-4 animate-pulse text-ink-300" />
              Loading conversation…
            </div>
          </div>
        ) : isEmpty && !isSending ? (
          <WelcomeScreen onSelectPrompt={(prompt) => onSend(prompt)} />
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-7 sm:px-6">
            {visibleMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                projectName={project?.name}
                onSelectEvidence={onSelectEvidence}
              />
            ))}

            {isSending && !isStreamingAnswer ? (
              <div className="flex gap-3.5">
                <SparkleIcon className="mt-0.5 size-4 shrink-0 text-ink-800" />
                <div className="rounded-2xl rounded-tl-md border border-ink-100 bg-surface px-4 py-3.5 shadow-[0_1px_2px_rgba(23,23,21,0.03)]">
                  <TypingIndicator />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ChatInput
        value={input}
        onChange={onInputChange}
        onSend={() => onSend()}
        isSending={isSending}
      />
    </div>
  )
}
