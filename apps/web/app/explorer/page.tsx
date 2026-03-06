'use client'

import React, { useState, useEffect } from 'react'
import {
    Activity,
    Database,
    Globe,
    Search,
    ArrowUpRight,
    Zap
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'

export default function ExplorerPage() {
    const [stats, setStats] = useState({
        tps: 452,
        gas: 25.4,
        subnets: 18,
        validators: 1240
    })

    // Simulate real-time stats
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                tps: prev.tps + Math.floor(Math.random() * 10) - 5,
                gas: parseFloat((prev.gas + (Math.random() * 2 - 1)).toFixed(1))
            }))
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <main className="min-h-screen bg-[#111118] text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-40 pb-20">
                <Section>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
                                <Activity size={14} /> Ecosystem Pulse
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none">
                                Network <br /> <span className="text-red-500">Explorer.</span>
                            </h1>
                        </div>

                        <div className="w-full md:w-96 relative">
                            <input
                                type="text"
                                placeholder="Search by address, txn, or subnet..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-12 focus:outline-none focus:border-red-500/50 transition-colors"
                            />
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                        <StatBox label="Transactions / Sec" value={stats.tps.toString()} icon={<Zap size={16} />} trend="+12%" />
                        <StatBox label="Median Gas Price" value={`${stats.gas} nAVAX`} icon={<Activity size={16} />} trend="-2%" />
                        <StatBox label="Active Subnets" value={stats.subnets.toString()} icon={<Database size={16} />} />
                        <StatBox label="Total Validators" value={stats.validators.toLocaleString()} icon={<Shield size={16} />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Subnet Directory */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Globe size={20} className="text-red-500" /> Infrastructure Directory
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SubnetCard
                                    name="C-Chain"
                                    type="EVM Smart Contracts"
                                    health="99.9%"
                                    desc="The primary smart contract chain for DeFi and NFTs."
                                />
                                <SubnetCard
                                    name="X-Chain"
                                    type="Asset Exchange"
                                    health="100%"
                                    desc="Fastest chain for simple value transfer and asset creation."
                                />
                                <SubnetCard
                                    name="GameStream-1"
                                    type="Game Subnet"
                                    health="98.5%"
                                    desc="Dedicated high-throughput layer for decentralized gaming."
                                />
                                <SubnetCard
                                    name="AuthLayer"
                                    type="Identity Subnet"
                                    health="99.9%"
                                    desc="Zero-knowledge proof validation layer for AVAXVERSE IDs."
                                />
                            </div>
                        </div>

                        {/* Live Feed Sidebar */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Activity size={20} className="text-red-500" /> Live Ops
                            </h2>
                            <div className="glass-card rounded-3xl p-6 border-white/5 space-y-6 h-[500px] overflow-hidden relative">
                                <div className="space-y-4 animate-scroll-vertical">
                                    <TxnItem type="Contract Execution" id="0x1a...3f4e" time="2s ago" value="12.5 AVAX" />
                                    <TxnItem type="Identity Mint" id="0xfe...2a1b" time="5s ago" value="0.1 AVAX" />
                                    <TxnItem type="Escrow Funded" id="0x33...8c9d" time="12s ago" value="1,200 AVAX" />
                                    <TxnItem type="Subnet Join" id="0x90...4f5e" time="1m ago" value="2,000 AVAX" />
                                    <TxnItem type="Governance Vote" id="0xbc...7d6a" time="2m ago" value="0 AVAX" />
                                    <TxnItem type="Contract Execution" id="0x1a...3f4e" time="2s ago" value="12.5 AVAX" />
                                    <TxnItem type="Identity Mint" id="0xfe...2a1b" time="5s ago" value="0.1 AVAX" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#111118] to-transparent pointer-events-none" />
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

            <style jsx>{`
                @keyframes scroll-vertical {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .animate-scroll-vertical {
                    animation: scroll-vertical 20s linear infinite;
                }
            `}</style>
        </main>
    )
}

function StatBox({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend?: string }) {
    return (
        <div className="glass-card p-6 rounded-2xl border-white/5 group hover:border-red-500/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg text-red-500 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-2xl font-black mb-1">{value}</div>
            <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{label}</div>
        </div>
    )
}

function SubnetCard({ name, type, health, desc }: { name: string, type: string, health: string, desc: string }) {
    return (
        <div className="glass-card p-6 rounded-2xl border-white/5 hover:bg-white/[0.04] transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors">{name}</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{type}</p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-white/20 font-bold uppercase mb-1">Health</div>
                    <div className="text-xs font-mono text-green-500">{health}</div>
                </div>
            </div>
            <p className="text-sm text-white/40 mb-6 leading-relaxed">{desc}</p>
            <button className="flex items-center gap-2 text-xs font-bold text-red-500/80 hover:text-red-500 transition-colors">
                View Diagnostics <ArrowUpRight size={14} />
            </button>
        </div>
    )
}

function TxnItem({ type, id, time, value }: { type: string, id: string, time: string, value: string }) {
    return (
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="space-y-1">
                <div className="text-[11px] font-bold text-white/80">{type}</div>
                <div className="text-[10px] font-mono text-white/30">{id}</div>
            </div>
            <div className="text-right space-y-1">
                <div className="text-[11px] font-black text-red-500">{value}</div>
                <div className="text-[10px] text-white/20">{time}</div>
            </div>
        </div>
    )
}

function Shield({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}
