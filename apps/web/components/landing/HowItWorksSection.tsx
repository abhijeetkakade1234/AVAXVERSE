'use client'

import React from 'react'
import { UserPlus, Lock, ClipboardCheck, Wallet, ShieldPlus } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const steps = [
    {
        icon: UserPlus,
        title: 'Mint Identity',
        desc: 'User mints on-chain identity — your sovereign digital passport on Avalanche.',
    },
    {
        icon: Lock,
        title: 'Lock Funds',
        desc: 'Client creates task & locks funds in escrow via smart contract.',
    },
    {
        icon: ClipboardCheck,
        title: 'Complete Work',
        desc: 'Freelancer completes milestone and submits proof of completion.',
    },
    {
        icon: Wallet,
        title: 'Release Payment',
        desc: 'Smart contract automatically releases payment upon verification.',
    },
    {
        icon: ShieldPlus,
        title: 'Build Reputation',
        desc: 'Reputation updates automatically — trust that follows you everywhere.',
    },
]

export function HowItWorksSection() {
    return (
        <section className="relative py-40 md:py-64 px-6 bg-black flex flex-col items-center overflow-hidden">
            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-[var(--avax-red)]/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto space-y-20 md:space-y-32 w-full">
                {/* Header */}
                <div className="text-center space-y-6">
                    <Reveal direction="up">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--avax-red)]/20 bg-[var(--avax-red)]/5 backdrop-blur-md">
                            <span className="text-[10px] font-black tracking-[0.3em] text-[var(--avax-red)] uppercase">The Workflow</span>
                        </div>
                    </Reveal>
                    <Reveal direction="up" delay={0.1}>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white">
                            How It <span className="gradient-text italic">Works</span>
                        </h2>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <p className="text-lg md:text-xl text-[var(--avax-muted)] font-light leading-relaxed max-w-2xl mx-auto">
                            From identity creation to reputation building — a seamless, trustless journey.
                        </p>
                    </Reveal>
                </div>

                {/* Steps - Horizontal timeline on desktop, vertical on mobile */}
                <div className="relative">
                    {/* Timeline connector line - desktop */}
                    <div className="hidden lg:block absolute top-[3.5rem] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[var(--avax-red)]/20 to-transparent z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4">
                        {steps.map((step, i) => (
                            <Reveal key={i} direction="up" delay={i * 0.12}>
                                <div className="relative group flex flex-col items-center text-center">
                                    {/* Step number + icon node */}
                                    <div className="relative z-10 mb-6">
                                        <div className="size-[4.5rem] rounded-2xl bg-gradient-to-br from-[#0e0e16] to-[#131320] border border-white/[0.08] flex items-center justify-center text-white/30 group-hover:text-[var(--avax-red)] group-hover:border-[var(--avax-red)]/30 group-hover:shadow-[0_0_40px_-10px_rgba(232,65,66,0.3)] transition-all duration-500">
                                            <step.icon size={28} strokeWidth={1.5} />
                                        </div>
                                        {/* Glowing dot on timeline */}
                                        <div className="hidden lg:block absolute -bottom-[1.35rem] left-1/2 -translate-x-1/2 size-3 rounded-full bg-[var(--avax-red)]/40 border-2 border-[var(--avax-red)]/60 group-hover:bg-[var(--avax-red)] group-hover:shadow-[0_0_12px_rgba(232,65,66,0.6)] transition-all duration-500" />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3 max-w-[200px]">
                                        <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">Step 0{i + 1}</span>
                                        <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-[var(--avax-red)] transition-colors">{step.title}</h3>
                                        <p className="text-[var(--avax-muted)] text-sm font-light leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>

                                    {/* Mobile connector arrow */}
                                    {i < steps.length - 1 && (
                                        <div className="md:hidden mt-6 mb-2 w-px h-8 bg-gradient-to-b from-[var(--avax-red)]/30 to-transparent" />
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
