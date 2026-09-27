import { QuoteIcon } from '@/components/ui/icons'
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
      </span>

      <span className="mt-2 flex gap-2">
        <QuoteIcon className="mt-0.5 size-3.5 shrink-0 text-ink-300" />
        <span className="font-serif text-[0.88rem] leading-6 text-ink-700 italic">
          {evidence.quote}
        </span>
      </span>

      <span className="mt-2.5 flex justify-end">
        <span className="text-[0.68rem] font-medium text-ink-400 opacity-0 transition-opacity group-hover:opacity-100">
          Go to source →
        </span>
      </span>
    </button>
  )
}
