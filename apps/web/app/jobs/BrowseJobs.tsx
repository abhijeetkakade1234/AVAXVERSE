'use client'

import React from 'react'
import { useReadContract } from 'wagmi'
import { Globe, Briefcase, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ESCROW_FACTORY_ABI, ESCROW_ABI, ESCROW_STATES, type EscrowState } from '@/lib/abis'
import { type Job } from './types'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const JOB_STATUS_LABELS = ['OPEN', 'SELECTED', 'ACCEPTED', 'FUNDED', 'CLOSED', 'CANCELLED'] as const

function StateBadge({ state }: { state: EscrowState }) {
    const colors: Record<EscrowState, string> = {
        FUNDED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        SUBMITTED: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        APPROVED: 'bg-green-500/10 text-green-400 border border-green-500/20',
        DISPUTED: 'bg-red-500/10 text-red-400 border border-red-500/20',
        RELEASED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        REFUNDED: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    }

    return (
        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${colors[state] ?? colors.FUNDED}`}>
            {state}
        </span>
    )
}

const REWARD_BOUNDS: Record<string, [number, number]> = {
    'Any Reward': [0, Infinity],
    '0-10 AVAX': [0, 10],
    '10-100 AVAX': [10, 100],
    '100+ AVAX': [100, Infinity],
}

const SPECIALIZATION_KEYWORDS: Record<string, string[]> = {
    DeFi: ['defi', 'dex', 'amm', 'lending', 'liquidity', 'yield', 'staking', 'swap'],
    Subnets: ['subnet', 'subnets', 'avalanche l1', 'l1', 'validator set'],
    Security: ['security', 'audit', 'exploit', 'vulnerability', 'penetration', 'monitoring'],
    Infrastructure: ['infrastructure', 'infra', 'node', 'rpc', 'indexer', 'deployment', 'ops'],
    Bridges: ['bridge', 'bridging', 'cross-chain', 'cross chain', 'interchain'],
}

function JobCard({ jobId, search, stateFilter, rewardFilter }: {
    jobId: bigint
    search: string
    stateFilter: string
    rewardFilter: string
}) {
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
        query: { enabled: !!job?.escrow && job.escrow !== ZERO_ADDRESS },
    }) as { data: bigint | undefined }

    if (!job) return null

    const stateIndex = state !== undefined ? Number(state) : undefined
    const stateName: EscrowState = stateIndex !== undefined ? ESCROW_STATES[stateIndex] : 'FUNDED'
    const jobStatus = JOB_STATUS_LABELS[job.status] ?? 'OPEN'
    const displayBadge = job.status === 2 && job.escrow !== ZERO_ADDRESS ? stateName : jobStatus
    const budgetAvax = Number(job.budget) / 1e18

    if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return null

    if (stateFilter && stateFilter !== 'All') {
        const keywords = SPECIALIZATION_KEYWORDS[stateFilter] ?? []
        const titleText = job.title.toLowerCase()
        const matchesSpecialization = keywords.some(keyword => titleText.includes(keyword))
        if (!matchesSpecialization) return null
    }

    const [minAvax, maxAvax] = REWARD_BOUNDS[rewardFilter] ?? [0, Infinity]
    if (budgetAvax < minAvax || budgetAvax > maxAvax) return null

    const budgetDisplay = budgetAvax.toFixed(2)
    const createdDate = job.createdAt > BigInt(0)
        ? new Date(Number(job.createdAt) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '-'

    return (
        <Link href={`/jobs/${jobId}`}>
            <div className="mission-card-hover glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 flex flex-col h-full cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Briefcase size={24} />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-primary">{budgetDisplay} AVAX</div>
                        <div className="text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest flex items-center justify-end gap-1">
                            <ShieldCheck size={10} /> Escrow Backed
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                    {displayBadge === 'OPEN' || displayBadge === 'SELECTED' || displayBadge === 'CANCELLED' || displayBadge === 'CLOSED'
                        ? <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">{displayBadge}</span>
                        : <StateBadge state={displayBadge as EscrowState} />
                    }
                </div>

                <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
                        <span>Client</span>
                        <span className="font-mono text-primary/70">{job.client.slice(0, 8)}...{job.client.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
                        <span>Operator</span>
                        <span className="font-mono text-primary/50">{job.freelancer.slice(0, 8)}...{job.freelancer.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
                        <span>Posted</span>
                        <span>{createdDate}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function BrowseJobs({ search, stateFilter, rewardFilter }: {
    search: string
    stateFilter: string
    rewardFilter: string
}) {
    const { data: totalJobs } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'totalJobs',
    })

    const total = Number(totalJobs ?? 0)

    return total === 0 ? (
        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-20 text-center">
            <Globe size={48} className="mx-auto mb-4 text-text-muted-light/20 animate-pulse" />
            <p className="text-text-muted-light/40 dark:text-text-muted-dark/40 font-bold uppercase tracking-widest text-xs">No active missions detected.</p>
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: total }, (_, i) => (
                <JobCard key={i} jobId={BigInt(i)} search={search} stateFilter={stateFilter} rewardFilter={rewardFilter} />
            ))}
        </div>
    )
}
