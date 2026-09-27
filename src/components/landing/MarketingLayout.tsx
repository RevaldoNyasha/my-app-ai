import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { MotionConfig, motion } from 'motion/react'
import { LandingNavbar } from './LandingNavbar'
import { LandingFooter } from './LandingFooter'

/** Shared dark shell for the landing page and the public marketing pages. */
export function MarketingLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  // Router navigation keeps the previous scroll position; public pages should open at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <MotionConfig reducedMotion="user">
      <div className="landing-ink relative min-h-screen overflow-x-clip text-slate-100 antialiased selection:bg-white/20 selection:text-white">
        <LandingNavbar />
        <main>{children}</main>
        <LandingFooter />
      </div>
    </MotionConfig>
  )
}

interface PageHeroProps {
  eyebrow: string
  title: string
  highlight?: string
  description: string
  children?: ReactNode
}

/** Page-top heading for marketing pages, sized down from the landing hero. */
export function PageHero({ eyebrow, title, highlight, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden" aria-label={eyebrow}>
      <div className="landing-grid absolute inset-x-0 top-0 h-[36rem]" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[130px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl px-5 pb-14 pt-36 text-center sm:px-8 lg:pt-40"
      >
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-[2.3rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
          {title}
          {highlight ? (
            <span className="block bg-gradient-to-r from-white via-slate-300 to-white bg-clip-text text-transparent">
              {highlight}
            </span>
          ) : null}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
          {description}
        </p>
        {children}
      </motion.div>
    </section>
  )
}

/** Fade-and-rise wrapper used for cards and sections as they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
