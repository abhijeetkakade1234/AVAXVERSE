import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import PillarCard from "@/components/PillarCard"
import Parallax from "@/components/Parallax"
import EcosystemSection from "@/components/EcosystemSection"
import SecuritySection from "@/components/SecuritySection"
import MissionLifecycle from "@/components/MissionLifecycle"
import CTASection from "@/components/CTASection"
import Footer from "@/components/Footer"
import HorizontalScroll from "@/components/HorizontalScroll"

export default function Home() {

  const pillars = [
    {
      title: "Self-Sovereign Identity",
      desc: "Own your digital presence with unique on-chain DIDs and verified credentials.",
      bg: "bg-primary/20 dark:bg-card-dark-1",
      icon: "fingerprint",
      textColor: "text-white"
    },
    {
      title: "Reputation Assets",
      desc: "Rise from Apprentice to Legend. Own a permanent, soulbound record of your elite performance and verified expertise.",
      bg: "bg-gray-900",
      icon: "verified",
      textColor: "text-white",
      imgPadding: "bg-white/10"
    },
    {
      title: "Escrow Protection",
      desc: "Secure mission payments via automated, milestone-bound smart contracts.",
      bg: "bg-card-blue",
      icon: "lock_open",
      textColor: "text-white",
      imgPadding: "bg-white/10"
    },
    {
      title: "Governor DAO",
      desc: "Shape the ecosystem's future through decentralized, reputation-weighted voting.",
      bg: "bg-card-dark-2",
      icon: "how_to_reg",
      textColor: "text-white"
    },
    {
      title: "Mission Marketplace",
      desc: "Connect top-tier talent with ambitious projects in a trustless environment.",
      bg: "bg-[#5D5FEF]",
      icon: "layers",
      textColor: "text-white"
    }
  ]

  return (
    <div className="bg-[#B4AAFD] bg-gradient-to-b from-[#B4AAFD] via-[#9B8CFA] to-[#1A1A2E] dark:from-[#1A1A2E] dark:to-[#121222] text-gray-900 dark:text-white font-display antialiased min-h-screen flex flex-col relative">
      <Navbar />
      <Parallax />

      <main className="flex-grow pt-24 pb-20 relative z-10 w-full">
        {/* Hero Section */}
        <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-32">
          <Hero />
        </section>

        {/* Core Pillars - Framer Motion Fixed Horizontal Scroll */}
        <HorizontalScroll id="pillars">
          <div className="flex flex-col gap-8 min-w-[320px] mr-12">
            <div className="flex items-center gap-2 bg-white/40 dark:bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 w-fit">
              <span className="material-icons text-primary dark:text-white text-base">sync</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Core Pillars</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              The foundation of<br />your digital future.
            </h2>
          </div>
          {pillars.map((pillar, index) => (
            <PillarCard
              key={index}
              {...pillar}
            />
          ))}
        </HorizontalScroll>

        {/* Mission Lifecycle - New Section */}
        <HorizontalScroll id="mission-lifecycle">
          <MissionLifecycle />
        </HorizontalScroll>

        {/* Ecosystem Section - Pinned Horizontal Scroll */}
        <HorizontalScroll id="ecosystem">
          <EcosystemSection />
        </HorizontalScroll>

        {/* Security Section - Pinned Horizontal Scroll */}
        <HorizontalScroll id="security">
          <SecuritySection />
        </HorizontalScroll>

        {/* CTA Section */}
        <section id="cta" className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-32 mb-32">
          <CTASection />
        </section>

        {/* Footer Section */}
        <section className="px-4 md:px-8 max-w-7xl mx-auto w-full py-20">
          <Footer />
        </section>
      </main>
    </div>
  )
}