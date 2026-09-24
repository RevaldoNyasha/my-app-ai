import { MotionConfig } from 'motion/react'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { ValueStrip } from '@/components/landing/ValueStrip'
import { ChatDemo } from '@/components/landing/ChatDemo'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

export function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="landing-ink relative min-h-screen overflow-x-clip text-slate-100 antialiased selection:bg-white/20 selection:text-white">
        <LandingNavbar />
        <main>
          <HeroSection />
          <ValueStrip />
          <ChatDemo />
          <FinalCTA />
        </main>
        <LandingFooter />
      </div>
    </MotionConfig>
  )
}