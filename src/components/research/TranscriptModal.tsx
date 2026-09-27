import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { ApiError } from '@/lib/api'
import { getTranscript } from '@/services/documentService'
import type { DocumentTranscript, ResearchDocument, TranscriptSegment } from '@/types/research'

interface TranscriptModalProps {
  document: ResearchDocument | null
  onClose: () => void
  /** Seconds into the recording to highlight and scroll to, e.g. where a quote was said. */
  focusAt?: number | null
}

/** `mm:ss`, or `h:mm:ss` from an hour on (matches evidence timestamps). */
function formatTime(seconds: number): string {
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return hours ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${pad(minutes)}:${pad(secs)}`
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  sn: 'Shona',
  nd: 'Ndebele',
  zu: 'Zulu',
  sw: 'Swahili',
  fr: 'French',
  pt: 'Portuguese',
}

/** Read a recording's transcript, line by line with timestamps. */
export function TranscriptModal({ document, onClose, focusAt = null }: TranscriptModalProps) {
  const [transcript, setTranscript] = useState<DocumentTranscript | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showEnglish, setShowEnglish] = useState(false)

  useEffect(() => {
    if (!document) return
    let cancelled = false
    setTranscript(null)
    setError(null)
    setShowEnglish(false)
    getTranscript(document.projectId, document.id)
      .then((result) => {
        if (!cancelled) setTranscript(result)
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof ApiError ? caught.message : 'Could not open the transcript.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [document])

  const language = transcript?.language
    ? (LANGUAGE_NAMES[transcript.language] ?? transcript.language.toUpperCase())
    : null
  const segments: TranscriptSegment[] =
    showEnglish && transcript?.translation ? transcript.translation : (transcript?.segments ?? [])

  // The segment playing at `focusAt`: the last one that starts at or before it.
  const focusIndex =
    focusAt === null ? -1 : segments.findLastIndex((segment) => segment.start <= focusAt)

  const description = transcript
    ? [
        language ? `Spoken in ${language}` : null,
        transcript.duration ? `${formatTime(transcript.duration)} long` : null,
        transcript.model,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined

  return (
    <Modal
      open={document !== null}
      onClose={onClose}
      size="xl"
      title={document ? `Transcript: ${document.name}` : 'Transcript'}
      description={description}
    >
      {error ? (
        <p className="text-[0.84rem] text-red-700">{error}</p>
      ) : !transcript ? (
        <p className="text-[0.84rem] text-ink-400">Opening the transcript…</p>
      ) : (
        <>
          {transcript.translation ? (
            <div className="mb-4 inline-flex gap-1 rounded-xl bg-canvas p-1 text-[0.78rem] font-medium">
              {[
                { english: false, label: `Original${language ? ` (${language})` : ''}` },
                { english: true, label: 'English translation' },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setShowEnglish(option.english)}
                  aria-pressed={showEnglish === option.english}
                  className={`h-7 rounded-lg px-3 transition-colors ${
                    showEnglish === option.english
                      ? 'bg-surface text-ink-800 shadow-sm'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
          <ol className="space-y-2.5">
            {segments.map((segment, index) => (
              <li
                key={`${segment.start}-${index}`}
                ref={
                  index === focusIndex
                    ? (element) => element?.scrollIntoView({ block: 'center' })
                    : undefined
                }
                className={[
                  'flex gap-3 rounded-lg',
                  index === focusIndex ? '-mx-2 bg-brand-50 px-2 py-1 dark:bg-brand-400/10' : '',
                ].join(' ')}
              >
                <span className="w-14 shrink-0 pt-0.5 text-right text-[0.72rem] tabular-nums text-ink-400">
                  {formatTime(segment.start)}
                </span>
                <p className="text-[0.88rem] leading-6 text-ink-700">{segment.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-ink-100 pt-3 text-[0.7rem] text-ink-400">
            Transcribed automatically on this computer. Check names, numbers and quotes against
            the recording before relying on them.
          </p>
        </>
      )}
    </Modal>
  )
}
