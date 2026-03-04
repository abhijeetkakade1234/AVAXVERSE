'use client'

import React from 'react'
import { Shield, Briefcase, DollarSign, Gavel } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const pillars = [
    { icon: Shield, label: 'TRUST', color: '#60a5fa' },
    { icon: Briefcase, label: 'WORK', color: '#34d399' },
    { icon: DollarSign, label: 'FINANCE', color: '#fb923c' },
    { icon: Gavel, label: 'GOVERNANCE', color: '#a78bfa' },
]

export function VisionSection() {
    return (
        <section className="relative px-6 w-full overflow-hidden bg-black flex flex-col items-center py-40 md:py-64">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-[var(--avax-red)]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Left: Text Content */}
                    <div className="flex-1 space-y-10 text-center lg:text-left">
                        <Reveal direction="up">
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--avax-red)]/20 bg-[var(--avax-red)]/5 backdrop-blur-md">
                                <span className="text-[10px] font-black tracking-[0.3em] text-[var(--avax-red)] uppercase">The Vision</span>
                            </div>
                        </Reveal>

                        <Reveal direction="up" delay={0.1}>
                            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white uppercase">
                                Our Vision
                            </h2>
                        </Reveal>

                        <div className="space-y-6">
                            <Reveal direction="up" delay={0.2}>
                                <div className="flex items-start gap-4">
                                    <div className="mt-2 size-2 rounded-full bg-[var(--avax-red)] shrink-0" />
                                    <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed">
                                        Build a <span className="font-bold text-white">Web3 Super App</span> on Avalanche
                                    </p>
                                </div>
                            </Reveal>
                            <Reveal direction="up" delay={0.3}>
                                <div className="flex items-start gap-4">
                                    <div className="mt-2 size-2 rounded-full bg-[var(--avax-red)] shrink-0" />
                                    <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed">
                                        Simplify trust, work, finance, and governance
                                    </p>
                                </div>
                            </Reveal>
                        </div>

                        <Reveal direction="up" delay={0.4} blur>
                            <p className="text-base md:text-lg text-[var(--avax-muted)] font-light leading-relaxed max-w-xl">
                                AVAXVERSE is the infrastructure for the next billion workers. A single sovereign layer where identity, finance, and freedom converge.
                            </p>
                        </Reveal>
                    </div>

                    {/* Right: Isometric Visual */}
                    <div className="flex-1 w-full max-w-lg">
                        <Reveal direction="up" delay={0.3}>
                            <div className="relative w-full aspect-square flex items-center justify-center">
                                {/* Central "Processor" chip */}
                                <div className="relative z-10 w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-gradient-to-br from-[#111128] to-[#0a0a1a] border border-white/10 shadow-[0_0_80px_-20px_rgba(232,65,66,0.3)] flex flex-col items-center justify-center gap-3">
                                    <div className="size-12 md:size-16 rounded-xl bg-[var(--avax-red)]/15 border border-[var(--avax-red)]/25 flex items-center justify-center">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2L2 19.5H22L12 2Z" fill="#E84142" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-black tracking-widest text-[var(--avax-red)] uppercase">AVAXVERSE</div>
                                        <div className="text-[9px] font-medium tracking-wider text-white/40 uppercase">Web3 OS</div>
                                    </div>
                                </div>

                                {/* Pillar connections */}
                                {pillars.map((p, i) => {
                                    const angle = -45 + (i * 90) // Position at corners
                                    const radius = 140
                                    const x = Math.cos((angle * Math.PI) / 180) * radius
                                    const y = Math.sin((angle * Math.PI) / 180) * radius

                                    return (
                                        <div
                                            key={i}
                                            className="absolute flex flex-col items-center gap-2 group"
                                            style={{
                                                left: `calc(50% + ${x}px)`,
                                                top: `calc(50% + ${y}px)`,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            {/* Connector line */}
                                            <div
                                                className="absolute w-px h-16 opacity-30"
                                                style={{
                                                    background: `linear-gradient(to bottom, ${p.color}40, transparent)`,
                                                    transform: `rotate(${angle + 90}deg)`,
                                                    transformOrigin: 'top center',
                                                }}
                                            />
                                            <div
                                                className="size-12 rounded-xl border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                                style={{
                                                    background: `${p.color}10`,
                                                    borderColor: `${p.color}25`,
                                                }}
                                            >
                                                <p.icon size={20} style={{ color: p.color }} strokeWidth={1.5} />
                                            </div>
                                            <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">{p.label}</span>
                                        </div>
                                    )
                                })}

                                {/* Circuit traces */}
                                <div className="absolute inset-8 rounded-xl border border-dashed border-white/[0.04]" />
                                <div className="absolute inset-16 rounded-lg border border-dashed border-white/[0.03]" />
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    )
}
