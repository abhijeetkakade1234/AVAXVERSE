import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksJourney } from '@/components/landing/HowItWorksJourney'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="bg-[#0a0a0f] text-slate-100 font-display antialiased selection:bg-[#ec3c3f]/30 overflow-x-hidden w-full relative flex flex-col items-center pb-0">
      <HeroSection />
      <div className="relative z-10 w-full">
        <HowItWorksJourney />
      </div>
      <Footer />
    </main>
  )
}
