import type { ResearchDocument } from '@/types/research'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const timestamp = new Date(iso).getTime()
  const diff = now - timestamp

  if (diff < MINUTE) return 'just now'
  if (diff < HOUR) {
    const minutes = Math.round(diff / MINUTE)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  if (diff < DAY) {
    const hours = Math.round(diff / HOUR)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (diff < 7 * DAY) {
    const days = Math.round(diff / DAY)
    return days === 1 ? 'Yesterday' : `${days} days ago`
  }

  return formatDate(iso)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

const AUDIO_EXTENSIONS = new Set(['MP3', 'WAV', 'M4A', 'OGG', 'FLAC', 'WMA'])
const VIDEO_EXTENSIONS = new Set(['MP4', 'MOV', 'WEBM'])

/** The file's format as shown to researchers: "Audio", "Video", or the extension (e.g. "DOCX"). */
export function documentFormat(document: ResearchDocument): string {
  const extension = document.extension.replace(/^\./, '').toUpperCase()
  if (document.kind === 'audio' || AUDIO_EXTENSIONS.has(extension)) return 'Audio'
  if (document.kind === 'video' || VIDEO_EXTENSIONS.has(extension)) return 'Video'
  return extension || '—'
}

/** Seconds from an evidence timestamp such as "04:32" or "1:04:32"; `null` if unreadable. */
export function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) return null
  const parts = value.split(':').map(Number)
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => Number.isNaN(part))) return null
  return parts.reduce((total, part) => total * 60 + part, 0)
}
