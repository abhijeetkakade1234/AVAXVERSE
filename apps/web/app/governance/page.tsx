'use client'

import React, { useState } from 'react'
import {
    Vote as VoteIcon,
    Users,
    Target,
    Clock,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'

export default function GovernancePage() {
    const [activeTab, setActiveTab] = useState<'active' | 'passed' | 'failed'>('active')

    return (
        <main className="min-h-screen bg-[#111118] text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-40 pb-20">
                <Section>
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
                        <div className="lg:w-1/2 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
                                <Users size={14} /> Democracy Protocol
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none">
                                Community <br /> <span className="text-red-500">Governance.</span>
                            </h1>
                            <p className="text-lg text-white/50 max-w-lg">
                                Shape the future of AVAXVERSE. Propose changes, vote on upgrades, and allocate ecosystem resources.
                            </p>
                        </div>

                        {/* Governance Stats */}
                        <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <GovStat label="Total Participating" value="4.2M AVAX" icon={<TrendingUp size={16} />} />
                            <GovStat label="Active Proposals" value="12" icon={<Clock size={16} />} />
                            <GovStat label="Total Voters" value="24,502" icon={<Users size={16} />} />
                            <GovStat label="Quorum Threshold" value="60%" icon={<Target size={16} />} />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                        <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-full md:w-auto">
                            <TabBtn active={activeTab === 'active'} onClick={() => setActiveTab('active')} label="Active" count={5} />
                            <TabBtn active={activeTab === 'passed'} onClick={() => setActiveTab('passed')} label="Passed" count={128} />
                            <TabBtn active={activeTab === 'failed'} onClick={() => setActiveTab('failed')} label="Failed" count={42} />
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <input type="text" placeholder="Search proposals..." className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-10 text-sm focus:outline-none focus:border-red-500/50" />
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                            </div>
                            <button className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-colors">
                                <Filter size={18} className="text-white/60" />
                            </button>
                        </div>
                    </div>

                    {/* Proposals List */}
                    <div className="space-y-4">
                        <ProposalCard
                            id="AVGP-24"
                            title="Incentive Allocation Wave 1: Gaming Subnets"
                            desc="Proposal to allocate 500,000 AVAX to support bootstrap liquidity for emerging gaming subnets in the AVAXVERSE ecosystem."
                            status="active"
                            votes={{ yes: 65, no: 35 }}
                            timeLeft="2d 4h left"
                        />
                        <ProposalCard
                            id="AVGP-23"
                            title="Identity Registry Upgrade: ZK-Proofs Integration"
                            desc="Implementation of zero-knowledge proofs for the Identity Protocol to enhance user privacy while maintaining verifiable reputation."
                            status="active"
                            votes={{ yes: 88, no: 12 }}
                            timeLeft="5d 1h left"
                        />
                        <ProposalCard
                            id="AVGP-22"
                            title="Ecosystem Expansion: Cross-Chain Bridge Support"
                            desc="Proposal to integrate Teleporter 2.0 for seamless cross-chain asset transfers within the Avalanche environment."
                            status="active"
                            votes={{ yes: 42, no: 58 }}
                            timeLeft="18h left"
                        />
                    </div>

                    <div className="mt-12 text-center">
                        <button className="btn-secondary px-8 py-3 text-sm">
                            View Archived Proposals <ChevronRight size={16} className="ml-2" />
                        </button>
                    </div>
                </Section>
            </div>

            <div className="px-4 md:px-8 pb-12">
                <Footer />
            </div>
        </main>
    )
}

function GovStat({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="glass-card p-6 rounded-2xl border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-red-500">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</span>
            </div>
            <div className="text-3xl font-black">{value}</div>
        </div>
    )
}

function TabBtn({ active, label, count, onClick }: { active: boolean, label: string, count: number, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${active
                ? 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
        >
            {label} <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : 'bg-white/5'}`}>{count}</span>
        </button>
    )
}

function ProposalCard({ id, title, desc, votes, timeLeft }: { id: string, title: string, desc: string, status: string, votes: { yes: number, no: number }, timeLeft: string }) {
    return (
        <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-red-500/20 transition-all group overflow-hidden relative">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white/30">{id}</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={10} /> {timeLeft}
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold group-hover:text-red-500 transition-colors">{title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed max-w-2xl">{desc}</p>
                </div>

                <div className="w-full lg:w-72 space-y-6 shrink-0">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-green-500">Yes / {votes.yes}%</span>
                                <span className="text-red-500">No / {votes.no}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                <div className="h-full bg-green-500" style={{ width: `${votes.yes}%` }} />
                                <div className="h-full bg-red-500" style={{ width: `${votes.no}%` }} />
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary w-full py-3 text-sm justify-center">
                        View Proposal <ArrowUpRight size={16} className="ml-2" />
                    </button>
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <VoteIcon size={120} />
            </div>
        </div>
    )
}
