import { Link } from 'react-router-dom'
import { LandingLogo } from './LandingLogo'

const LINK_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Platform', href: '#platform' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Resources', href: '#resources' },
      { label: 'Privacy', href: '#resources' },
      { label: 'Contact', href: '#resources' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer id="resources" className="relative border-t border-white/[0.06] bg-[#040807]">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5" aria-label="ResearchMind AI — home">
              <LandingLogo className="size-9" />
              <span className="text-[1.05rem] font-semibold tracking-tight text-white">
                ResearchMind <span className="text-emerald-300">AI</span>
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
                    <a
                      href={link.href}
                      className="text-[0.9rem] text-slate-400 transition-colors hover:text-emerald-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
          <p className="text-[0.82rem] text-slate-500">© 2026 ResearchMind AI</p>
          <p className="flex items-center gap-1.5 text-[0.82rem] text-slate-500">
            <span className="size-1.5 rounded-full bg-emerald-400/80" />
            Designed for African research contexts.
          </p>
        </div>
      </div>
    </footer>
  )
}