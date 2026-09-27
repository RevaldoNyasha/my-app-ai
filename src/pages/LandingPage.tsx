import { MarketingLayout } from '@/components/landing/MarketingLayout'
import { HeroSection } from '@/components/landing/HeroSection'
import { ValueStrip } from '@/components/landing/ValueStrip'
import { ChatDemo } from '@/components/landing/ChatDemo'
import { FinalCTA } from '@/components/landing/FinalCTA'

export function LandingPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <ValueStrip />
      <ChatDemo />
      <FinalCTA />
    </MarketingLayout>
  )
}
