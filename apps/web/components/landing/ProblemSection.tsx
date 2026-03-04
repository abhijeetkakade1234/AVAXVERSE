'use client'

import React from 'react'
import { Globe, ShieldOff, Layers, UserX } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const problems = [
    {
        icon: Globe,
        title: 'Fragmented Ecosystem',
        desc: 'The Web3 landscape is divided across multiple chains and protocols with zero cohesion, forcing users to navigate complex bridges and isolated liquidity pools.',
    },
    {
        icon: ShieldOff,
        title: 'No Unified Reputation',
        desc: 'Users lack a verified way to prove their credibility, history, and achievements across different decentralized applications, leading to constant re-verification.',
    },
    {
        icon: Layers,
        title: 'Siloed Infrastructure',
        desc: 'Identity, freelancing, DeFi, and governance operate in complete isolation, creating friction and forcing users to manage multiple disconnected identities.',
    },
    {
        icon: UserX,
        title: 'Weak Wallet Trust',
        desc: 'Establishing trust between anonymous wallets remains the primary barrier. Without a reliable trust layer, high-value transactions remain risky and insecure.',
    },
]

export function ProblemSection() {
    return (
        <section className="relative w-full py-40 md:py-64 bg-black overflow-hidden flex flex-col items-center">
            {/* Ambient crystalline glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(232,65,66,0.15) 0%, rgba(232,65,66,0.05) 40%, transparent 70%)',
                }} />
            {/* Diamond shape in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rotate-45 border border-[var(--avax-red)]/10 rounded-3xl opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rotate-45 border border-[var(--avax-red)]/15 rounded-2xl opacity-15 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center space-y-20 md:space-y-32">
                {/* Header */}
                <div className="max-w-3xl mx-auto space-y-6">
                    <Reveal direction="up">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--avax-red)]/20 bg-[var(--avax-red)]/5 backdrop-blur-md">
                            <span className="text-[10px] font-black tracking-[0.3em] text-[var(--avax-red)] uppercase">System Inefficiency</span>
                        </div>
                    </Reveal>
                    <Reveal direction="up" delay={0.1}>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] text-white">
                            Fragmented Ecosystem,{' '}
                            <span className="gradient-text italic">Broken Trust</span>
                        </h2>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <p className="text-lg md:text-xl text-[var(--avax-muted)] font-light leading-relaxed max-w-2xl mx-auto">
                            The current Web3 landscape faces critical hurdles that prevent mainstream adoption and institutional integration.
                        </p>
                    </Reveal>
                </div>

                {/* 2x2 Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-5xl mx-auto">
                    {problems.map((item, i) => (
                        <Reveal key={i} direction="up" delay={0.2 + (i * 0.1)}>
                            <div className="group h-full p-8 md:p-10 bg-gradient-to-br from-[#0e0e16] to-[#0a0a12] border border-white/[0.06] rounded-2xl md:rounded-3xl text-left transition-all duration-500 hover:border-[var(--avax-red)]/25 hover:shadow-[0_0_60px_-15px_rgba(232,65,66,0.15)] relative overflow-hidden">
                                {/* Subtle corner glow on hover */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--avax-red)]/0 group-hover:bg-[var(--avax-red)]/5 blur-3xl transition-all duration-700 rounded-full pointer-events-none" />
                                
                                <div className="relative z-10 space-y-6">
                                    <div className="size-12 rounded-xl bg-[var(--avax-red)]/8 border border-[var(--avax-red)]/15 flex items-center justify-center text-[var(--avax-red)] group-hover:bg-[var(--avax-red)]/15 group-hover:scale-110 transition-all duration-500">
                                        <item.icon size={22} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-[var(--avax-red)] transition-colors duration-300">
                                            {item.title}
                                        </h3>
                                        <p className="text-[var(--avax-muted)] text-sm md:text-base font-light leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
