'use client'

import React from 'react'
import { UserCheck, Wallet, ShieldCheck, Vote, BarChart3 } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const solutions = [
    {
        icon: UserCheck,
        title: 'On-chain Identity',
        desc: 'Secure your digital footprint with unique, evolution-ready profile NFTs that serve as your sovereign passport across the ecosystem.',
        position: 'top-left',
    },
    {
        icon: BarChart3,
        title: 'Integrated DeFi',
        desc: 'Powerful financial instruments and charts integrated natively. Direct access to Avalanche liquidity.',
        position: 'top-right',
    },
    {
        icon: Wallet,
        title: 'Freelance Escrow',
        desc: 'Trustless, smart contract-based payments with automated security locks. No middleman, no chargebacks.',
        position: 'bottom-left',
    },
    {
        icon: ShieldCheck,
        title: 'Reputation Score',
        desc: 'Verifiable on-chain metrics for every network participant. Your score of 95+ follows you everywhere.',
        position: 'bottom-center',
    },
    {
        icon: Vote,
        title: 'DAO Governance',
        desc: 'Active participation in ecosystem steering through decentralized voting and proposal systems.',
        position: 'bottom-right',
    },
]

export function SolutionSection() {
    return (
        <section className="relative py-40 md:py-64 px-6 w-full bg-black overflow-hidden flex flex-col items-center">
            {/* Background ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[600px] bg-[var(--avax-red)]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto w-full space-y-20 md:space-y-32">
                {/* Header */}
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <Reveal direction="up">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--avax-red)]/20 bg-[var(--avax-red)]/5 backdrop-blur-md">
                            <span className="text-[10px] font-black tracking-[0.3em] text-[var(--avax-red)] uppercase">The Next Frontier</span>
                        </div>
                    </Reveal>
                    <Reveal direction="up" delay={0.1}>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] text-white">
                            Our Solution — <span className="gradient-text">AVAXVERSE</span>
                        </h2>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <p className="text-lg md:text-xl text-[var(--avax-muted)] font-light leading-relaxed max-w-2xl mx-auto">
                            A unified, high-performance ecosystem designed to redefine decentralized collaboration and digital ownership.
                        </p>
                    </Reveal>
                </div>

                {/* Central Diamond + Radial Features Layout */}
                <div className="relative w-full">
                    {/* Central Diamond */}
                    <Reveal direction="up" delay={0.3}>
                        <div className="relative mx-auto w-40 h-40 md:w-56 md:h-56 mb-16 md:mb-0 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20">
                            <div className="w-full h-full rotate-45 rounded-3xl bg-gradient-to-br from-[var(--avax-red)] to-[#ff6b6b] shadow-[0_0_80px_20px_rgba(232,65,66,0.3)] flex items-center justify-center">
                                <div className="-rotate-45 flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="md:w-8 md:h-8">
                                            <path d="M12 2L2 19.5H22L12 2Z" fill="white" />
                                        </svg>
                                    </div>
                                    <span className="text-white/90 text-[10px] md:text-xs font-bold tracking-wider uppercase">AVAXVERSE</span>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Feature Cards - 2 on top, 3 on bottom for desktop; column for mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 md:pb-8">
                        {solutions.slice(0, 2).map((item, i) => (
                            <Reveal key={i} direction="up" delay={0.3 + (i * 0.1)}>
                                <div className="group p-8 bg-gradient-to-br from-[#0e0e16] to-[#0a0a12] border border-white/[0.06] rounded-2xl text-left transition-all duration-500 hover:border-[var(--avax-red)]/25 hover:shadow-[0_0_60px_-15px_rgba(232,65,66,0.15)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--avax-red)]/0 group-hover:bg-[var(--avax-red)]/5 blur-3xl transition-all duration-700 rounded-full pointer-events-none" />
                                    <div className="relative z-10 space-y-4">
                                        <div className="size-11 rounded-xl bg-[var(--avax-red)]/8 border border-[var(--avax-red)]/15 flex items-center justify-center text-[var(--avax-red)] group-hover:bg-[var(--avax-red)]/15 group-hover:scale-110 transition-all duration-500">
                                            <item.icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-[var(--avax-red)] transition-colors">{item.title}</h3>
                                        <p className="text-sm text-[var(--avax-muted)] font-light leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    {/* Center spacer for desktop diamond overlap */}
                    <div className="hidden md:block h-24" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-0">
                        {solutions.slice(2).map((item, i) => (
                            <Reveal key={i} direction="up" delay={0.5 + (i * 0.1)}>
                                <div className="group p-8 bg-gradient-to-br from-[#0e0e16] to-[#0a0a12] border border-white/[0.06] rounded-2xl text-left transition-all duration-500 hover:border-[var(--avax-red)]/25 hover:shadow-[0_0_60px_-15px_rgba(232,65,66,0.15)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--avax-red)]/0 group-hover:bg-[var(--avax-red)]/5 blur-3xl transition-all duration-700 rounded-full pointer-events-none" />
                                    <div className="relative z-10 space-y-4">
                                        <div className="size-11 rounded-xl bg-[var(--avax-red)]/8 border border-[var(--avax-red)]/15 flex items-center justify-center text-[var(--avax-red)] group-hover:bg-[var(--avax-red)]/15 group-hover:scale-110 transition-all duration-500">
                                            <item.icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-[var(--avax-red)] transition-colors">{item.title}</h3>
                                        <p className="text-sm text-[var(--avax-muted)] font-light leading-relaxed">{item.desc}</p>
                                        {item.title === 'Reputation Score' && (
                                            <div className="text-2xl font-black text-[var(--avax-red)]">95+</div>
                                        )}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
