'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useReadContract, useReadContracts } from 'wagmi'
import { X, Search, SlidersHorizontal, Users, Star, Briefcase, ChevronLeft, ChevronRight, CheckCircle, FileText } from 'lucide-react'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ESCROW_FACTORY_ABI, IDENTITY_REGISTRY_ABI } from '@/lib/abis'
import { type MissionApplication } from '@/app/missions/types'
import { shortAddr } from '@/app/missions/utils'
import { formatEther } from 'viem'

const PAGE_SIZE = 6

type Profile = {
    name: string
    pfp: string
    reputationScore: bigint
    registeredAt: bigint
    exists: boolean
}

// ─── Operator entry: two-line card inside the modal ────────────────────────
function ApplicantRow({
    missionId,
    operator,
    profile,
    canSelect,
    isBusy,
    onSelect,
}: {
    missionId: bigint
    operator: string
    profile: Profile | undefined
    canSelect: boolean
    isBusy: boolean
    onSelect: () => void
}) {
    const { data: application } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getApplication',
        args: [missionId, operator as `0x${string}`],
    }) as { data: MissionApplication | undefined }

    const { data: userMissions } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJobsByUser',
        args: [operator as `0x${string}`],
    }) as { data: bigint[] | undefined }

    const { data: userStake } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'requiredStakeFor',
        args: [operator as `0x${string}`],
    }) as { data: bigint | undefined }

    if (application && !application.exists) return null

    const pfpSrc = profile?.pfp && profile.pfp.length > 0 ? profile.pfp : null
    const displayName = profile?.exists ? profile.name : shortAddr(operator)
    const initials = displayName.slice(0, 2).toUpperCase()
    const rep = Number(profile?.reputationScore ?? 0n)
    const missionCount = userMissions?.length ?? 0
    const joined = profile?.registeredAt
        ? new Date(Number(profile.registeredAt) * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : '—'
    const proposal = application?.proposalURI ?? ''

    return (
        <div className="rounded-2xl border border-white/[0.09] bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/25 transition-all duration-200 overflow-hidden">
            {/* ── Line 1: identity + stats + select ──────────────────── */}
            <div className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-2xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20">
                    {pfpSrc
                        /* eslint-disable-next-line @next/next/no-img-element */
                        ? <img src={pfpSrc} alt={displayName} className="w-full h-full object-cover" />
                        : initials
                    }
                </div>

                {/* Name + address */}
                <div className="min-w-0 w-40 shrink-0">
                    <Link href={`/profile/${operator}`} className="font-bold text-primary hover:underline block truncate text-sm leading-tight">
                        {displayName}
                    </Link>
                    <div className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark truncate">{shortAddr(operator)}</div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-white/10 shrink-0" />

                {/* Stats row — pills */}
                <div className="flex items-center gap-2.5 flex-1 flex-wrap">
                    {/* Rep */}
                    <span className="inline-flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-2 py-1 text-xs font-black text-yellow-400 shrink-0">
                        <Star size={10} className="fill-yellow-400" />{rep}
                    </span>
                    {/* Jobs */}
                    <span className="inline-flex items-center gap-1 text-xs text-text-muted-light dark:text-text-muted-dark shrink-0 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                        <Briefcase size={10} />{missionCount} jobs
                    </span>
                    {/* Joined */}
                    <span className="text-xs text-text-muted-light dark:text-text-muted-dark bg-white/5 border border-white/10 rounded-lg px-2 py-1 shrink-0">
                        {joined}
                    </span>
                    {/* Stake */}
                    {userStake !== undefined && (
                        <span className="text-xs text-primary/80 font-bold bg-primary/5 border border-primary/15 rounded-lg px-2 py-1 shrink-0">
                            {formatEther(userStake)} AVAX
                        </span>
                    )}
                </div>

                {/* Select */}
                {canSelect && (
                    <button
                        onClick={onSelect}
                        disabled={isBusy}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
                    >
                        <CheckCircle size={13} />
                        {isBusy ? 'Selecting…' : 'Select'}
                    </button>
                )}
            </div>

            {/* ── Line 2: proposal text — full width, no truncation ───── */}
            {proposal.trim() && (
                <div className="border-t border-white/[0.06] px-5 py-3.5 flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-white/5 border border-white/10 text-text-muted-light dark:text-text-muted-dark">
                        <FileText size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark mb-1">Proposal</div>
                        <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap break-words">{proposal}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main component ─────────────────────────────────────────────────────────
interface OperatorApplicationsPanelProps {
    missionId: bigint
    applicants: string[]
    canSelect: boolean
    isBusy: boolean
    onSelect: (addr: string) => void
}

export function OperatorApplicationsPanel({
    missionId,
    applicants,
    canSelect,
    isBusy,
    onSelect,
}: OperatorApplicationsPanelProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [repFilter, setRepFilter] = useState('Any')
    const [page, setPage] = useState(1)
    const searchRef = useRef<HTMLInputElement>(null)

    // Batch-fetch all profiles for real name search
    const profileContracts = useMemo(() =>
        applicants.map(addr => ({
            address: CONTRACT_ADDRESSES.IdentityRegistry as `0x${string}`,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'getProfile' as const,
            args: [addr as `0x${string}`],
        })),
    [applicants])

    const { data: profileResults } = useReadContracts({ contracts: profileContracts })

    const profiles = useMemo<(Profile | undefined)[]>(() => {
        if (!profileResults) return applicants.map(() => undefined)
        return profileResults.map(r => r.result as Profile | undefined)
    }, [profileResults, applicants])

    const filtered = useMemo(() => {
        const repMin = repFilter === '50+' ? 50 : repFilter === '100+' ? 100 : repFilter === '500+' ? 500 : 0
        return applicants
            .map((addr, i) => ({ addr, profile: profiles[i] }))
            .filter(({ addr, profile }) => {
                const name = profile?.exists ? profile.name.toLowerCase() : ''
                const q = search.toLowerCase()
                if (q && !addr.toLowerCase().includes(q) && !name.includes(q)) return false
                if (repMin > 0 && Number(profile?.reputationScore ?? 0n) < repMin) return false
                return true
            })
    }, [applicants, profiles, search, repFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

    useEffect(() => { setPage(1) }, [search, repFilter])

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return filtered.slice(start, start + PAGE_SIZE)
    }, [filtered, page])

    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 80)
    }, [open])

    useEffect(() => {
        if (!open) return
        document.body.style.overflow = 'hidden'
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKey)
        }
    }, [open])

    return (
        <div className="relative">
            {/* ── Compact trigger card ──────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex-1 w-full text-left glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 hover:border-primary/30 rounded-2xl px-5 py-6 group transition-all duration-300 flex flex-col justify-center"
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                            <Users size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold leading-tight">Operator Applications</h2>
                            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                {applicants.length === 0 ? 'No applications yet' : `${applicants.length} operator${applicants.length !== 1 ? 's' : ''} applied`}
                            </p>
                        </div>
                    </div>
                    {applicants.length > 0 && (
                        <span className="shrink-0 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold group-hover:bg-primary group-hover:text-white transition-all duration-200">
                            Review →
                        </span>
                    )}
                </div>
            </button>

            {/* ── Centered modal ────────────────────────────────────────── */}
            {open && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
                    onClick={() => setOpen(false)}
                >
                    {/* Modal — wider and taller */}
                    <div
                        className="relative w-full max-w-5xl flex flex-col rounded-3xl border border-white/12 bg-[rgba(10,10,22,0.97)] shadow-2xl overflow-hidden animate-enter"
                        style={{ maxHeight: 'min(90vh, 780px)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black">Operator Applications</h3>
                                <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-0.5">
                                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                                    {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="ml-4 shrink-0 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Search + filter */}
                        <div className="flex flex-col sm:flex-row gap-3 px-7 py-4 border-b border-white/10 shrink-0">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name or wallet address…"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-9 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all placeholder:opacity-40"
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 text-xs font-bold" aria-label="Clear search">✕</button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 sm:w-auto">
                                <SlidersHorizontal size={13} className="text-text-muted-light dark:text-text-muted-dark shrink-0" />
                                <select
                                    value={repFilter}
                                    onChange={e => setRepFilter(e.target.value)}
                                    className="bg-transparent py-3 text-sm font-bold outline-none dark:text-white appearance-none"
                                >
                                    {['Any', '50+', '100+', '500+'].map(r => (
                                        <option key={r} value={r} className="bg-[#0a0a16]">{r} Reputation</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Operator list */}
                        <div className="flex-1 overflow-y-auto overscroll-contain px-7 py-5 space-y-3">
                            {paginated.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Users size={44} className="opacity-10 mb-3" />
                                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                        {search || repFilter !== 'Any' ? 'No operators match your filters.' : 'No applications yet.'}
                                    </p>
                                </div>
                            ) : (
                                paginated.map(({ addr, profile }, idx) => (
                                    <div key={addr} style={{ animationDelay: `${idx * 35}ms` }} className="animate-enter">
                                        <ApplicantRow
                                            missionId={missionId}
                                            operator={addr}
                                            profile={profile}
                                            canSelect={canSelect}
                                            isBusy={isBusy}
                                            onSelect={() => { onSelect(addr); setOpen(false) }}
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between gap-4 px-7 py-4 border-t border-white/10 shrink-0">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-colors active:scale-95"
                                >
                                    <ChevronLeft size={14} /> Prev
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-9 h-9 rounded-xl text-sm font-black transition-all active:scale-90 ${p === page ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-colors active:scale-95"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
