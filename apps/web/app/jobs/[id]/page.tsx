'use client'

import React, { use, useEffect } from 'react'
import {
    Clock,
    Wallet,
    ArrowLeft,
    ShieldCheck,
    FileText,
    MessageSquare,
    ExternalLink,
    ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
} from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ESCROW_FACTORY_ABI, ESCROW_ABI, ESCROW_STATES, type EscrowState } from '@/lib/abis'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { address: connectedAddress } = useAccount()

    // 1. Fetch Job Info from Factory
    const { data: job, isLoading: isJobLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJob',
        args: [BigInt(id)],
    })

    // 2. Fetch Escrow State
    const { data: state, refetch: refetchState } = useReadContract({
        address: job?.escrow as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getState',
        query: { enabled: !!job?.escrow },
    })

    // 3. Contract Actions
    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    // Refresh state after success
    useEffect(() => {
        if (isSuccess) refetchState()
    }, [isSuccess, refetchState])

    if (isJobLoading) return <div className="min-h-screen pt-40 text-center text-white/20 font-bold uppercase tracking-widest animate-pulse">Scanning Neural Links...</div>
    if (!job) return <div className="min-h-screen pt-40 text-center text-red-500 font-bold">MISSION ID NOT FOUND</div>

    const stateName: EscrowState = state !== undefined ? ESCROW_STATES[state] : 'FUNDED'
    const isClient = connectedAddress?.toLowerCase() === job.client.toLowerCase()
    const isOperator = connectedAddress?.toLowerCase() === job.freelancer.toLowerCase()

    const handleAction = (functionName: 'submitWork' | 'approveWork' | 'raiseDispute' | 'refund', args?: readonly unknown[]) => {
        writeContract({
            address: job.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            args: args as any,
        })
    }

    return (
        <main className="min-h-screen bg-[#111118] text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-40 pb-20">
                <Section>
                    <Link href="/jobs" className="inline-flex items-center gap-2 text-white/40 hover:text-red-500 transition-colors mb-12 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Mission Control
                    </Link>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Main Content */}
                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className={`badge ${stateName === 'DISPUTED' ? 'badge-red' : stateName === 'APPROVED' || stateName === 'RELEASED' ? 'badge-green' : 'badge-red'} flex items-center gap-1.5 px-3 py-1 font-black text-[10px]`}>
                                        <Wallet size={12} /> {stateName}
                                    </div>
                                    <span className="text-white/20 text-xs font-mono">Mission ID: {id}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black leading-tight">
                                    {job.title}
                                </h1>
                            </div>

                            <div className="p-8 glass-card rounded-3xl border-white/5 space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FileText size={20} className="text-red-500" /> Mission Brief
                                </h2>
                                <p className="text-white/50 leading-relaxed text-lg">
                                    Secure escrow engagement for protocol operations. This mission is managed via the AVAXVERSE infrastructure.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                    <AddrLink label="Client / Deployer" addr={job.client} />
                                    <AddrLink label="Operator / Agent" addr={job.freelancer} />
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Clock size={20} className="text-red-500" /> Protocol History
                                </h2>
                                <div className="space-y-0.5">
                                    <TimelineItem date={new Date(Number(job.createdAt) * 1000).toLocaleDateString()} title="Escrow Initialized" desc={`Contract deployed and funded with ${formatEther(job.budget)} AVAX.`} completed />
                                    <TimelineItem date="Assigned" title="Operator Assigned" desc="Mission accepted by audited security agent." completed />
                                    <TimelineItem date={stateName === 'SUBMITTED' ? 'Active' : 'Pending'} title="Submission" desc="Freelancer work delivery status." completed={state !== undefined && state >= 1} />
                                    <TimelineItem date={stateName === 'RELEASED' ? 'Finalized' : 'Pending'} title="Release" desc="Verification and funds liberation." completed={state !== undefined && state >= 4} />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-96 space-y-6">
                            <div className="glass-card p-8 rounded-3xl border-white/10 glow-border relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                                    <ShieldCheck size={120} />
                                </div>

                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Secure Escrow</div>
                                <div className="text-5xl font-black text-red-500 mb-6">{formatEther(job.budget)} <span className="text-xl">AVAX</span></div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/40">Status</span>
                                        <span className={`${stateName === 'RELEASED' ? 'text-green-500' : 'text-red-500'} font-bold`}>
                                            {stateName === 'RELEASED' ? 'Funds Distributed' : 'Locked in Escrow'}
                                        </span>
                                    </div>
                                </div>

                                {isOperator && state === 0 && (
                                    <button
                                        onClick={() => handleAction('submitWork', ['ipfs://work-intel'])}
                                        disabled={isPending || isConfirming}
                                        className="btn-primary w-full py-4 justify-center text-lg mb-4"
                                    >
                                        {isPending || isConfirming ? 'Processing...' : 'Submit Intel'} <ChevronRight size={20} className="ml-2" />
                                    </button>
                                )}

                                {isClient && state === 1 && (
                                    <button
                                        onClick={() => handleAction('approveWork')}
                                        disabled={isPending || isConfirming}
                                        className="btn-primary w-full py-4 justify-center text-lg mb-4"
                                    >
                                        {isPending || isConfirming ? 'Processing...' : 'Approve & Release'} <ChevronRight size={20} className="ml-2" />
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {(isClient || isOperator) && state === 1 && (
                                        <button
                                            onClick={() => handleAction('raiseDispute')}
                                            disabled={isPending || isConfirming}
                                            className="btn-secondary py-3 justify-center text-xs border-red-500/20 text-red-500 hover:bg-red-500/10"
                                        >
                                            Raise Dispute
                                        </button>
                                    )}
                                    {isClient && state === 0 && (
                                        <button
                                            onClick={() => handleAction('refund')}
                                            disabled={isPending || isConfirming}
                                            className="btn-secondary py-3 justify-center text-xs border-white/10"
                                        >
                                            Request Refund
                                        </button>
                                    )}
                                </div>

                                <button className="btn-secondary w-full py-4 justify-center text-sm border-white/10">
                                    <MessageSquare size={18} className="mr-2" /> Open Comms
                                </button>
                            </div>

                            <div className="glass-card p-6 rounded-3xl border-white/5 space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-white/30">Verification Nodes</h3>
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111118] bg-white/5 flex items-center justify-center text-[10px] font-bold">
                                            V{i}
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-[#111118] bg-red-500/20 text-red-500 flex items-center justify-center text-[10px] font-bold">
                                        +12
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/20 italic">Validated by 16 independent consensus nodes.</p>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            <div className="px-4 md:px-8 pb-12">
                <Footer />
            </div>
        </main>
    )
}


function AddrLink({ label, addr }: { label: string, addr: string }) {
    return (
        <div className="space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">{label}</div>
            <div className="flex items-center gap-2 text-sm font-mono text-white/60 hover:text-white transition-colors cursor-pointer group">
                <span className="truncate max-w-[120px] md:max-w-none">{addr}</span>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    )
}

function TimelineItem({ date, title, desc, completed }: { date: string, title: string, desc: string, completed?: boolean }) {
    return (
        <div className="relative pl-10 pb-10 last:pb-0 group">
            <div className="absolute left-0 top-0 h-full w-px bg-white/5 group-last:h-5" />
            <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#111118] ${completed ? 'bg-red-500 shadow-[0_0_10px_rgba(232,65,66,0.5)]' : 'bg-white/10'}`} />

            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white/80">{title}</span>
                    <span className="text-[10px] font-mono text-white/20 italic">{date}</span>
                </div>
                <p className="text-xs text-white/30 leading-relaxed max-w-md">{desc}</p>
            </div>
        </div>
    )
}
