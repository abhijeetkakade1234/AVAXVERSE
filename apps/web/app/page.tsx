import { HeroSection } from '@/components/landing/HeroSection'
import { WorkflowSection } from '@/components/landing/WorkflowSection'
import { FeaturesGridSection } from '@/components/landing/FeaturesGridSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { StatsSection } from '@/components/landing/StatsSection'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="bg-[#0a0a0f] text-slate-100 font-display antialiased selection:bg-[#f42525]/30 overflow-x-hidden w-full relative flex flex-col items-center pb-0">
      <HeroSection />
      <div className="relative z-10 w-full">
        <StatsSection />
        <FeaturesSection />
        <WorkflowSection />
        <FeaturesGridSection />
        <CtaSection />
      </div>
      <Footer />
      {/* Wave Patterns bottom (moved inside main, before footer, as in design ref or globally behind footer) */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20 pointer-events-none overflow-hidden z-0">
        <svg className="w-[200%] h-full animate-wave" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path d="M0 50 C 150 100, 350 0, 500 50 C 650 100, 850 0, 1000 50 L 1000 100 L 0 100 Z" fill="#f42525"></path>
        </svg>
      </div>
    </main>
  )
}
