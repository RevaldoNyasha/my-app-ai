import { motion } from 'motion/react'
import { ResearchFlow } from './ResearchFlow'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" aria-label="Hero">
      <div className="landing-grid absolute inset-x-0 top-0 h-[62rem]" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-[36rem] w-[70rem] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="absolute left-[8%] top-48 h-72 w-72 rounded-full bg-white/[0.05] blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="absolute right-[6%] top-96 h-80 w-80 rounded-full bg-white/[0.04] blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center px-5 pb-16 pt-32 text-center sm:px-8 lg:pt-36">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-4xl text-[2.6rem] font-bold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]"
        >
          Turn research data
          <span className="mt-1 block bg-gradient-to-r from-white via-slate-300 to-white bg-clip-text text-transparent">
            into better decisions.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: 'easeOut' }}
          className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg"
        >
          ResearchMind AI helps you analyse interviews, transcripts, surveys and documents,
          uncover meaningful insights and make evidence-based decisions — all through a simple
          conversation.
        </motion.p>

        <ResearchFlow />
      </div>
    </section>
  )
}