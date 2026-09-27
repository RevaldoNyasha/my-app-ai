import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { SendIcon } from '@/components/ui/icons'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isSending?: boolean
}

const MAX_HEIGHT = 200

export function ChatInput({ value, onChange, onSend, isSending = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const canSend = value.trim().length > 0 && !isSending

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`
  }, [value])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-5 sm:px-6">
      <div
        className={[
          'flex items-end gap-2 rounded-2xl border bg-surface p-2 shadow-panel transition-colors duration-150',
          isFocused ? 'border-brand-400' : 'border-ink-200',
        ].join(' ')}
      >
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask anything about your research..."
          aria-label="Message ResearchMind"
          className="max-h-[200px] min-h-[2.25rem] flex-1 resize-none bg-transparent py-2 text-[0.92rem] leading-6 text-ink-800 outline-none placeholder:text-ink-400"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send message"
          className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-800 transition-colors hover:bg-ink-200 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400"
        >
          <SendIcon className="size-4.5" />
        </button>
      </div>

      <p className="mt-2 px-1 text-center text-[0.7rem] text-ink-400">
        ResearchMind can make mistakes. Verify important findings against your source data.
      </p>
    </div>
  )
}
