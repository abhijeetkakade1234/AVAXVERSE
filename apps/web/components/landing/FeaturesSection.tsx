import { Fingerprint, Lock, Star, Vote, Sparkles } from 'lucide-react'

const FEATURES = [
    {
        icon: <Fingerprint size={24} />,
        title: 'Sovereign Identity',
        body: 'Your wallet is your passport. Verifiable credentials that belong to you, not a database.',
    },
    {
        icon: <Lock size={24} />,
        title: 'Atomic Escrow',
        body: 'Smart contracts act as neutral arbiters. Payment is released only when milestones are verified.',
    },
    {
        icon: <Star size={24} />,
        title: 'Proof of Reputation',
        body: 'Earn non-transferable badges for every successful mission. Your history is your capital.',
    },
    {
        icon: <Vote size={24} />,
        title: 'On-Chain Governance',
        body: 'The protocol is governed by the users. Propose, vote, and evolve the ecosystem together.',
    },
] as const

export function FeaturesSection() {
    return (
        <section className="relative overflow-hidden bg-[#050507] shrink-0 w-full py-48 md:py-80 border-y border-white/5 flex flex-col items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-red-500/[0.03] blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-6xl px-6 relative space-y-48 md:space-y-64">
                <div className="flex flex-col md:flex-row gap-20 items-start md:items-end">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 mb-6 text-red-500 font-bold text-xs uppercase tracking-[0.2em] leading-none">
                            <Sparkles size={14} /> Technical Foundation
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none gradient-text-subtle italic">
                            A NEW ERA <br /> OF <span className="text-red-500">TRUST.</span>
                        </h2>
                    </div>
                    <div className="md:w-1/3">
                        <p className="text-white/40 text-lg md:text-xl leading-relaxed font-medium">
                            AVAXVERSE replaces trust with math using hyper-secure smart contracts and decentralized ID protocols.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {FEATURES.map((f, i) => (
                        <div key={f.title} className="glass p-8 md:p-12 border-white/5 group card-hover relative overflow-hidden" style={{ animationDelay: `${i * 0.15}s` }}>
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-[0.03] group-hover:opacity-10 transition-all duration-500 scale-125">
                                {f.icon}
                            </div>
                            <div className="relative mt-2 max-w-sm">
                                <h3 className="text-2xl md:text-3xl font-black mb-4 group-hover:text-red-500 transition-colors uppercase tracking-tight italic">{f.title}</h3>
                                <p className="text-white/40 text-base md:text-lg leading-relaxed">{f.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
