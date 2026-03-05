'use client'

import React from 'react'
import {
    Zap,
    Shield,
    Globe,
    Cpu,
    Layers,
    Rocket,
    Activity,
    Users
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'

export default function VisionPage() {
    return (
        <main className="min-h-screen bg-[#111118] text-white selection:bg-red-500/30">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.05] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

                <Section>
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-6">
                            <Rocket size={14} /> The Grand Strategy
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none mb-8">
                            Scaling the<br />
                            <span className="text-red-500">Operating Layer.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-2xl">
                            AVAXVERSE is more than a platform. It&apos;s the unified foundation where identity, finance, and community converge on the Avalanche network.
                        </p>
                    </div>
                </Section>
            </div>

            {/* Core Philosophy */}
            <Section style={{ paddingBottom: '8rem' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <VisionCard
                        icon={<Shield className="text-red-500" size={32} />}
                        title="Absolute Sovereignty"
                        desc="We believe digital identity should be owned by the individual, not the corporation. Our ID protocol ensures your data stays yours."
                    />
                    <VisionCard
                        icon={<Zap className="text-red-500" size={32} />}
                        title="Hyper Fluidity"
                        desc="Value should move at the speed of thought. By leveraging Avalanche subnets, we enable near-instant finality for all transactions."
                    />
                    <VisionCard
                        icon={<Globe className="text-red-500" size={32} />}
                        title="Infinite Scalability"
                        desc="Our architecture is built to support the next billion users through a modular approach to specialized network layers."
                    />
                </div>
            </Section>

            {/* Roadmap Section */}
            <div className="bg-white/[0.02] border-y border-white/5 py-32">
                <Section>
                    <h2 className="text-4xl md:text-6xl font-black mb-16 text-center">Path to <span className="text-red-500">Singularity.</span></h2>

                    <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 md:before:mx-auto before:w-0.5 before:bg-gradient-to-b before:from-red-500/0 before:via-red-500 before:to-red-500/0">
                        <RoadmapItem
                            date="Q1 2024"
                            title="Genesis: The Operating Layer"
                            desc="Launch of the core ID registry and Escrow Factory on Fuji Testnet. Establishing the foundational security primitives."
                            status="completed"
                        />
                        <RoadmapItem
                            date="Q3 2024"
                            title="Ascension: Governance & Nodes"
                            desc="Implementation of the AVAXVERSE DAO and community-vetted subnets. Initial integration of institutional grade validators."
                            status="active"
                        />
                        <RoadmapItem
                            date="Q1 2025"
                            title="Expansion: Cross-Chain Unity"
                            desc="Bridging the AVAXVERSE identity and reputation system to the wider EVM ecosystem via Teleporter and HyperSDK."
                            status="planned"
                        />
                    </div>
                </Section>
            </div>

            {/* Future Pillars */}
            <Section style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    <div className="md:w-1/2">
                        <h2 className="text-4xl font-bold mb-6">Building for the <span className="text-red-500">unseen.</span></h2>
                        <p className="text-white/50 text-lg mb-8">
                            We aren&apos;t just building for today&apos;s Web3 users. We are building the rails for the future of digital interaction, where the blockchain is invisible and the benefits are undeniable.
                        </p>
                        <div className="space-y-4">
                            <SmallPoint icon={<Layers />} text="Modular subnet infrastructure for enterprise scale." />
                            <SmallPoint icon={<Cpu />} text="AI-driven smart contract automation." />
                            <SmallPoint icon={<Users />} text="Social reputation layers that transcend platforms." />
                        </div>
                    </div>
                    <div className="md:w-1/2 relative">
                        <div className="aspect-square glass-card rounded-3xl flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-50" />
                            <Activity size={120} className="text-red-500 animate-pulse relative z-10" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                <Layers size={300} />
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            <div className="px-4 md:px-8 pb-12">
                <Footer />
            </div>
        </main>
    )
}

function VisionCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="glass-card p-10 rounded-3xl border-white/10 hover:border-red-500/30 transition-all group">
            <div className="mb-6 transform group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <p className="text-white/40 leading-relaxed">{desc}</p>
        </div>
    )
}

function RoadmapItem({ date, title, desc, status }: { date: string, title: string, desc: string, status: 'completed' | 'active' | 'planned' }) {
    return (
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group select-none">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#15151e] group-hover:border-red-500/50 transition-colors z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <div className={`w-2.5 h-2.5 rounded-full ${status === 'completed' ? 'bg-green-500' : status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-8 rounded-3xl">
                <div className="text-red-500 font-black text-xs uppercase tracking-widest mb-2">{date}</div>
                <h4 className="text-xl font-bold mb-3">{title}</h4>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function SmallPoint({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-4 text-white/70">
            <div className="text-red-500">{icon}</div>
            <span className="font-semibold">{text}</span>
        </div>
    )
}
