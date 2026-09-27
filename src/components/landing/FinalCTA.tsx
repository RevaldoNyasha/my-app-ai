import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRightIcon } from '@/components/ui/icons'

export function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/[0.05] bg-[#0a0b0b]"
      aria-label="Get started"
    >
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        aria-hidden="true"
      />
      <div className="landing-grid absolute inset-x-0 bottom-0 h-[34rem]" aria-hidden="true" />
      <div
        className="absolute bottom-[-14rem] left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-white/[0.07] blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Start today
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Ready to put all your field data{' '}
            <span className="bg-gradient-to-r from-white via-slate-300 to-white bg-clip-text text-transparent">
              to work?
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-base leading-7 text-slate-400 sm:text-lg">
            Bring it together in one place, let ResearchMind process it, and create summaries and
            reports in minutes.
          </p>

          <div className="relative mt-10 inline-block">
            <Link
              to="/projects"
              className="group inline-flex h-13 items-center gap-2.5 rounded-xl border border-white/25 px-8 text-[1.02rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/50"
            >
              Start researching
              <ArrowRightIcon className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="mt-6 text-[0.82rem] text-slate-500">
            Early access — free during the research prototype.
          </p>
        </motion.div>
      </div>
    </section>
  )
}