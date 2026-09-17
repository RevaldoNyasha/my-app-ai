import { ArrowRightIcon, SparkleIcon } from '@/components/ui/icons'
import type { ResearchProject } from '@/types/research'

const PROMPTS = [
  {
    label: 'Find themes',
    prompt: 'What are the major barriers affecting access to healthcare among young people?',
  },
  {
    label: 'Compare participants',
    prompt: 'How do urban and rural participants differ in their experiences?',
  },
  {
    label: 'Find evidence',
    prompt: 'Show me evidence supporting the claim that cost affects healthcare access.',
  },
  {
    label: 'Analyse',
    prompt: 'What recurring themes appear across these interviews?',
  },
]

interface WelcomeScreenProps {
  project?: ResearchProject
  onSelectPrompt: (prompt: string) => void
}

export function WelcomeScreen({ project, onSelectPrompt }: WelcomeScreenProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-10 text-center">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-panel">
        <SparkleIcon className="size-6" />
      </div>

      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-brand-600">
        ResearchMind AI
      </p>
      <h1 className="mt-2 font-serif text-[1.9rem] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[2.2rem]">
        Understand your research data.
      </h1>
      <p className="mt-3 max-w-xl text-[0.92rem] leading-7 text-ink-500">
        Ask questions, identify themes, compare participants, and find evidence across your
        research.
      </p>

      {project ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-surface px-3.5 py-1.5 text-[0.78rem] text-ink-600">
          <span className="size-1.5 rounded-full bg-brand-500" />
          Analysing
          <span className="font-medium text-ink-900">{project.name}</span>
          <span className="text-ink-400">
            · {project.documentCount} documents · {project.participantCount} participants
          </span>
        </div>
      ) : null}

      <div className="mt-9 grid w-full gap-3 text-left sm:grid-cols-2">
        {PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col rounded-2xl border border-ink-200 bg-surface p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-panel"
          >
            <span className="flex items-center gap-2">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-brand-600">
                {item.label}
              </span>
              <ArrowRightIcon className="size-3.5 text-ink-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brand-500" />
            </span>
            <span className="mt-2 text-[0.88rem] leading-6 text-ink-700">{item.prompt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
