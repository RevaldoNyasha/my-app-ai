import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero, Reveal } from '@/components/landing/MarketingLayout'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { LockIcon, UsersIcon } from '@/components/landing/icons'
import {
  ArrowRightIcon,
  CheckIcon,
  DatabaseIcon,
  FolderIcon,
  MicrophoneIcon,
  QuoteIcon,
  SourceIcon,
  SparkleIcon,
} from '@/components/ui/icons'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const PILLARS = [
  {
    id: 'together',
    step: '01',
    eyebrow: 'Bring it together',
    title: 'All your research data in one place',
    description:
      'Stop hunting across folders, drives and notebooks. Every interview, recording, survey and document for a study lives in a single project — in whatever language it was collected.',
    points: [
      'Transcripts, audio, surveys, PDFs and field notes side by side',
      'Automatic transcription and translation for English, Shona, Ndebele and more',
      'Original-language words always kept alongside translations',
    ],
  },
  {
    id: 'connect',
    step: '02',
    eyebrow: 'Connect the dots',
    title: 'See how everything relates',
    description:
      'ResearchMind reads across all of your sources at once, linking what one participant said to what came up in a focus group or a survey — so patterns that were buried in separate files surface together.',
    points: [
      'Codes and themes that span every source in a project',
      'See where a theme appears, how often, and who raised it',
      'Map how themes relate to and reinforce each other',
    ],
  },
  {
    id: 'understand',
    step: '03',
    eyebrow: 'Understand it',
    title: 'Ask questions, get evidence-backed answers',
    description:
      'Talk to your data in plain language. Every answer is grounded in your own sources and cites the exact quotes behind it, so you can trust what you find and explain it to others.',
    points: [
      'Answers that link back to word-for-word participant quotes',
      'You review and approve every theme before it is used',
      'Turn approved findings into reports for stakeholders',
    ],
  },
]

const SOURCES: { name: string; meta: string; icon: Icon }[] = [
  { name: 'Interview 04 — Mother, Epworth', meta: 'Transcript · Shona', icon: SourceIcon },
  { name: 'Focus group 2 — Secondary pupils', meta: 'Audio · 48 min', icon: MicrophoneIcon },
  { name: 'Household access survey', meta: 'Survey · 312 responses', icon: DatabaseIcon },
  { name: 'Head teacher field notes', meta: 'Document · PDF', icon: SourceIcon },
]

const TRUST_POINTS = [
  {
    title: 'Private by design',
    description: 'Your data is only used to analyse your own projects — never to train shared models.',
    icon: LockIcon,
  },
  {
    title: 'Built for teams',
    description: 'Bring co-researchers into the same project so everyone works from one connected picture.',
    icon: UsersIcon,
  },
]

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] sm:p-6">
      {children}
    </div>
  )
}

