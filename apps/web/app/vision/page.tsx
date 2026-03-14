'use client'

import React from 'react'
import {
    Sparkles,
    Users,
    Zap,
    TrendingUp,
    Code,
    Lock,
    Network,
    Target,
    Layout,
    Briefcase,
    Vote,
    MessageSquare,
    ArrowUpRight
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function VisionPage() {
    return (
        <div className="bg-[#B4AAFD] bg-gradient-to-b from-[#B4AAFD] via-[#9B8CFA] to-[#1A1A2E] dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] text-gray-900 dark:text-white font-display antialiased min-h-screen flex flex-col relative transition-colors duration-500">
            <Navbar />

            <div className="pt-32 pb-20 relative z-10 w-full">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-32 space-y-8 animate-enter">
                        <div className="flex items-center gap-2 bg-white/40 dark:bg-primary/20 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 dark:border-primary/30 w-fit mx-auto shadow-lg">
                            <Sparkles size={16} className="text-secondary dark:text-primary animate-pulse" />
                            <span className="text-sm font-bold text-gray-900 dark:text-primary uppercase tracking-wider">The Super App Era</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-bold text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
                            A New Modular <br /> <span className="gradient-text">Reality.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/70 dark:text-white/60 max-w-4xl mx-auto leading-relaxed font-medium">
                            AVAXVERSE is evolving from a core trust protocol into a decentralized super app. One identity, unlimited modules, and a unified on-chain reputation that powers the future of work.
                        </p>
                    </div>

                    {/* Philosophy Section */}
                    <div className="mb-40 grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                Transcending the <br />Marketplace.
                            </h2>
                            <p className="text-lg text-white/50 leading-relaxed">
                                AVAXVERSE is evolving into a <span className="text-white font-bold">Professional Super App</span>. We aren&apos;t just matching buyers and sellers; we are building a trust network where every professional action compounds into a sovereign on-chain legacy.
                            </p>
                            <div className="grid gap-6">
                                <PhiloPoint
                                    icon={<TrendingUp size={20} />}
                                    title="Portable Reputation"
                                    desc="Your global trust score is visible everywhere—from mission cards to governance power."
                                />
                                <PhiloPoint
                                    icon={<Target size={20} />}
                                    title="Skill-Based Matching"
                                    desc="Predictive intelligence matches operators to missions based on their on-chain skill tags."
                                />
                                <PhiloPoint
                                    icon={<Layout size={20} />}
                                    title="Proof-of-Work Portfolio"
                                    desc="Every completed mission automatically becomes a verifiable entry in your professional dashboard."
                                />
                                <PhiloPoint
                                    icon={<Users size={20} />}
                                    title="Dispute DAO"
                                    desc="High-stakes arbitration is decentralized. Peer voters resolve disputes through collective wisdom."
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="glass-panel p-10 rounded-[3rem] border border-white/20 dark:border-primary/20 bg-white/10 dark:bg-black/20 backdrop-blur-3xl relative z-10 shadow-2xl overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <Network className="text-primary animate-pulse" /> The Super App Hub Flow
                                </h3>
                                <div className="space-y-6">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 dark:border-primary/10 group-hover:bg-white/10 dark:group-hover:bg-primary/5 transition-all duration-300">
                                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Layer 1: Identity</div>
                                        <div className="text-white/80 font-medium text-sm">Create a verifiable DID. The anchor of your legacy.</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 dark:border-primary/10 group-hover:bg-white/10 dark:group-hover:bg-primary/5 transition-all duration-300">
                                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Layer 2: Reputation</div>
                                        <div className="text-white/80 font-medium text-sm">Accumulate scores that power your platform weight.</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 dark:border-primary/10 group-hover:bg-white/10 dark:group-hover:bg-primary/5 transition-all duration-300">
                                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Layer 3: Execution</div>
                                        <div className="text-white/80 font-medium text-sm">Missions flow through sovereign smart contracts.</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 dark:border-primary/10 group-hover:bg-white/10 dark:group-hover:bg-primary/5 transition-all duration-300">
                                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Layer 4: Portfolio</div>
                                        <div className="text-white/80 font-medium text-sm">Successful work auto-populates your global resume.</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 dark:border-primary/10 group-hover:bg-white/10 dark:group-hover:bg-primary/5 transition-all duration-300">
                                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Layer 5: Governance</div>
                                        <div className="text-white/80 font-medium text-sm">Your reputation translates into protocol voice.</div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <TrendingUp size={240} className="text-primary" />
                                </div>
                            </div>
                            <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse" />
                        </div>
                    </div>

                    {/* expansion of Core Layer */}
                    <div className="mb-40">
                        <h2 className="text-4xl font-bold text-white mb-12 text-center">The Core Layer Architecture</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <CoreTechCard
                                icon={<Code size={20} />}
                                title="DID Registry"
                                tech="ERC-1056 Adapted"
                                desc="Self-sovereign metadata linking professional bio, skills, and social handles to a single on-chain identity."
                            />
                            <CoreTechCard
                                icon={<Lock size={20} />}
                                title="Escrow Factory"
                                tech="State-Machine Architecture"
                                desc="Automated creation of isolated reward contracts with individual dispute and review logic."
                            />
                            <CoreTechCard
                                icon={<Sparkles size={20} />}
                                title="Reputation SBT"
                                tech="ERC-5192 (Soulbound)"
                                desc="Strictly non-transferable achievement tokens that programmatically determine platform access."
                            />
                            <CoreTechCard
                                icon={<TrendingUp size={20} />}
                                title="Governance Engine"
                                tech="OpenZeppelin Governor"
                                desc="Custom-weighted voting based on reputation SBTs rather than strictly token wealth."
                            />
                        </div>
                    </div>

                    {/* Deep Dive Modules */}
                    <div className="space-y-24 mb-40">
                        <div className="text-center space-y-4 mb-20 animate-enter">
                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Seven Modules. One Unified Vision.</h2>
                            <p className="text-white/50 max-w-2xl mx-auto text-lg font-medium">Each module connects to the core, expanding the boundaries of what&apos;s possible in a decentralized professional network.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <DeepModuleCard
                                icon={<Briefcase size={28} />}
                                title="M1: Missions"
                                status="Operational"
                                flow="Post → Stake → Approve → Release"
                                desc="The professional marketplace for high-stakes coordination. Optimized for complex contract work with built-in escrow guarantees."
                            />
                            <DeepModuleCard
                                icon={<Target size={28} />}
                                title="M2: Bounties"
                                status="Upcoming"
                                flow="List → Submit → Win → Payout"
                                desc="Rapid-fire tasks and contests. Perfect for bug fixes, creative design sprints, and community management micro-tasks."
                            />
                            <DeepModuleCard
                                icon={<Vote size={28} />}
                                title="M3: Dispute DAO"
                                status="Beta"
                                flow="Dispute → Evidence → Juror Vote → Resolve"
                                desc="The Decentralized Professional Court. DID holders act as autonomous jurors to resolve mission disputes based on their on-chain reputation."
                            />
                            <DeepModuleCard
                                icon={<Layout size={28} />}
                                title="M4: Portfolio"
                                status="Planned"
                                flow="Collect SBTs → Display → Verify"
                                desc="A visually stunning Web3 resume. Automatically imports your work history and reputation level into a sharable dashboard."
                            />
                            <DeepModuleCard
                                icon={<TrendingUp size={28} />}
                                title="M5: DeFi Layer"
                                status="Future"
                                flow="Stake → Boost → Earn → Credit"
                                desc="Financializing trust. Stake AVAX to boost your reputation, earn yield on escrowed funds, and unlock on-chain credit."
                            />
                            <DeepModuleCard
                                icon={<MessageSquare size={28} />}
                                title="M6: Collaboration"
                                status="Future"
                                flow="Connect → Chat → Track → Ship"
                                desc="The communication hub. Native messaging, milestone tracking, and decentralized file sharing between clients and workers."
                            />
                            <DeepModuleCard
                                icon={<Sparkles size={28} />}
                                title="M7: AI Assistant"
                                status="Conceptual"
                                flow="Analyze → Match → Draft → Verify"
                                desc="Next-gen orchestration. AI helps match the best operators to missions and even assists in objective work verification."
                            />
                        </div>
                    </div>

                    {/* Long Term Vision Banner */}
                    <div className="glass-panel p-16 md:p-32 rounded-[4rem] border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl relative overflow-hidden text-center shadow-2xl group animate-enter">
                        <div className="relative z-10 space-y-12">
                            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
                                One Identity. <br /> <span className="gradient-text">Sovereign Work.</span>
                            </h2>
                            <p className="text-2xl text-white/50 max-w-4xl mx-auto leading-relaxed italic font-medium">
                                &quot;AVAXVERSE becomes a decentralized collaboration network where people build reputation, earn money, and participate in governance using their on-chain identity.&quot;
                            </p>
                            <div className="pt-8 flex flex-wrap justify-center gap-6">
                                <TabTag label="Upwork Evolution" />
                                <TabTag label="Gitcoin Agility" />
                                <TabTag label="LinkedIn Permanence" />
                                <TabTag label="DAO Autonomy" />
                            </div>
                        </div>

                        <div className="absolute -right-20 -bottom-20 opacity-[0.05] pointer-events-none transform rotate-12 transition-transform duration-1000 group-hover:rotate-0 group-hover:scale-110">
                            <Zap size={600} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <section className="px-4 md:px-8 py-20 mt-auto">
                <div className="max-w-7xl mx-auto w-full">
                    <Footer />
                </div>
            </section>
        </div>
    )
}

function PhiloPoint({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors group">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                {icon}
            </div>
            <div>
                <h4 className="text-lg font-bold text-white mb-1 tracking-tight">{title}</h4>
                <p className="text-sm text-white/40 leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    )
}

function CoreTechCard({ icon, title, tech, desc }: { icon: React.ReactNode, title: string, tech: string, desc: string }) {
    return (
        <div className="glass-panel p-8 rounded-3xl border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl space-y-4 shadow-xl hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 text-white dark:bg-primary/20 transition-colors group-hover:bg-primary">
                    {icon}
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{tech}</div>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">{desc}</p>
        </div>
    )
}

function DeepModuleCard({ icon, title, desc, status, flow }: { icon: React.ReactNode, title: string, desc: string, status: string, flow: string }) {
    const isReady = status === 'Operational' || status === 'Beta'
    return (
        <div className="glass-panel p-10 rounded-[3rem] border border-white/20 dark:border-primary/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl mission-card-hover group relative overflow-hidden transition-all duration-500 shadow-xl">
            <div className="flex items-start justify-between mb-10">
                <div className="p-4 rounded-2xl bg-white/10 dark:bg-primary/20 text-white shadow-xl transition-transform group-hover:scale-110">
                    {icon}
                </div>
                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border backdrop-blur-md ${isReady ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-white/5 border-white/10 dark:border-primary/20 text-white/30 dark:text-white/50'}`}>
                    {status}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-white group-hover:text-primary transition-colors mb-4 tracking-tighter">{title}</h3>
            <div className="mb-6 flex items-center gap-2 text-[10px] font-black text-primary/60 dark:text-primary/70 uppercase tracking-[0.15em] border-b border-white/10 dark:border-primary/10 pb-4">
                <Zap size={14} /> {flow}
            </div>
            <p className="text-base text-white/50 dark:text-white/60 leading-relaxed mb-10 font-medium">{desc}</p>
            <div className="flex items-center gap-3 text-sm font-bold text-white/30 dark:text-white/40 group-hover:text-white transition-colors">
                Explore Module <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>

            <div className="absolute -right-10 -bottom-10 opacity-[0.02] dark:opacity-[0.05] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.1] transition-all duration-700 pointer-events-none transform group-hover:scale-125 group-hover:-rotate-12 translate-x-4 translate-y-4">
                {icon}
            </div>
        </div>
    )
}

function TabTag({ label }: { label: string }) {
    return (
        <span className="px-8 py-3 rounded-full border border-white/10 bg-white/5 text-white/60 text-base font-bold tracking-tight backdrop-blur-md hover:bg-white/10 hover:text-white transition-all cursor-default shadow-lg">
            {label}
        </span>
    )
}
