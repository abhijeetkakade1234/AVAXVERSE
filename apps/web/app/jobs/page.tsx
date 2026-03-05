'use client'

import React, { useState } from 'react'
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
} from 'wagmi'
import { parseEther } from 'viem'
import {
    Briefcase,
    Search,
    Plus,
    ClipboardList,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Wallet,
    ArrowRightLeft,
    GanttChart,
    Target,
    Globe,
    Coins
} from 'lucide-react'
import { Section } from '@/components/ui'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ESCROW_FACTORY_ABI, ESCROW_ABI, ESCROW_STATES, type EscrowState } from '@/lib/abis'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

// ─── Component ────────────────────────────────────────────────────────
function StateBadge({ state }: { state: EscrowState }) {
    const map: Record<EscrowState, { icon: React.ReactNode, class: string }> = {
        FUNDED: { icon: <Wallet size={12} />, class: 'badge-blue' },
        SUBMITTED: { icon: <Clock size={12} />, class: 'badge-gray' },
        APPROVED: { icon: <CheckCircle2 size={12} />, class: 'badge-green' },
        DISPUTED: { icon: <AlertTriangle size={12} />, class: 'badge-red' },
        RELEASED: { icon: <CheckCircle2 size={12} />, class: 'badge-green' },
        REFUNDED: { icon: <ArrowRightLeft size={12} />, class: 'badge-gray' },
    }
    const config = map[state] || map.FUNDED
    return (
        <div className={`badge ${config.class} gap-1.5 px-3 py-1 font-black text-[10px]`}>
            {config.icon} {state}
        </div>
    )
}

type Job = {
    escrow: string
    client: string
    freelancer: string
    title: string
    budget: bigint
    createdAt: bigint
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function JobsPage() {
    const { address, isConnected } = useAccount()
    const [tab, setTab] = useState<'browse' | 'create' | 'manage'>('browse')

    return (
        <main className="min-h-screen pt-48 pb-32 dot-grid">
            <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

            <Section>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
                            <GanttChart size={14} /> Market Protocol
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none gradient-text-subtle">
                            Mission <span className="text-red-500">Control.</span>
                        </h1>
                        <p className="text-white/40 max-w-lg text-lg">
                            Secure, on-chain freelancing powered by Avalanche. No middlemen, just smart contracts.
                        </p>
                    </div>

                    {!isConnected ? (
                        <div className="transform transition-transform hover:scale-105 active:scale-95 shadow-2xl">
                            <ConnectButton />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <TabBtn active={tab === 'browse'} onClick={() => setTab('browse')} icon={<Search size={16} />} label="Browse" />
                            <TabBtn active={tab === 'create'} onClick={() => setTab('create')} icon={<Plus size={16} />} label="Post" />
                            <TabBtn active={tab === 'manage'} onClick={() => setTab('manage')} icon={<ClipboardList size={16} />} label="My Ops" />
                        </div>
                    )}
                </div>

                {!isConnected ? (
                    <div className="glass p-20 text-center border-white/5 glow-border">
                        <Target size={64} className="mx-auto mb-6 text-white/10" />
                        <h2 className="text-2xl font-bold mb-3">Restricted Access</h2>
                        <p className="text-white/30 max-w-xs mx-auto mb-8 text-sm">
                            Deploy your credentials to access the marketplace and escrow infrastructure.
                        </p>
                        <div className="inline-block"><ConnectButton /></div>
                    </div>
                ) : (
                    <div className="animate-enter">
                        {tab === 'browse' && <BrowseJobs />}
                        {tab === 'create' && <CreateJob />}
                        {tab === 'manage' && <ManageJobs address={address!} />}
                    </div>
                )}
            </Section>
        </main>
    )
}

function TabBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm ${active
                ? 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
        >
            {icon} {label}
        </button>
    )
}

