'use client'

import React from 'react'
import {
    Zap,
    Shield,
    Globe,
    Cpu,
    Layers,
    Activity,
    Users
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'

export default function VisionPage() {
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300">
            <Navbar />

            <div className="pt-32 pb-20">
                <Section>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                                Protocol Direction: <span className="text-primary">AVAXVERSE.</span>
                            </h1>
                            <p className="text-xl text-text-muted-light dark:text-text-muted-dark leading-relaxed max-w-3xl mx-auto">
                                This page defines how AVAXVERSE evolves as an execution layer for trustless missions on Avalanche, with clear priorities for reliability, transparency, and coordination speed.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                            <VisionCard
                                icon={<Shield className="text-primary" size={30} />}
                                title="Verifiable Identity"
                                desc="Participants operate through persistent on-chain profiles so selection decisions are based on measurable history, not anonymous activity."
                            />
                            <VisionCard
                                icon={<Zap className="text-primary" size={30} />}
                                title="Trust-Minimized Escrow"
                                desc="Mission capital is locked in contracts, released by explicit state transitions, and protected by deterministic review and dispute windows."
                            />
                            <VisionCard
                                icon={<Globe className="text-primary" size={30} />}
                                title="Reputation-Led Matching"
                                desc="Execution quality compounds into ranking and collateral advantages, improving match quality between serious clients and reliable operators."
                            />
                        </div>

                        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-[3rem] p-8 md:p-12 mb-20">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Activity size={32} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Path to Network Maturity</h2>
                            </div>
                            <div className="relative space-y-6 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-primary/20">
                                <RoadmapItem
                                    date="Live Today"
                                    title="Identity + Escrow Core"
                                    desc="Core lifecycle is operational: profile creation, mission posting, operator applications, selection, acceptance, funding, delivery, approval, and timeout-based settlement."
                                    status="completed"
                                />
                                <RoadmapItem
                                    date="In Progress"
                                    title="Governance + Operational Transparency"
                                    desc="Current priority is clearer protocol observability: proposal surfaces, better explorer signals, and easier verification of mission and payout states."
                                    status="active"
                                />
                                <RoadmapItem
                                    date="Next Releases"
                                    title="Protocol Composability"
                                    desc="Developer integrations will expose reusable identity, reputation, and escrow primitives so third-party apps can adopt AVAXVERSE trust guarantees without rebuilding core workflow logic."
                                    status="planned"
                                />
                            </div>
                        </div>

                        <div className="glass-panel bg-primary/5 border border-primary/20 rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
                                <Layers size={180} />
                            </div>
                            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                                        Principles for <span className="text-primary">Scale.</span>
                                    </h2>
                                    <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-8">
                                        The protocol is designed around operational guarantees. Each product decision is evaluated by one question: does it reduce coordination risk while preserving participant fairness?
                                    </p>
                                    <div className="space-y-4">
                                        <SmallPoint icon={<Layers size={18} />} text="Composable design: identity, reputation, and escrow remain independent but interoperable." />
                                        <SmallPoint icon={<Cpu size={18} />} text="Automation with safeguards: explicit review windows and deterministic settlement behavior." />
                                        <SmallPoint icon={<Users size={18} />} text="Portable trust: completed missions continuously strengthen reusable credibility." />
                                    </div>
                                </div>
                                <div className="glass-panel bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-3xl p-8 min-h-64">
                                    <div className="flex items-center gap-3 mb-5">
                                        <Activity size={20} className="text-primary" />
                                        <h3 className="text-xl font-black tracking-tight">Core Stack</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <p className="text-text-muted-light dark:text-text-muted-dark"><span className="font-bold text-text-light dark:text-text-dark">Identity Registry:</span> Canonical participant profile and metadata source.</p>
                                        <p className="text-text-muted-light dark:text-text-muted-dark"><span className="font-bold text-text-light dark:text-text-dark">Escrow Factory:</span> Mission state machine, economic commitments, and settlement controls.</p>
                                        <p className="text-text-muted-light dark:text-text-muted-dark"><span className="font-bold text-text-light dark:text-text-dark">Reputation Layer:</span> On-chain performance signal for selection and collateral policy.</p>
                                        <p className="text-text-muted-light dark:text-text-muted-dark"><span className="font-bold text-text-light dark:text-text-dark">Application Routes:</span> Operator and client interfaces for jobs, profiles, governance, and analytics.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            <section className="px-4 md:px-8 py-20">
                <div className="max-w-7xl mx-auto w-full">
                    <Footer />
                </div>
            </section>
        </main>
    )
}

function VisionCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-8 hover:scale-[1.01] transition-transform">
            <div className="mb-5">{icon}</div>
            <h3 className="text-2xl font-black mb-3 tracking-tight">{title}</h3>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed">{desc}</p>
        </div>
    )
}

function RoadmapItem({ date, title, desc, status }: { date: string, title: string, desc: string, status: 'completed' | 'active' | 'planned' }) {
    const dotClass = status === 'completed'
        ? 'bg-emerald-500'
        : status === 'active'
            ? 'bg-primary animate-pulse'
            : 'bg-white/30 dark:bg-white/20'

    return (
        <div className="relative pl-14">
            <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
            </div>
            <div className="glass-panel bg-white/30 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-2xl p-6">
                <div className="text-primary font-black text-xs uppercase tracking-widest mb-2">{date}</div>
                <h4 className="text-xl font-bold mb-2">{title}</h4>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function SmallPoint({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-primary">{icon}</div>
            <span className="font-semibold text-sm md:text-base">{text}</span>
        </div>
    )
}
