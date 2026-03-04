import { HeroSection } from '@/components/landing/HeroSection'
import { VisionSection } from '@/components/landing/VisionSection'
import { StatsSection } from '@/components/landing/StatsSection'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { SolutionSection } from '@/components/landing/SolutionSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="bg-black overflow-x-hidden w-full relative flex flex-col items-center">
      <HeroSection />

      {/* Content Sections Container - Forced spacing via inline styles to ensure "Airy" look */}
      <div className="w-full relative z-10 flex flex-col items-center bg-black">
        <div style={{ padding: '16rem 0', width: '100%' }}><VisionSection /></div>
        <div style={{ padding: '12rem 0', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><StatsSection /></div>
        <div style={{ padding: '16rem 0', width: '100%' }}><ProblemSection /></div>
        <div style={{ padding: '16rem 0', width: '100%' }}><SolutionSection /></div>
        <div style={{ padding: '16rem 0', width: '100%' }}><HowItWorksSection /></div>
        <div style={{ padding: '16rem 0', width: '100%' }}><FeaturesSection /></div>
        <div style={{ padding: '16rem 0', width: '100%' }}><CtaSection /></div>
      </div>

      <Footer />
    </main>
  )
}
