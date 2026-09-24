import { Markdown } from '@/components/ui/Markdown'
import { SparkleIcon } from '@/components/ui/icons'
import { formatClockTime } from '@/lib/format'
import type { ChatMessage as ChatMessageType, Evidence } from '@/types/research'

interface ChatMessageProps {
  message: ChatMessageType
  onSelectEvidence: (evidence: Evidence) => void
  projectName?: string
}

export function ChatMessage({ message, onSelectEvidence, projectName }: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end" style={{ animation: 'rise 220ms ease-out' }}>
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-100 px-4 py-2.5 sm:max-w-[75%]">
          <p className="whitespace-pre-wrap text-[0.92rem] leading-7 text-ink-800">
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3.5" style={{ animation: 'rise 220ms ease-out' }}>
      <SparkleIcon className="mt-0.5 size-4 shrink-0 text-ink-800" />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-[0.82rem] font-semibold text-ink-900">ResearchMind</span>
          {projectName ? (
            <span className="truncate text-[0.72rem] text-ink-400">on {projectName}</span>
          ) : null}
          <span className="ml-auto shrink-0 text-[0.7rem] text-ink-400">
            {formatClockTime(message.createdAt)}
          </span>
        </div>

        <div className="rounded-2xl rounded-tl-md border border-ink-100 bg-surface px-4 py-3.5 shadow-[0_1px_2px_rgba(23,23,21,0.03)] sm:px-5 sm:py-4">
          <Markdown content={message.content} />

          {message.evidence && message.evidence.length > 0 ? (
            <div className="mt-3.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-ink-100 pt-3">
              <span className="text-[0.7rem] font-medium text-ink-400">Sources:</span>
              {message.evidence.map((evidence, index) => (
                <button
                  key={evidence.id}
                  type="button"
                  onClick={() => onSelectEvidence(evidence)}
                  className="text-[0.72rem] font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 transition-colors hover:text-ink-900 hover:decoration-ink-600"
                >
                  {index > 0 ? ', ' : ''}
                  {evidence.source}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
