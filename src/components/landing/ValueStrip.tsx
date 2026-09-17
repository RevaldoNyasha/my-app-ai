import { motion } from 'motion/react'
import { GlobeIcon } from '@/components/ui/icons'
import { LockIcon, TargetIcon, UsersIcon } from './icons'

const VALUES = [
  {
    title: 'For researchers',
    description: 'Academic, development, market and social research.',
    icon: UsersIcon,
  },
  {
    title: 'Multilingual',
    description: 'English, Shona, Ndebele and more.',
    icon: GlobeIcon,
  },
  {
    title: 'Secure',
    description: 'Your research data stays private.',
    icon: LockIcon,
  },
  {
    title: 'Real impact',
    description: 'Turn research into meaningful change.',
    icon: TargetIcon,
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
              className="group flex items-start gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 transition-colors duration-300 hover:border-emerald-400/20 hover:bg-white/[0.035]"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
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