// ─── Browse Jobs ──────────────────────────────────────────────────────────────
function BrowseJobs() {
    const { data: totalJobs } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'totalJobs',
    })

    const total = Number(totalJobs ?? 0)

    return total === 0 ? (
        <div className="glass p-20 text-center border-white/5">
            <Globe size={48} className="mx-auto mb-4 text-white/10 animate-pulse" />
            <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No active missions detected.</p>
        </div>
    ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: total }, (_, i) => (
                <JobCard key={i} jobId={BigInt(i)} />
            ))}
        </div>
    )
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ jobId }: { jobId: bigint }) {
    const { data: job } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJob',
        args: [jobId],
    }) as { data: Job | undefined }

    const { data: state } = useReadContract({
        address: (job?.escrow ?? '0x0') as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getState',
        query: { enabled: !!job?.escrow },
    }) as { data: number | undefined }

    if (!job) return null

    const stateName: EscrowState = state !== undefined ? ESCROW_STATES[state] : 'FUNDED'

    return (
        <div className="glass p-6 border-white/5 card-hover relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform opacity-[0.05] group-hover:opacity-10">
                <Briefcase size={80} />
            </div>

            <div className="flex justify-between items-start mb-4">
                <StateBadge state={stateName} />
                <div className="text-right">
                    <div className="text-xs font-black text-white/20 uppercase tracking-widest">Revenue</div>
                    <div className="text-xl font-black text-red-500">{Number(job.budget) / 1e18} AVAX</div>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-red-400 transition-colors tracking-tight">{job.title}</h3>

            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4 mt-4">
                <AddrRow label="Client" addr={job.client} />
                <AddrRow label="Operator" addr={job.freelancer} />
            </div>

            <div className="mt-6">
                <Link href={`/jobs/${jobId}`}>
                    <button className="btn-secondary w-full py-2.5 text-xs text-red-500/80 hover:text-white justify-center border-red-500/20 card-hover">
                        View Intel <ArrowRightLeft size={14} className="ml-2" />
                    </button>
                </Link>
            </div>
        </div>
    )
}

function AddrRow({ label, addr }: { label: string, addr: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{label}</span>
            <span className="text-[11px] font-mono text-white/40">{addr.slice(0, 8)}...{addr.slice(-6)}</span>
        </div>
    )
}

// ─── Create Job ───────────────────────────────────────────────────────────────
function CreateJob() {
    const [title, setTitle] = useState('')
    const [freelancer, setFreelancer] = useState('')
    const [budget, setBudget] = useState('')

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'createJob',
            args: [freelancer as `0x${string}`, title],
            value: parseEther(budget),
        })
    }

    return (
        <div className="glass p-10 border-white/5 glow-border max-w-xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                    <Plus size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black">Post Mission</h2>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Secure Escrow Infrastructure</p>
                </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Mission Title</label>
                    <input className="input-field py-4" placeholder="e.g. Smart Contract Security Audit" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Operator Address</label>
                        <input className="input-field py-4" placeholder="0x..." value={freelancer} onChange={(e) => setFreelancer(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Budget (AVAX)</label>
                        <div className="relative">
                            <input className="input-field py-4 pl-10" type="number" step="0.01" placeholder="10.0" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                            <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        </div>
                    </div>
                </div>

                {isSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-bold">Protocol initiated. Mission is being funded.</span>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary w-full py-4 text-lg hover:shadow-red-500/40"
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming
                        ? <><Loader2 size={24} className="animate-spin" /> <span>Validating...</span></>
                        : <><Plus size={20} /> <span>Deploy Escrow</span></>
                    }
                </button>
            </form>
        </div>
    )
}

// ─── Manage Jobs ──────────────────────────────────────────────────────────────
function ManageJobs({ address }: { address: string }) {
    const { data: jobIds } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJobsByUser',
        args: [address as `0x${string}`],
    }) as { data: bigint[] | undefined }

    if (!jobIds || jobIds.length === 0) {
        return (
            <div className="glass p-20 text-center border-white/5">
                <Target size={48} className="mx-auto mb-4 text-white/10" />
                <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No personal missions on file.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jobIds.map((id) => <JobCard key={id.toString()} jobId={id} />)}
        </div>
    )
}
