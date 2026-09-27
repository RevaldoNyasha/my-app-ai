import { motion } from 'motion/react'
import { DatabaseIcon, GlobeIcon, ReportIcon } from '@/components/ui/icons'
import { LockIcon } from './icons'

const VALUES = [
  {
    title: 'Everything in one place',
    description: 'No more scattered files, drives and notebooks.',
    icon: DatabaseIcon,
  },
  {
    title: 'Processed for you',
    description: 'Transcribed and translated — English, Shona, Ndebele and more.',
    icon: GlobeIcon,
  },
  {
    title: 'Reports in minutes',
    description: 'Summaries and reports from your field data, fast.',
    icon: ReportIcon,
  },
  {
    title: 'Private and secure',
    description: 'Your research data stays yours.',
    icon: LockIcon,
  },
]

export function ValueStrip() {
  return (
    <section id="platform" className="relative" aria-label="Why ResearchMind">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group flex items-start gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.035]"
            >
              <div className="flex size-9 shrink-0 items-center justify-center text-white">
                <value.icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.93rem] font-semibold text-slate-100">{value.title}</p>
                <p className="mt-1 text-[0.8rem] leading-5 text-slate-400">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}