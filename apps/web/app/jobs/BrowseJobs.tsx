'use client'

import React, { useState, useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { Globe, Briefcase, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ESCROW_FACTORY_ABI, ESCROW_ABI, ESCROW_STATES, type EscrowState } from '@/lib/abis'
import { type Job } from './types'
import Pagination from '@/components/ui/Pagination'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const JOB_STATUS_LABELS = ['OPEN', 'SELECTED', 'ACCEPTED', 'FUNDED', 'CLOSED', 'CANCELLED'] as const

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

// ⚡ Bolt Performance Optimization:
// Memoizing JobCard prevents up to 100 expensive re-renders (involving Wagmi useReadContract hooks)
// on every keystroke in the search input or filter changes.
const JobCard = React.memo(function JobCard({ jobId, job }: { jobId: bigint; job: Job }) {
    const { data: state } = useReadContract({
        address: (job.escrow ?? '0x0') as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getState',
        query: { enabled: !!job.escrow && job.escrow !== ZERO_ADDRESS },
    }) as { data: bigint | undefined }

    const stateIndex = state !== undefined ? Number(state) : undefined
    const stateName: EscrowState = stateIndex !== undefined ? ESCROW_STATES[stateIndex] : 'FUNDED'
    const jobStatus = JOB_STATUS_LABELS[job.status] ?? 'OPEN'

    let displayBadge: string = jobStatus
    if (job.status === 3 && job.escrow !== ZERO_ADDRESS) {
        displayBadge = stateName
    }

    const budgetAvax = Number(job.budget) / 1e18
    const budgetDisplay = budgetAvax.toFixed(2)
    const createdDate = job.createdAt > BigInt(0)
        ? new Date(Number(job.createdAt) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '-'

    return (
        <Link href={`/jobs/${jobId}`}>
            <div className="mission-card-hover glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 flex flex-col h-full cursor-pointer group animate-enter">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Briefcase size={24} />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-primary group-hover:text-primary-light transition-colors">{budgetDisplay} AVAX</div>
                        <div className="text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest flex items-center justify-end gap-1">
                            <ShieldCheck size={10} /> Escrow Backed
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 leading-tight group-hover:text-primary transition-colors dark:text-white">{job.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                    {displayBadge === 'OPEN' || displayBadge === 'SELECTED' || displayBadge === 'ACCEPTED' || displayBadge === 'CANCELLED' || displayBadge === 'CLOSED'
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
                        <span className="font-mono text-primary/50 truncate max-w-[100px]">{job.freelancer === ZERO_ADDRESS ? 'UNASSIGNED' : `${job.freelancer.slice(0, 6)}...${job.freelancer.slice(-4)}`}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
                        <span>Posted</span>
                        <span>{createdDate}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
})

export default function BrowseJobs({ search, stateFilter, rewardFilter, statusFilter }: {
    search: string
    stateFilter: string
    rewardFilter: string
    statusFilter: string
}) {
    const [currentPage, setCurrentPage] = useState(1)
    const [prevFilters, setPrevFilters] = useState({ search, stateFilter, rewardFilter, statusFilter })

    if (search !== prevFilters.search ||
        stateFilter !== prevFilters.stateFilter ||
        rewardFilter !== prevFilters.rewardFilter ||
        statusFilter !== prevFilters.statusFilter) {
        setPrevFilters({ search, stateFilter, rewardFilter, statusFilter })
        setCurrentPage(1)
    }

    const pageSize = 100

    const { data: totalJobsCount } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'totalJobs',
    })

    const totalCount = Number(totalJobsCount ?? 0)

    // We fetch the last 150 IDs to keep performance stable in the browser
    // even without a real backend indexer.
    const ids = useMemo(() => {
        if (totalCount === 0) return []
        const countToFetch = Math.min(totalCount, 150)
        return Array.from({ length: countToFetch }, (_, i) => BigInt(totalCount - 1 - i))
    }, [totalCount])

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

    const filteredJobs = useMemo(() => {
        return allJobs.filter(({ job }) => {
            // Title search
            if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return false

            // Specialization filter
            if (stateFilter && stateFilter !== 'All') {
                const keywords = SPECIALIZATION_KEYWORDS[stateFilter] ?? []
                const titleText = job.title.toLowerCase()
                if (!keywords.some(keyword => titleText.includes(keyword))) return false
            }

            // Reward Filter
            const budgetAvax = Number(job.budget) / 1e18
            const [minAvax, maxAvax] = REWARD_BOUNDS[rewardFilter] ?? [0, Infinity]
            if (budgetAvax < minAvax || budgetAvax > maxAvax) return false

            // Status Filter
            if (statusFilter && statusFilter !== 'All Statuses') {
                const isCompleted = job.status >= 4 // CLOSED/CANCELLED are base completions
                const isOpen = job.status === 0
                const isInProgress = !isOpen && !isCompleted

                if (statusFilter === 'Open' && !isOpen) return false
                if (statusFilter === 'In Progress' && !isInProgress) return false
                if (statusFilter === 'Completed' && !isCompleted) return false
            }

            return true
        })
    }, [allJobs, search, stateFilter, rewardFilter, statusFilter])

    const totalPages = Math.ceil(filteredJobs.length / pageSize)
    const paginatedJobs = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredJobs.slice(start, start + pageSize)
    }, [filteredJobs, currentPage, pageSize])


    if (isLoading && totalCount > 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-enter">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-panel h-80 bg-white/5 animate-pulse rounded-3xl border border-white/10"></div>
                ))}
            </div>
        )
    }

    if (totalCount === 0 || (filteredJobs.length === 0 && !isLoading)) {
        return (
            <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-20 text-center animate-enter">
                <Globe size={48} className="mx-auto mb-4 text-text-muted-light/20" />
                <p className="text-text-muted-light/40 dark:text-text-muted-dark/40 font-bold uppercase tracking-widest text-xs">No matching missions found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-enter">
                {paginatedJobs.map(({ id, job }) => (
                    <JobCard key={id.toString()} jobId={id} job={job} />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
