import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { DatabaseIcon, QuoteIcon, SendIcon, SparkleIcon } from '@/components/ui/icons'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionHeading } from './SectionHeading'
import {
  BrainIcon,
  ChartUpIcon,
  IdeaIcon,
  TargetIcon,
} from './icons'

const ANSWER_HEADER = 'I identified four recurring themes across the research data.'
const ANSWER_ITEMS = [
  '1. Financial barriers',
  '2. Distance to healthcare facilities',
  '3. Waiting times',
  '4. Healthcare quality',
]

const EVIDENCE = [
  {
    ref: 'Interview 03 · P03 · 04:32',
    quote: 'Sometimes I don\u2019t go to the clinic because I don\u2019t have enough money to travel there.',
  },
  {
    ref: 'Interview 07 · P07 · 12:18',
    quote: 'The clinic is very far from where we live.',
  },
]

const FLOW_ICONS = [IdeaIcon, DatabaseIcon, BrainIcon, ChartUpIcon, TargetIcon]
const FLOW_LABELS = ['Idea', 'Research', 'AI analysis', 'Insight', 'Decisions']

function TypingDots() {
  return (
    <span className="flex items-center gap-1" aria-label="Analysing">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="size-1.5 rounded-full bg-emerald-300"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.18 }}
        />
      ))}
      <span className="ml-1 text-[0.78rem] text-slate-400">Analysing your research data</span>
    </span>
  )
}

export function ChatDemo() {
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-15% 0px -15% 0px' })
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setPhase(3)
      return
    }
    const timers = [
      setTimeout(() => setPhase(1), 350),
      setTimeout(() => setPhase(2), 1900),
      setTimeout(() => setPhase(3), 3600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [inView, reduced])

  return (
    <section className="relative" aria-label="Ask questions about your research">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          eyebrow="Conversation"
          title="Ask questions about your research."
          description="ResearchMind is not a generic chatbot. Every answer points back to the sources it came from."
        />

        <div ref={sectionRef} className="mx-auto mt-12 w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 26 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a1512]/80 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),0_0_60px_-30px_rgba(16,185,129,0.35)]"
          >
            <div
              className="landing-glow absolute -top-24 left-1/2 h-48 w-[80%] -translate-x-1/2 rounded-full blur-2xl"
              aria-hidden="true"
            />

            <div className="relative flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-white/[0.12]" />
                <span className="size-2.5 rounded-full bg-white/[0.12]" />
                <span className="size-2.5 rounded-full bg-white/[0.12]" />
              </span>
              <span className="ml-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-0.5 text-[0.7rem] font-medium text-emerald-200/90">
                <SparkleIcon className="size-3" />
                ResearchMind chat
              </span>
              <span className="ml-auto text-[0.72rem] text-slate-500">Healthcare Access Study</span>
            </div>

            <div className="relative flex min-h-[26rem] flex-col gap-5 px-5 py-6 sm:px-7">
              {phase >= 1 ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex justify-end"
                >
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-400/[0.12] px-4 py-3 text-[0.9rem] leading-6 text-emerald-50 ring-1 ring-emerald-400/25">
                    <p>
                      What are the major barriers affecting access to healthcare among young
                      people?
                    </p>
                  </div>
                </motion.div>
              ) : null}

              {phase === 1 ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
                    <SparkleIcon className="size-4" />
                  </div>
                  <TypingDots />
                </motion.div>
              ) : null}

              {phase >= 2 ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-2.5"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
                    <SparkleIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-2xl rounded-tl-sm bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.07]">
                      <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: { transition: { staggerChildren: reduced ? 0 : 0.05 } },
                        }}
                        className="text-[0.9rem] leading-6 text-slate-200"
                      >
                        <motion.span
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 },
                          }}
                        >
                          {ANSWER_HEADER}{' '}
                        </motion.span>
                        {ANSWER_ITEMS.map((item, index) => (
                          <motion.span
                            key={item}
                            variants={{
                              hidden: { opacity: 0 },
                              visible: { opacity: 1 },
                            }}
                            className={index % 2 === 0 ? 'text-slate-100' : 'text-slate-300'}
                          >
                            {item}
                            {index < ANSWER_ITEMS.length - 1 ? ', ' : '.'}
                          </motion.span>
                        ))}
                      </motion.p>
                    </div>

                    {phase >= 3 ? (
                      <div className="mt-4 space-y-2.5">
                        <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
                          <QuoteIcon className="size-3.5" />
                          Evidence
                        </p>
                        {EVIDENCE.map((item, index) => (
                          <motion.div
                            key={item.ref}
                            initial={reduced ? false : { opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.18, ease: 'easeOut' }}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3"
                          >
                            <p className="text-[0.7rem] font-medium tracking-wide text-emerald-200/80">
                              {item.ref}
                            </p>
                            <p className="mt-1 text-[0.84rem] leading-6 text-slate-300">
                              &ldquo;{item.quote}&rdquo;
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}

              {phase >= 3 ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-auto flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5"
                >
                  <div className="flex flex-1 items-center gap-2.5">
                    {FLOW_ICONS.map((Icon, index) => (
                      <span
                        key={FLOW_LABELS[index]}
                        title={FLOW_LABELS[index]}
                        className="flex size-6 items-center justify-center rounded-md border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300/70"
                      >
                        <Icon className="size-3.5" />
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Send message"
                    className="flex size-9 items-center justify-center rounded-lg bg-emerald-400 text-[#05120c] transition-colors hover:bg-emerald-300"
                  >
                    <SendIcon className="size-4" />
                  </button>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}