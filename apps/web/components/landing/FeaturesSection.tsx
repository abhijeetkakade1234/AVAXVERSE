'use client'

import React from 'react'
import { Shield, Lock, Award, BarChart3, DollarSign, Zap } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const features = [
    {
        title: 'Sovereign Identity',
        icon: Shield,
        desc: 'Complete control over your digital persona with decentralized identifiers and private verifiable credentials.',
    },
    {
        title: 'Atomic Escrow',
        icon: Lock,
        desc: 'Secure, automated asset holding and release mechanisms for peer-to-peer trades with zero counterparty risk.',
    },
    {
        title: 'Proof of Reputation',
        icon: Award,
        desc: 'Build trust through verified on-chain history and community contribution metrics that matter.',
    },
    {
        title: 'On-Chain Governance',
        icon: BarChart3,
        desc: 'Participate in the evolution of the network through transparent, tamper-proof voting and proposal systems.',
    },
    {
        title: 'Trustless Payments',
        icon: DollarSign,
        desc: 'Instant, borderless transactions with zero reliance on third-party intermediaries or centralized gateways.',
    },
    {
        title: 'Sub-second Finality',
        icon: Zap,
        desc: 'Experience lightning-fast transaction confirmation powered by the advanced Avalanche consensus engine.',
    },
]

export function FeaturesSection() {
    return (
        <section className="relative py-40 md:py-64 px-6 bg-black overflow-hidden flex flex-col items-center">
            {/* Bottom Edge Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-[var(--avax-red)]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto w-full space-y-20 md:space-y-32">
                {/* Header */}
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <Reveal direction="up">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--avax-red)]/20 bg-[var(--avax-red)]/5 backdrop-blur-md">
                            <span className="text-[10px] font-black tracking-[0.3em] text-[var(--avax-red)] uppercase">Core Engine</span>
                        </div>
                    </Reveal>
                    <Reveal direction="up" delay={0.1}>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-[0.95]">
                            Built for the{' '}
                            <span className="gradient-text italic">Frontier</span>
                        </h2>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <p className="text-lg md:text-xl text-[var(--avax-muted)] font-light leading-relaxed max-w-2xl mx-auto">
                            A high-performance infrastructure designed for the next generation of decentralized applications.
                        </p>
                    </Reveal>
                </div>

                {/* 3x2 Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((item, i) => (
                        <Reveal key={i} direction="up" delay={i * 0.08}>
                            <div className="group h-full p-8 md:p-10 bg-gradient-to-br from-[#0e0e16] to-[#0a0a12] border border-white/[0.06] rounded-2xl md:rounded-3xl transition-all duration-500 hover:border-[var(--avax-red)]/25 hover:shadow-[0_0_60px_-15px_rgba(232,65,66,0.15)] relative overflow-hidden">
                                {/* Hover corner glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--avax-red)]/0 group-hover:bg-[var(--avax-red)]/5 blur-3xl transition-all duration-700 rounded-full pointer-events-none" />

                                <div className="relative z-10 space-y-6">
                                    <div className="size-14 rounded-xl bg-[var(--avax-red)]/8 border border-[var(--avax-red)]/15 flex items-center justify-center text-[var(--avax-red)]/60 group-hover:text-[var(--avax-red)] group-hover:bg-[var(--avax-red)]/15 group-hover:scale-110 transition-all duration-500">
                                        <item.icon size={26} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-[var(--avax-red)] transition-colors duration-300">
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
