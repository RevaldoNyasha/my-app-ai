import { QuoteIcon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/Badge'
import type { Evidence } from '@/types/research'

interface EvidenceCardProps {
  evidence: Evidence
  onSelect: (evidence: Evidence) => void
  index?: number
}

export function EvidenceCard({ evidence, onSelect, index }: EvidenceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(evidence)}
      className="group w-full rounded-xl border border-ink-200/80 bg-surface px-3.5 py-3 text-left transition-all duration-150 hover:border-brand-300 hover:shadow-panel"
    >
      <span className="flex items-center gap-2">
        {typeof index === 'number' ? (
          <span className="text-[0.68rem] font-semibold tabular-nums text-brand-600">
            {index + 1}
          </span>
        ) : null}
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-500">
          {evidence.source}
        </span>
        <span className="size-1 rounded-full bg-ink-300" />
        <span className="text-[0.72rem] text-ink-500">{evidence.participant}</span>
        {evidence.timestamp ? (
          <>
            <span className="size-1 rounded-full bg-ink-300" />
            <span className="text-[0.72rem] tabular-nums text-ink-500">{evidence.timestamp}</span>
          </>
        ) : null}
        {evidence.page ? (
          <>
            <span className="size-1 rounded-full bg-ink-300" />
            <span className="text-[0.72rem] text-ink-500">p. {evidence.page}</span>
          </>
        ) : null}
      </span>

      <span className="mt-2 flex gap-2">
        <QuoteIcon className="mt-0.5 size-3.5 shrink-0 text-ink-300" />
        <span className="font-serif text-[0.88rem] leading-6 text-ink-700 italic">
          {evidence.quote}
        </span>
      </span>

      {(evidence.theme || evidence.code || evidence.language) ? (
        <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {evidence.theme ? <Badge tone="brand">{evidence.theme}</Badge> : null}
          {evidence.code ? <Badge tone="outline">{evidence.code}</Badge> : null}
          {evidence.language ? <Badge tone="neutral">{evidence.language}</Badge> : null}
          <span className="ml-auto text-[0.68rem] font-medium text-ink-400 opacity-0 transition-opacity group-hover:opacity-100">
            View source →
          </span>
        </span>
      ) : null}
    </button>
  )
}