/** Many separate sources flowing into one project. */
function TogetherVisual() {
  return (
    <Panel>
      <ul className="space-y-2.5">
        {SOURCES.map((source) => (
          <li
            key={source.name}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-3.5 py-2.5"
          >
            <source.icon className="size-4.5 shrink-0 text-slate-300" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.84rem] font-medium text-slate-100">{source.name}</p>
              <p className="text-[0.72rem] text-slate-500">{source.meta}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-center py-2" aria-hidden="true">
        <svg width="16" height="34" viewBox="0 0 16 34">
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="32"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="3 4"
            className="animate-flow-dash"
          />
        </svg>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/25 px-4 py-3.5 shadow-[0_0_38px_-12px_rgba(255,255,255,0.3)]">
        <FolderIcon className="size-5 shrink-0 text-white" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9rem] font-semibold text-white">Youth Access to Education</p>
          <p className="text-[0.72rem] text-slate-400">1 project · 24 sources · 3 languages</p>
        </div>
      </div>
    </Panel>
  )
}

const GRAPH_SOURCES = [
  { label: 'Interview 04', x: 104, y: 40 },
  { label: 'Focus group 2', x: 104, y: 130 },
  { label: 'Survey', x: 104, y: 220 },
  { label: 'Field notes', x: 104, y: 300 },
]

const GRAPH_THEMES = [
  { label: 'Financial barriers', x: 300, y: 95, links: [0, 1, 2] },
  { label: 'Distance to school', x: 300, y: 190, links: [1, 2, 3] },
  { label: 'Household duties', x: 300, y: 280, links: [0, 3] },
]

/** Sources on the left linked to the themes they share on the right. */
function ConnectVisual() {
  return (
    <Panel>
      <svg
        viewBox="0 0 440 340"
        className="h-auto w-full"
        role="img"
        aria-label="Four sources linked to three shared themes"
      >
        {GRAPH_THEMES.flatMap((theme) =>
          theme.links.map((sourceIndex) => {
            const source = GRAPH_SOURCES[sourceIndex]
            return (
              <path
                key={`${theme.label}-${source.label}`}
                d={`M ${source.x + 6} ${source.y} C ${source.x + 120} ${source.y}, ${theme.x - 120} ${theme.y}, ${theme.x - 8} ${theme.y}`}
                fill="none"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.1"
                strokeDasharray="3 4"
                className="animate-flow-dash"
              />
            )
          }),
        )}
        {/* Theme-to-theme relationship */}
        <path
          d="M 300 103 C 330 130, 330 160, 300 182"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.2"
        />

        {GRAPH_SOURCES.map((source) => (
          <g key={source.label}>
            <circle cx={source.x} cy={source.y} r="5" fill="#060707" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
            <text
              x={source.x - 12}
              y={source.y + 4}
              textAnchor="end"
              className="fill-slate-400 text-[11px]"
            >
              {source.label.split(' ').slice(0, 1).join(' ')}
            </text>
            <text x={source.x - 12} y={source.y + 17} textAnchor="end" className="fill-slate-500 text-[10px]">
              {source.label.split(' ').slice(1).join(' ')}
            </text>
          </g>
        ))}

        {GRAPH_THEMES.map((theme) => (
          <g key={theme.label}>
            <circle cx={theme.x} cy={theme.y} r="8" fill="#ffffff" />
            <circle cx={theme.x} cy={theme.y} r="15" fill="none" stroke="rgba(255,255,255,0.2)" />
            <text x={theme.x + 22} y={theme.y + 4} className="fill-white text-[12px] font-semibold">
              {theme.label.split(' ')[0]}
            </text>
            <text x={theme.x + 22} y={theme.y + 18} className="fill-slate-400 text-[11px]">
              {theme.label.split(' ').slice(1).join(' ')}
            </text>
          </g>
        ))}
      </svg>
    </Panel>
  )
}

/** A question answered with cited evidence. */
function UnderstandVisual() {
  return (
    <Panel>
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-tr-sm border border-white/[0.1] px-4 py-2.5 text-[0.86rem] text-white">
          Why are girls leaving school early?
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <SparkleIcon className="mt-0.5 size-4 shrink-0 text-white" />
        <div className="min-w-0">
          <p className="text-[0.86rem] leading-6 text-slate-300">
            Across 18 of 24 sources, the strongest pattern is <strong className="font-semibold text-white">financial
            barriers</strong> — fees, uniforms and transport — often combined with{' '}
            <strong className="font-semibold text-white">household duties</strong>.
          </p>

          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
              <QuoteIcon className="size-3.5" />
              Evidence
            </p>
            {[
              { quote: 'The bus fare is too expensive, so she stays home.', source: 'P04 · Interview 04' },
              { quote: 'After school I have to fetch water and cook.', source: 'FG2 · Focus group 2' },
            ].map((item) => (
              <blockquote key={item.source} className="border-l border-white/30 pl-3">
                <p className="text-[0.82rem] italic text-slate-200">“{item.quote}”</p>
                <footer className="mt-0.5 text-[0.7rem] text-slate-500">{item.source}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}

const VISUALS = [TogetherVisual, ConnectVisual, UnderstandVisual]

export function PlatformPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Platform"
        title="All your research in one place."
        highlight="Connected. Understood."
        description="Bring every interview, survey and document together, let ResearchMind connect the dots between them, and understand what your data is really telling you."
      >
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/projects"
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-[0.92rem] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:border-white/40"
          >
            Get started
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex h-11 items-center rounded-xl border border-white/[0.12] px-5 text-[0.92rem] font-semibold text-white transition-colors hover:border-white/25"
          >
            See pricing
          </Link>
        </div>

        <ol className="mx-auto mt-12 flex max-w-lg items-center justify-center gap-2 text-[0.8rem] text-slate-400 sm:gap-3">
          {PILLARS.map((pillar, index) => (
            <li key={pillar.step} className="flex items-center gap-2 sm:gap-3">
              <a href={`#${pillar.id}`} className="whitespace-nowrap transition-colors hover:text-white">
                {pillar.eyebrow}
              </a>
              {index < PILLARS.length - 1 ? (
                <ArrowRightIcon className="size-3.5 shrink-0 text-slate-600" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </PageHero>

      {PILLARS.map((pillar, index) => {
        const Visual = VISUALS[index]
        const reversed = index % 2 === 1

        return (
          <section
            key={pillar.step}
            id={pillar.id}
            className="relative scroll-mt-20 border-t border-white/[0.05]"
            aria-label={pillar.eyebrow}
          >
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
              <Reveal className={reversed ? 'lg:order-2' : undefined}>
                <p className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span className="tabular-nums text-slate-600">{pillar.step}</span>
                  {pillar.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:leading-[1.12]">
                  {pillar.title}
                </h2>
                <p className="mt-5 text-base leading-7 text-slate-400">{pillar.description}</p>
                <ul className="mt-7 space-y-3">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[0.9rem] leading-6 text-slate-300">
                      <CheckIcon className="mt-1 size-4 shrink-0 text-white/60" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.1} className={reversed ? 'lg:order-1' : undefined}>
                <Visual />
              </Reveal>
            </div>
          </section>
        )
      })}

      <section className="relative border-t border-white/[0.05]" aria-label="Trust">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <SectionHeading
            eyebrow="Built for researchers"
            title="One connected picture, kept safe"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {TRUST_POINTS.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <div className="flex size-10 shrink-0 items-center justify-center text-white">
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-[1rem] font-semibold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-[0.86rem] leading-6 text-slate-400">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </MarketingLayout>
  )
}
