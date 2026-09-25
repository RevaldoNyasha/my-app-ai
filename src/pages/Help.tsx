import type { ReactNode } from 'react'
import { PageContainer, PageHeading, SectionHeading } from '@/components/layout/PageContainer'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
      <SectionHeading title={title} />
      <div className="space-y-3 text-[0.86rem] leading-7 text-ink-600">{children}</div>
    </section>
  )
}

function Quote({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-xl border border-ink-100 bg-canvas px-3.5 py-2 text-[0.84rem] italic text-ink-700">
      “{children}”
    </li>
  )
}

const LEVELS = [
  {
    term: 'Theme',
    example: 'Financial Barriers',
    description: 'A big idea that keeps coming up across the data. This is a finding.',
  },
  {
    term: 'Code',
    example: 'Bus fare · Uniform costs · Lunch money',
    description: 'A smaller, specific idea. Related codes are grouped into a theme.',
  },
  {
    term: 'Evidence',
    example: '“The bus fare is too expensive.” — P04, Interview 04',
    description: 'A word-for-word quote from a participant that supports a code.',
  },
]

export function HelpPage() {
  return (
    <PageContainer>
      <PageHeading
        eyebrow="Help"
        title="How ResearchMind works"
        description="The key ideas behind projects, themes and evidence, in plain language."
      />

      <div className="max-w-3xl space-y-6">
        <Card title="What is a project?">
          <p>
            A <strong className="font-semibold text-ink-800">project is one research study</strong> —
            for example “Youth Access to Education” or “Maternal Healthcare in Rural Districts”.
          </p>
          <p>
            It holds everything for that study: the interviews, focus groups, surveys and notes you
            upload, the conversations you have with the assistant, and the themes and reports that
            come out of the data.
          </p>
        </Card>

        <Card title="What is a theme?">
          <p>
            A <strong className="font-semibold text-ink-800">theme is a big idea that keeps coming
            up</strong> in what your participants say. You don’t decide it in advance — you find it
            by reading all the data and noticing what repeats.
          </p>
          <p>For example, you interview 20 people about getting to school:</p>
          <ul className="space-y-2">
            <Quote>The bus fare is too expensive.</Quote>
            <Quote>My parents can’t afford the uniform.</Quote>
            <Quote>I skip days when there’s no money for lunch.</Quote>
          </ul>
          <p>
            None of them used the same words, but they are all talking about{' '}
            <strong className="font-semibold text-ink-800">money</strong>. So “Financial Barriers” is a
            theme. The smaller ideas — bus fare, uniforms, lunch money — are called{' '}
            <strong className="font-semibold text-ink-800">codes</strong>, and themes are built from them.
          </p>
        </Card>

        <Card title="What themes mean for a project">
          <p>
            A project’s themes are the answer to{' '}
            <strong className="font-semibold text-ink-800">“what did we find?”</strong> They summarise
            everything participants said into a handful of key findings, and each one is backed by:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="font-semibold text-ink-800">Real quotes</strong> from participants, so
              every finding can be traced back to who said it and where.
            </li>
            <li>
              <strong className="font-semibold text-ink-800">How widespread it is</strong> — how many
              participants and documents mention it.
            </li>
          </ul>
          <p>
            Themes always belong to one project. A healthcare study’s themes come only from that
            study’s data and never mix with another project’s, so each project ends up with its own
            set of themes describing what that study discovered.
          </p>
          <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-ink-700">
            <strong className="font-semibold text-ink-800">In short:</strong> the project is the
            study, and its themes are the main things you learned from it.
          </p>
        </Card>

        <Card title="Themes, codes and evidence">
          <p>Findings are built in three levels, from the broadest to the most specific:</p>
          <ol className="space-y-2.5">
            {LEVELS.map((level, index) => (
              <li
                key={level.term}
                className="flex gap-3 rounded-xl border border-ink-100 px-3.5 py-3"
                style={{ marginLeft: `${index * 1.25}rem` }}
              >
                <span className="mt-0.5 w-20 shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-brand-600">
                  {level.term}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.84rem] font-medium text-ink-800">
                    {level.example}
                  </span>
                  <span className="block text-[0.78rem] leading-6 text-ink-500">
                    {level.description}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </PageContainer>
  )
}
