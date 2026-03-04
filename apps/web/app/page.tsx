import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { WorkflowSection } from '@/components/landing/WorkflowSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="bg-[#0a0a0f] text-slate-100 font-display antialiased selection:bg-[#f42525]/30 overflow-x-hidden w-full relative flex flex-col items-center pb-0">
      <HeroSection />
      <div className="relative z-10 w-full">
        <WorkflowSection />
        <FeaturesSection />
        <CtaSection />
      </div>
      <Footer />
    </main>
  )
}
