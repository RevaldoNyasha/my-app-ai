import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRightIcon } from '@/components/ui/icons'

export function FinalCTA() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-t border-white/[0.05] bg-[#07110e]"
      aria-label="Get started"
    >
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent"
        aria-hidden="true"
      />
      <div className="landing-grid absolute inset-x-0 bottom-0 h-[34rem]" aria-hidden="true" />
      <div
        className="absolute bottom-[-14rem] left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.1] blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
            Start today
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Ready to understand your research
            <span className="bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
              differently?
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-base leading-7 text-slate-400 sm:text-lg">
            Turn interviews, documents and field data into organised, searchable and
            evidence-backed insight.
          </p>

          <div className="relative mt-10 inline-block">
            <div
              className="absolute inset-0 -z-10 scale-125 rounded-full bg-emerald-400/25 blur-3xl"
              aria-hidden="true"
            />
            <Link
              to="/projects/healthcare-access/chat"
              className="group inline-flex h-13 items-center gap-2.5 rounded-xl bg-emerald-400 px-8 text-[1.02rem] font-semibold text-[#05120c] shadow-[0_0_40px_-10px_rgba(52,211,153,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_0_56px_-12px_rgba(52,211,153,1)]"
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