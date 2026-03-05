import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import PillarCard from "@/components/PillarCard"
import Parallax from "@/components/Parallax"
import EcosystemSection from "@/components/EcosystemSection"
import SecuritySection from "@/components/SecuritySection"
import CTASection from "@/components/CTASection"
import Footer from "@/components/Footer"
import HorizontalScroll from "@/components/HorizontalScroll"

export default function Home() {

  const pillars = [
    {
      title: "Sovereign Identity",
      desc: "Own your data and digital presence across the Avalanche ecosystem seamlessly.",
      bg: "bg-primary/20",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKpf-AOXv5QtSGJdsK5H1E4AlRFDDhbgTuFHSIS6dMtf3G-lu_4Isl1Nfj7mV69XG6OVzmI3UhqqpIxWG6nr1z1mcIlxRg9avsuI9pC8TOFJYFXeFThxBSLty-wmZLRKKjMVY5QOO7MkKCAyv37Zpv4RR3HpGWxvlxkWTvPwWWcxsniSBeiI7IBHKNq4Q9Kvv1_ALZ4sCuQAKJGn6JMDTzgFCEB8tT0QVkQta0SPH1oBeuqAJhwdiAmlIglsD2iVnuWWahRAL9Dtw",
      blendMode: "mix-blend-overlay",
      textColor: "text-gray-700"
    },
    {
      title: "Trustless Finance",
      desc: "Access decentralized financial tools with institutional-grade security.",
      bg: "bg-gray-900",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRZ2KR2ojUoEBoxt65RI4flv6LLWx9Wzv75CrrX7hpXkwDq2tCAiAUPk94NuinbanFub3HldXRnNnv_O3gQKGlKEmlxDCWokrARbh6G-4jxqQ0c98q0lM5Nn7deXTaR1G94GsoqDnBgnVAs5dBbzg6_Mp9qoZkrx9M6v5oGkUEuOlDgCvNlvqqNiNFwMSHfYgZOrvP8v0CRQtxyiKdwpoOKUTPLpStkfpsKEScEBJN97arvLuB75wz94oYEgHXxeRTIe7lno1jlwI",
      blendMode: "mix-blend-screen",
      textColor: "text-white",
      imgPadding: "bg-white/10"
    },
    {
      title: "Verifiable Reputation",
      desc: "Build a portable on-chain reputation based on your actual activity and achievements.",
      bg: "bg-white",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM8-asCWJKGEm_5pMsCe2Kq7BFWLzX3-Ugnmnz-DN4hKLazNzUlTkV-QxRs1-FvAsnrmkG2XOEHnNM1eBO8uJmh57iVPChzW9dKFz66DtMv3CnB3xil9vuM9MAejP66ct2gF2YFAvUmXimMQ9ZBZHkg2Z_sQKL1jfpKBsXUkyEaKLolxGL_Vq3BV9KD9VWhF3aG8wACVGFbHzVkLo4piQjfQqeO8g2Bg8WlQ_EXEGFMOShA3fN9NDr-uGdks9oMRUpWVW2noYb-zE",
      blendMode: "mix-blend-multiply",
      textColor: "text-gray-900",
      imgPadding: "bg-black/5"
    },
    {
      title: "Community Governance",
      desc: "Participate in shaping the future of the Avalanche ecosystem through decentralized voting.",
      bg: "bg-indigo-900/40",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C89vW7GKWQ6O_vI7Y3Gq0f_fT8p6G7d_0Z6W_7f9_9O5p_9H2v_9m_9n_9o_9p_9q_9r_9s_9t_9u_9v_9w_9x_9y_9z",
      blendMode: "mix-blend-overlay",
      textColor: "text-white"
    }
  ]

  return (
    <main className="relative z-10 font-display bg-background-light">
      <Navbar />
      <Parallax />

      <section id="hero" className="min-h-screen flex items-center px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <Hero />
        </div>
      </section>

      {/* Core Pillars - Horizontal Pinned Scroll */}
      <HorizontalScroll id="pillars">
        <div className="flex flex-col gap-12 min-w-[300px]">
          <div className="flex items-center gap-2 bg-white/40 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 w-fit">
            <span className="material-icons text-primary text-base">sync</span>
            <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Core Pillars</span>
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

      <HorizontalScroll id="ecosystem">
        <EcosystemSection />
      </HorizontalScroll>

      <HorizontalScroll id="security">
        <SecuritySection />
      </HorizontalScroll>

      <section id="cta" className="min-h-screen flex items-center px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <CTASection />
        </div>
      </section>

      <section className="px-4 md:px-8 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <Footer />
        </div>
      </section>
    </main>
  )
}