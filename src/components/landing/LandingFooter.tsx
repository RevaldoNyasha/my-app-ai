import { Link } from 'react-router-dom'
import { SparkleIcon } from '@/components/ui/icons'

const LINK_GROUPS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Platform', to: '/platform' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Resources', to: '/resources' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#040505]">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5" aria-label="ResearchMind AI — home">
              <SparkleIcon className="size-8 text-white" aria-hidden="true" />
              <span className="text-[1.05rem] font-semibold tracking-tight text-white">
                ResearchMind <span className="text-white">AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-[0.88rem] leading-6 text-slate-400">
              AI-powered qualitative research analysis — turning interviews, documents and field
              data into evidence-backed insight.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {group.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[0.9rem] text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
          <p className="text-[0.82rem] text-slate-500">© 2026 ResearchMind AI</p>
          <p className="flex items-center gap-1.5 text-[0.82rem] text-slate-500">
            <span className="size-1.5 rounded-full bg-white/70" />
            Designed for African research contexts.
          </p>
        </div>
      </div>
    </footer>
  )
}
