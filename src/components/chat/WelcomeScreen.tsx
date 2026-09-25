import { ArrowRightIcon, SparkleIcon } from '@/components/ui/icons'

/** Project-agnostic starter questions; they work for any research topic. */
const PROMPTS = [
  {
    label: 'Find themes',
    prompt: 'What are the main themes that come up across the data in this project?',
  },
  {
    label: 'Find evidence',
    prompt: 'Show me the strongest quotes and evidence that support the key findings.',
  },
]

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void
}

export function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-10 text-center">
      <SparkleIcon className="mb-5 size-8 text-ink-800" />

      <h1 className="font-serif text-[1.9rem] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[2.2rem]">
        Understand your research data.
      </h1>

      <div className="mt-7 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
        {PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col rounded-2xl border border-ink-200 bg-surface p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-panel"
          >
            <span className="flex items-center gap-2">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-brand-600">
                {item.label}
              </span>
              <ArrowRightIcon className="size-3.5 text-ink-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-800" />
            </span>
            <span className="mt-2 text-[0.88rem] leading-6 text-ink-700">{item.prompt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
