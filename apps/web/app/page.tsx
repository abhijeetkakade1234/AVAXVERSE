import { HeroSection } from '@/components/landing/HeroSection'
// import { StatsSection } from '@/components/landing/StatsSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { WorkflowSection } from '@/components/landing/WorkflowSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="bg-black overflow-x-hidden w-full relative flex flex-col items-center pb-0">
      <HeroSection />
      <FeaturesSection />
      {/* <StatsSection /> */}
      <WorkflowSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
