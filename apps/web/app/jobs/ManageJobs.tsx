'use client'

import React, { useState, useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { ClipboardList, ArrowRight, Coins } from 'lucide-react'
import Link from 'next/link'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ESCROW_FACTORY_ABI, ESCROW_ABI, ESCROW_STATES, type EscrowState } from '@/lib/abis'
import { type Job } from './types'
import Pagination from '@/components/ui/Pagination'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const JOB_STATUS_LABELS = ['OPEN', 'SELECTED', 'ACCEPTED', 'FUNDED', 'CLOSED', 'CANCELLED'] as const
const TIMELINE_STATES: EscrowState[] = ['FUNDED', 'SUBMITTED', 'APPROVED', 'RELEASED']

// ─── Manage Job Card ──────────────────────────────────────────────────────────
function ManageJobCard({ jobId, job, address }: { jobId: bigint; job: Job; address: string }) {
    const { data: state } = useReadContract({
        address: (job.escrow ?? '0x0') as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getState',
        query: { enabled: !!job.escrow && job.escrow !== ZERO_ADDRESS },
    }) as { data: bigint | undefined }

    const isClient = address.toLowerCase() === job.client.toLowerCase()

    const hasEscrow = job.escrow !== ZERO_ADDRESS
    const stateIndex = state !== undefined ? Number(state) : undefined
    const stateName: EscrowState = stateIndex !== undefined ? ESCROW_STATES[stateIndex] : 'FUNDED'
    const marketplaceStatus = JOB_STATUS_LABELS[job.status] ?? 'OPEN'
    const displayStatus = hasEscrow ? stateName : marketplaceStatus

    const displayIdx = hasEscrow ? Math.max(0, TIMELINE_STATES.indexOf(stateName)) : 0
    const progressPct = Math.round(((displayIdx + 1) / TIMELINE_STATES.length) * 100)
    const budgetAvax = (Number(job.budget) / 1e18).toFixed(2)
    const counterpart = isClient ? job.freelancer : job.client
    const createdDate = job.createdAt > BigInt(0)
        ? new Date(Number(job.createdAt) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '—'

    const stateColor =
        displayStatus === 'RELEASED' ? 'text-emerald-400' :
            displayStatus === 'DISPUTED' ? 'text-red-400' :
                displayStatus === 'REFUNDED' ? 'text-gray-400' :
                    displayStatus === 'SUBMITTED' ? 'text-yellow-400' : 'text-blue-400'

    return (
        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 hover:border-primary/50 transition-all group animate-enter">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 text-text-dark">
                {/* Job Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 border rounded-md text-[10px] font-bold uppercase tracking-wider ${isClient
                            ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/30'
                            : 'bg-neon-purple/20 text-neon-purple border-neon-purple/30'
                            }`}>
                            {isClient ? 'Client' : 'Operator'}
                        </span>
                        <span className="text-text-muted-light dark:text-text-muted-dark text-xs font-mono font-bold">#OP-{jobId.toString().padStart(4, '0')}</span>
                        <span className={`text-[10px] font-extrabold uppercase ${stateColor}`}>{displayStatus}</span>
                        <span className="text-text-muted-light dark:text-text-muted-dark text-xs">{createdDate}</span>
                    </div>
                    <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors dark:text-white">{job.title}</h3>
                    <p className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark mt-1">
                        {isClient ? 'Operator' : 'Client'}: {counterpart.slice(0, 10)}…{counterpart.slice(-6)}
                    </p>
                </div>

                {/* Progress */}
                <div className="lg:w-56">
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Progress</span>
                        <span className="text-xs font-bold dark:text-white">{progressPct}%</span>
                    </div>
                    <div className="flex gap-1.5">
                        {TIMELINE_STATES.map((s, i) => (
                            <div key={s} className={`progress-step ${displayIdx >= i ? 'bg-primary' : 'bg-white/10'}`} title={s} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] font-extrabold text-text-muted-light/50 uppercase tracking-tighter">
                        {TIMELINE_STATES.map(s => <span key={s}>{s.slice(0, 4)}</span>)}
                    </div>
                </div>

                {/* Budget + Navigate */}
                <div className="flex items-center justify-between lg:justify-end gap-6 lg:w-40">
                    <div className="text-right">
                        <span className="block text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Escrow</span>
                        <span className="text-lg font-black tracking-tight dark:text-white">{budgetAvax} <span className="text-xs font-bold opacity-60">AVAX</span></span>
                    </div>
                    <Link href={`/jobs/${jobId}`}>
                        <button className="w-10 h-10 rounded-full bg-white/20 dark:bg-white/5 border border-white/40 dark:border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group-hover:scale-110 active:scale-95" title="View mission">
                            <ArrowRight size={18} className="dark:text-white" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ─── Manage Jobs ──────────────────────────────────────────────────────────────
export default function ManageJobs({ address }: { address: string }) {
    const [subTab, setSubTab] = useState<'active' | 'history'>('active')
    const [currentPage, setCurrentPage] = useState(1)
    const [prevSubTab, setPrevSubTab] = useState(subTab)

    if (subTab !== prevSubTab) {
        setPrevSubTab(subTab)
        setCurrentPage(1)
    }

    const pageSize = 100

    const { data: jobIds } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJobsByUser',
        args: [address as `0x${string}`],
    }) as { data: bigint[] | undefined }

    const ids = useMemo(() => jobIds ?? [], [jobIds])

    const contracts = useMemo(() => ids.map(id => ({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJob',
        args: [id],
    })), [ids])

    const { data: jobsResult, isLoading } = useReadContracts({
        contracts,
    })

    const allJobs = useMemo(() => {
        if (!jobsResult) return []
        return jobsResult.map((res, i) => ({
            id: ids[i],
            job: res.result as unknown as Job,
        })).filter(x => !!x.job)
    }, [jobsResult, ids])

    // Pre-filtering for pagination accuracy
    const filteredJobs = useMemo(() => {
        return allJobs.filter(({ job }) => {
            const hasEscrow = job.escrow !== ZERO_ADDRESS
            if (!hasEscrow) {
                if (subTab === 'active') return job.status < 4
                if (subTab === 'history') return job.status >= 4
            }
            // For escrowed jobs, we'd need the state, but status is a good fallback for initial filter
            // Jobs with status 4/5 are almost certainly history
            if (subTab === 'active') return job.status < 4
            if (subTab === 'history') return job.status >= 4
            return true
        })
    }, [allJobs, subTab])

    const totalPages = Math.ceil(filteredJobs.length / pageSize)
    const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize)


    const { activeCount, historyCount } = useMemo(() => {
        return {
            activeCount: allJobs.filter(x => x.job.status < 4).length,
            historyCount: allJobs.filter(x => x.job.status >= 4).length
        }
    }, [allJobs])

    if (isLoading && ids.length > 0) return <div className="p-20 text-center opacity-50 animate-pulse font-bold uppercase tracking-widest text-xs">Synchronizing Intelligence...</div>

    if (ids.length === 0) return (
        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-20 text-center animate-enter">
            <ClipboardList size={48} className="mx-auto mb-4 text-text-muted-light/20" />
            <p className="text-text-muted-light/40 dark:text-text-muted-dark/40 font-bold uppercase tracking-widest text-xs">No operational history found.</p>
        </div>
    )

    return (
        <div className="flex flex-col gap-6 animate-enter">
            {/* Sub-tab toggle */}
            <div className="flex p-1.5 bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                <button
                    onClick={() => setSubTab('active')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${subTab === 'active' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'hover:bg-white/20 text-text-muted-light dark:text-text-muted-dark'}`}
                >
                    Active Missions ({activeCount})
                </button>
                <button
                    onClick={() => setSubTab('history')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${subTab === 'history' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'hover:bg-white/20 text-text-muted-light dark:text-text-muted-dark'}`}
                >
                    All History ({historyCount})
                </button>
            </div>

            {/* Mission list */}
            <div className="space-y-4 min-h-[400px]">
                {paginatedJobs.length > 0 ? (
                    <>
                        {paginatedJobs.map(({ id, job }) => (
                            <ManageJobCard key={id.toString()} jobId={id} job={job} address={address} />
                        ))}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                ) : (
                    <div className="glass-panel p-20 text-center border-dashed border-white/10 opacity-30 rounded-3xl font-bold">
                        No missions found in this category.
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="glass-panel bg-white/30 dark:bg-white/5 border border-white/20 rounded-2xl p-6">
                    <div className="text-[11px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mb-1">Total Intelligence Packages</div>
                    <div className="text-2xl font-black text-primary">{ids.length}</div>
                </div>
                <div className="glass-panel bg-white/30 dark:bg-white/5 border border-white/20 rounded-2xl p-6 flex items-center gap-3">
                    <Coins size={20} className="text-primary shrink-0" />
                    <div>
                        <div className="text-[11px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mb-0.5">Operator Wallet</div>
                        <div className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark truncate">{address.slice(0, 12)}…{address.slice(-6)}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
