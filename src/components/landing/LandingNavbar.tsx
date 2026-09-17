import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, CloseIcon, MenuIcon } from '@/components/ui/icons'
import { LandingLogo } from './LandingLogo'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const containerClass = [
    'fixed inset-x-0 top-0 z-50 transition-all duration-300',
    scrolled
      ? 'border-b border-white/[0.06] bg-[#050908]/85 backdrop-blur-xl'
      : 'border-b border-transparent bg-transparent',
  ].join(' ')

  return (
    <header className={containerClass}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="ResearchMind AI — home"
          onClick={() => setOpen(false)}
        >
          <LandingLogo className="size-8" />
          <span className="text-[0.98rem] font-semibold tracking-tight text-white">
            ResearchMind <span className="text-emerald-300">AI</span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-2.5 lg:flex">
          <Link
            to="/dashboard"
            className="rounded-lg px-3.5 py-2 text-[0.9rem] font-medium text-slate-200 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="group inline-flex h-9.5 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-[0.9rem] font-semibold text-[#05120c] shadow-[0_0_22px_-8px_rgba(52,211,153,0.7)] transition-all duration-200 hover:-translate-y-px hover:bg-emerald-300"
          >
            Get started
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          className="ml-auto inline-flex size-9.5 items-center justify-center rounded-lg border border-white/[0.08] text-slate-200 transition-colors hover:bg-white/[0.05] lg:hidden"
        >
          {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/[0.06] bg-[#050908]/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-4 sm:px-8" aria-label="Account">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-center text-[0.92rem] font-medium text-slate-100 transition-colors hover:bg-white/[0.05]"
            >
              Sign in
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-[0.92rem] font-semibold text-[#05120c]"
            >
              Get started
              <ArrowRightIcon className="size-4" />
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}