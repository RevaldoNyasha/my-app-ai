import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { DatabaseIcon } from '@/components/ui/icons'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  BrainIcon,
  ChartUpIcon,
  IdeaIcon,
  TargetIcon,
} from './icons'

interface Stage {
  key: string
  title: string
  description: string
  icon: typeof IdeaIcon
  tag?: string
  central?: boolean
  insights?: boolean
  final?: boolean
}

const STAGES: Stage[] = [
  {
    key: 'idea',
    title: 'Idea',
    description: 'Start with a research\nquestion or challenge.',
    icon: IdeaIcon,
  },
  {
    key: 'research',
    title: 'Research',
    description: 'Bring your interviews,\ndocuments, surveys\nand more.',
    icon: DatabaseIcon,
    tag: '24 sources',
  },
  {
    key: 'analysis',
    title: 'AI Analysis',
    description: 'Find themes,\npatterns and insights.',
    icon: BrainIcon,
    central: true,
  },
  {
    key: 'insight',
    title: 'Insight',
    description: 'Get clear,\nevidence-backed findings.',
    icon: ChartUpIcon,
    insights: true,
  },
  {
    key: 'decision',
    title: 'Better Decisions',
    description: 'Use your insights to\ninform policy, programs\nand real change.',
    icon: TargetIcon,
    final: true,
  },
]

const INSIGHT_BARS = [
  { label: 'Financial barriers', pct: 100, delay: 0 },
  { label: 'Distance', pct: 72, delay: 0.14 },
  { label: 'Waiting times', pct: 46, delay: 0.28 },
]

const STAGE_DELAY_MS = 1900
const FINAL_HOLD_MS = 2600

function InsightBars({ active }: { active: boolean }) {
  return (
    <div className="mt-auto pt-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Themes identified
      </p>
      <div className="mt-2.5 space-y-2">
        {INSIGHT_BARS.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between gap-2 text-[0.66rem] text-slate-400">
              <span className="truncate">{bar.label}</span>
              <span className="tabular-nums text-slate-500">{bar.pct}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-white/90"
                style={{ transformOrigin: 'left center' }}
                initial={false}
                animate={{ scaleX: active ? 1 : 0.14, opacity: active ? 1 : 0.35 }}
                transition={{ duration: 0.7, delay: bar.delay, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StageCard({
  stage,
  active,
  className = '',
}: {
  stage: Stage
  active: boolean
  className?: string
}) {
  return (
    <div
      className={[
        'relative flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-white/[0.035] px-4 py-5 transition-colors duration-700',
        active ? 'border-transparent' : 'border-white/[0.07]',
        stage.central ? 'lg:px-5 lg:py-6' : 'lg:py-5',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-700',
          active ? 'animate-glow-pulse opacity-100' : 'opacity-0',
        ].join(' ')}
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(255, 255, 255, 0.35), 0 0 38px -8px rgba(255, 255, 255, 0.2)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-2">
        <div
          className={[
            'relative flex size-9 shrink-0 items-center justify-center transition-colors duration-700',
            active ? 'text-white' : 'text-white/50',
          ].join(' ')}
        >
          <stage.icon className="size-4.5" />
        </div>
        {stage.tag ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.15] bg-white/[0.06] px-2 py-0.5 text-[0.64rem] font-medium text-slate-300">
            <span className="size-1 rounded-full bg-white/70" />
            {stage.tag}
          </span>
        ) : null}
      </div>

      <h3
        className={[
          'relative mt-3.5 text-[0.94rem] font-semibold tracking-tight transition-colors duration-700',
          active ? 'text-white' : 'text-slate-200',
        ].join(' ')}
      >
        {stage.title}
      </h3>
      <p className="relative mt-1 whitespace-pre-line text-[0.74rem] leading-5 text-slate-400">
        {stage.description}
      </p>

      {stage.insights ? <InsightBars active={active} /> : null}

      {stage.central ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
          {active ? (
            <div className="animate-scan-line absolute inset-x-4 top-0 h-12 rounded-full bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function ConnectorHorizontal({ active, live }: { active: boolean; live: boolean }) {
  const stroke = active ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.28)'
  return (
    <div className="hidden w-12 shrink-0 items-stretch lg:flex xl:w-14" aria-hidden="true">
      <svg width="48" height="22" viewBox="0 0 48 22" className="mx-auto my-auto block">
        <line
          x1="2"
          y1="11"
          x2="46"
          y2="11"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="3 4"
          className={active ? 'animate-flow-dash' : undefined}
        />
        {live ? (
          <>
            <circle r="2" fill="#ffffff" opacity={active ? 0.95 : 0.55}>
              <animateMotion dur="1.4s" repeatCount="indefinite" path="M 4 11 L 44 11" />
            </circle>
            <circle r="1.1" fill="#ffffff" opacity="0.4">
              <animateMotion dur="1.4s" repeatCount="indefinite" begin="-0.7s" path="M 4 11 L 44 11" />
            </circle>
          </>
        ) : null}
      </svg>
    </div>
  )
}

function ConnectorVertical({ active, live }: { active: boolean; live: boolean }) {
  const stroke = active ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.3)'
  return (
    <div className="flex justify-center py-1.5 lg:hidden" aria-hidden="true">
      <svg width="16" height="44" viewBox="0 0 16 44">
        <line
          x1="8"
          y1="2"
          x2="8"
          y2="42"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="3 4"
          className={active ? 'animate-flow-dash' : undefined}
        />
        {live ? (
          <>
            <circle r="2" fill="#ffffff" opacity="0.85">
              <animateMotion dur="1.3s" repeatCount="indefinite" path="M 8 4 L 8 40" />
            </circle>
            <circle r="1.1" fill="#ffffff" opacity="0.4">
              <animateMotion dur="1.3s" repeatCount="indefinite" begin="-0.65s" path="M 8 4 L 8 40" />
            </circle>
          </>
        ) : null}
      </svg>
    </div>
  )
}

export function ResearchFlow() {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' })
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!inView || reduced) return
    const delay = active === STAGES.length - 1 ? FINAL_HOLD_MS : STAGE_DELAY_MS
    const timer = setTimeout(() => setActive((current) => (current + 1) % STAGES.length), delay)
    return () => clearTimeout(timer)
  }, [inView, reduced, active])

  const live = inView && !reduced

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-14 w-full max-w-6xl px-1 sm:mt-16 sm:px-2"
      aria-label="The research journey: idea, research, AI analysis, insight, then better decisions"
    >
      <div
        className="landing-glow absolute left-1/2 top-1/2 h-72 w-[min(50rem,92%)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative lg:hidden">
        {STAGES.map((stage, index) => (
          <Fragment key={stage.key}>
            <StageCard stage={stage} active={active === index} />
            {index < STAGES.length - 1 ? (
              <ConnectorVertical active={active === index + 1} live={live} />
            ) : null}
          </Fragment>
        ))}
      </div>

      <div className="relative hidden items-stretch lg:flex">
        {STAGES.map((stage, index) => (
          <Fragment key={stage.key}>
            <StageCard stage={stage} active={active === index} className="min-w-0 flex-1 basis-0" />
            {index < STAGES.length - 1 ? (
              <ConnectorHorizontal active={active === index + 1} live={live} />
            ) : null}
          </Fragment>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
        {STAGES.map((stage, index) => (
          <span
            key={stage.key}
            className={[
              'size-1.5 rounded-full transition-all duration-500',
              index === active ? 'w-5 bg-white' : 'bg-white/25',
            ].join(' ')}
          />
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        {reduced ? '' : `Current stage: ${STAGES[active].title}`}
      </span>
    </motion.div>
  )
}