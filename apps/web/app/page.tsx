'use client'

import { useRouter } from 'next/navigation'
import {
  Rocket,
  Briefcase,
  Shield,
  Star,
  Users,
  ArrowRight,
  Fingerprint,
  Lock,
  Vote,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { AnimatedShaderHero } from '@/components/ui/animated-shader-hero'

const STATS = [
  { label: 'Identities', value: '1,284', unit: 'active' },
  { label: 'Mission Ops', value: '342', unit: 'secured' },
  { label: 'Escrow Flow', value: '42k', unit: 'AVAX' },
  { label: 'Trust Score', value: '99.8', unit: 'avg' },
] as const

const FEATURES = [
  {
    num: '01',
    icon: <Fingerprint size={20} />,
    title: 'Sovereign Identity',
    body: 'Your wallet is your passport. Verifiable credentials that belong to you, not a database.',
  },
  {
    num: '02',
    icon: <Lock size={20} />,
    title: 'Atomic Escrow',
    body: 'Smart contracts act as neutral arbiters. Payment is released only when milestones are verified.',
  },
  {
    num: '03',
    icon: <Star size={20} />,
    title: 'Proof of Reputation',
    body: 'Earn non-transferable badges for every successful mission. Your history is your capital.',
  },
  {
    num: '04',
    icon: <Vote size={20} />,
    title: 'On-Chain Governance',
    body: 'The protocol is governed by the users. Propose, vote, and evolve the ecosystem together.',
  },
] as const

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="bg-black">
      {/* 1. HERO SECTION */}
      <section className="relative h-[100svh] min-h-[800px] w-full overflow-hidden shrink-0">
        <AnimatedShaderHero
          trustBadge={{
            text: 'Avalanche C-Chain Mainnet Ready',
            icon: <Shield size={13} />,
          }}
          headline={{ line1: 'DAOs. Jobs.', line2: 'Real Reputation.' }}
          subtitle="The unified operating layer for the future of work. Secure identities, trustless payments, and decentralized growth."
          buttons={{
            primary: {
              text: 'Initialize ID',
              icon: <Rocket size={17} />,
              onClick: () => router.push('/profile'),
            },
            secondary: {
              text: 'Enter Market',
              icon: <Briefcase size={17} />,
              onClick: () => router.push('/jobs'),
            },
          }}
        />
      </section>

      {/* 2. STATS SECTION */}
      <section className="relative z-20 px-6 shrink-0 w-full max-w-6xl mx-auto py-12 md:py-24">
        <div className="glass p-1 border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-white/5 rounded-[1.4rem] grid grid-cols-2 md:grid-cols-4 gap-px">
            {STATS.map((s, i) => (
              <div key={s.label} className="bg-black p-8 text-center animate-enter" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl md:text-5xl font-black text-red-500 mb-1">{s.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{s.unit}</div>
                <div className="text-xs font-bold text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MASSIVE SPACER TO PREVENT OVERLAP */}
      <div className="w-full h-48 md:h-80 bg-black pointer-events-none" />

      {/* 3. FEATURES SECTION */}
      <section className="relative overflow-hidden bg-[#050507] shrink-0 w-full py-24 border-y border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-red-500/[0.03] blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row gap-16 items-start md:items-end mb-24">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-8 text-red-500 font-black text-xs uppercase tracking-widest leading-none">
                <Sparkles size={16} /> Technical Foundation
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none gradient-text-subtle italic">
                A NEW ERA <br /> OF <span className="text-red-500">TRUST.</span>
              </h2>
            </div>
            <div className="md:w-1/3">
              <p className="text-white/40 text-lg md:text-xl leading-relaxed font-light">
                AVAXVERSE replaces trust with math using hyper-secure smart contracts and decentralized ID protocols.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.num} className="glass p-10 md:p-12 border-white/5 group card-hover relative overflow-hidden" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="absolute top-0 right-0 p-8 transform translate-x-8 -translate-y-8 opacity-[0.03] group-hover:opacity-10 transition-all duration-500 scale-150">
                  {f.icon}
                </div>
                <div className="text-8xl font-black text-white/[0.02] absolute top-6 left-6 select-none group-hover:text-red-500/5 transition-colors">
                  {f.num}
                </div>
                <div className="relative mt-12 max-w-sm">
                  <h3 className="text-2xl md:text-3xl font-black mb-4 group-hover:text-red-500 transition-colors uppercase tracking-tight italic">{f.title}</h3>
                  <p className="text-white/40 text-base leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW SECTION */}
      <section className="dot-grid shrink-0 w-full py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-20 items-end mb-32">
            <div className="flex-shrink-0 relative w-40 md:w-48 flex justify-center">
              <div className="w-24 h-2 bg-red-500 rounded-full mx-auto" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                Three Steps <br />to Freedom.
              </h2>
            </div>
          </div>

          <div className="space-y-40">
            <Step
              num="01"
              title="Claim Identity"
              desc="Deploy your sovereign ID on the Avalanche C-Chain. Your digital shadow begins here."
              icon={<Fingerprint size={40} />}
            />
            <Step
              num="02"
              title="Secure The Mission"
              desc="Funds are locked in a trustless escrow contract. No middleman, no chargebacks."
              icon={<Lock size={40} />}
            />
            <Step
              num="03"
              title="Harvest Reputation"
              desc="Completed work mints Soulbound Tokens. Your past successes fuel your future growth."
              icon={<Star size={40} />}
            />
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="relative bg-[#0a0a0f] overflow-hidden shrink-0 w-full py-40 border-y border-white/5">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

        <div className="max-w-4xl mx-auto px-6 relative text-center">
          <div className="inline-block p-5 bg-red-500/10 rounded-3xl border border-red-500/20 mb-10 animate-pulse">
            <Users size={40} className="text-red-500" />
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-none italic uppercase">
            READY TO <br /><span className="text-red-500 underline decoration-8 underline-offset-16">INITIATE?</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/30 mb-16 max-w-2xl mx-auto leading-relaxed font-light">
            Join the decentralized workforce. Permissionless and sovereign.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="btn-primary py-6 px-16 text-2xl hover:scale-105 active:scale-95 shadow-red-500/60" onClick={() => router.push('/profile')}>
              Connect Identity
            </button>
            <button className="btn-secondary py-6 px-16 text-2xl hover:bg-white/5" onClick={() => router.push('/jobs')}>
              Enter Board
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-black shrink-0 w-full">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-center gap-12 opacity-30 text-[11px] font-black tracking-[0.4em] uppercase border-t border-white/10">
          <div>© 2026 AVAXVERSE // FORGED IN AVALANCHE</div>
          <div className="flex gap-12">
            <a href="#" className="hover:text-red-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-red-500 transition-colors">Governance</a>
            <a href="#" className="hover:text-red-500 transition-colors">Fuji Lab</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> CORE ONLINE
          </div>
        </div>
      </footer>
    </main>
  )
}

function Step({ num, title, desc, icon }: { num: string, title: string, desc: string, icon: any }) {
  return (
    <div className="flex flex-col md:flex-row gap-20 items-center group">
      <div className="flex-shrink-0 relative">
        <div className="text-[200px] md:text-[240px] font-black text-white/[0.04] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none group-hover:text-red-500/10 transition-colors leading-none tracking-tighter">
          {num}
        </div>
        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-[3.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-red-500 group-hover:border-red-500/20 group-hover:bg-red-500/5 transition-all duration-700 shadow-2xl">
          <div className="scale-150 transform transition-transform group-hover:scale-[1.7]">{icon}</div>
        </div>
      </div>
      <div className="text-center md:text-left space-y-6">
        <h3 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase group-hover:text-red-500 transition-colors leading-none">{title}</h3>
        <p className="text-white/40 text-2xl max-w-xl leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  )
}
