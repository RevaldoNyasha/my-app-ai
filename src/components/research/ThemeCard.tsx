import { Badge } from '@/components/ui/Badge'
import { TagIcon } from '@/components/ui/icons'
import type { ResearchTheme } from '@/types/research'

function confidenceLabel(confidence: number): { label: string; tone: 'success' | 'brand' | 'warning' } {
  if (confidence >= 0.85) return { label: 'High confidence', tone: 'success' }
  if (confidence >= 0.7) return { label: 'Moderate confidence', tone: 'brand' }
  return { label: 'Emerging', tone: 'warning' }
}

export function ThemeCard({ theme }: { theme: ResearchTheme }) {
  const confidence = confidenceLabel(theme.confidence)

  return (
    <article className="flex flex-col rounded-2xl border border-ink-200 bg-surface p-5 transition-all duration-150 hover:border-brand-300 hover:shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-[1.02rem] font-semibold leading-snug tracking-tight text-ink-900">
          {theme.name}
        </h3>
        <Badge tone={confidence.tone}>{confidence.label}</Badge>
      </div>

      <p className="mt-2 text-[0.82rem] leading-6 text-ink-500">{theme.description}</p>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <div>
          <dt className="text-[0.68rem] uppercase tracking-wide text-ink-400">Excerpts</dt>
          <dd className="text-[0.95rem] font-semibold tabular-nums text-ink-900">
            {theme.excerptCount}
            <span className="ml-1 text-[0.72rem] font-normal text-ink-400">supporting</span>
          </dd>
        </div>
        <div>
          <dt className="text-[0.68rem] uppercase tracking-wide text-ink-400">Participants</dt>
          <dd className="text-[0.95rem] font-semibold tabular-nums text-ink-900">
            {theme.participantCount}
          </dd>
        </div>
        <div>
          <dt className="text-[0.68rem] uppercase tracking-wide text-ink-400">Sources</dt>
          <dd className="text-[0.95rem] font-semibold tabular-nums text-ink-900">
            {theme.sourceCount}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[0.7rem] text-ink-500">
          <span>Theme confidence</span>
          <span className="font-medium tabular-nums text-ink-700">
            {Math.round(theme.confidence * 100)}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
            style={{ width: `${Math.round(theme.confidence * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 border-t border-ink-100 pt-3">
        <div className="mb-2 flex items-center gap-1.5">
          <TagIcon className="size-3.5 text-ink-400" />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
            Codes
          </span>
        </div>
        <ul className="space-y-1">
          {theme.codes.map((code) => (
            <li key={code.id} className="flex items-center gap-2 text-[0.8rem] text-ink-700">
              <span className="size-1.5 shrink-0 rounded-full bg-brand-300" />
              <span className="flex-1 truncate">{code.name}</span>
              <span className="text-[0.72rem] tabular-nums text-ink-400">
                {code.excerptCount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
