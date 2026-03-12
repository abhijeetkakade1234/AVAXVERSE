'use client'

import React, { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { Plus, Search, Target, SlidersHorizontal } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import BrowseMissions from './BrowseMissions'
import CreateMission from './CreateMission'
import ManageMissions from './ManageMissions'
import Footer from '@/components/Footer'

const SPECIALIZATIONS = ['All', 'DeFi', 'Subnets', 'Security', 'Infrastructure', 'Bridges']
const REWARD_RANGES = ['Any Reward', '0-10 AVAX', '10-100 AVAX', '100+ AVAX']
const STATUS_FILTERS = ['All Statuses', 'Open', 'In Progress', 'Completed']

import { Suspense } from 'react'

function MissionsContent() {
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState('')
    const [specialization, setSpec] = useState('All')
    const [rewardRange, setRewardRange] = useState('Any Reward')
    const [statusFilter, setStatusFilter] = useState('All Statuses')

    const tab: 'browse' | 'create' | 'manage' = useMemo(() => {
        const queryTab = searchParams.get('tab')
        if (queryTab === 'browse' || queryTab === 'create' || queryTab === 'manage') {
            return queryTab
        }
        return 'browse'
    }, [searchParams])

    const switchTab = (nextTab: 'browse' | 'create' | 'manage') => {
        router.replace(`/missions?tab=${nextTab}`, { scroll: false })
    }

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300 flex flex-col pt-24">
            <Navbar />
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 font-outfit">
                            {tab === 'create' ? 'Initialize New Mission' : 'Mission Marketplace'}
                        </h1>
                        <p className="text-text-muted-light dark:text-text-muted-dark font-medium max-w-2xl">
                            {tab === 'create'
                                ? 'Deploy a high-stakes protocol task backed by secure Avalanche smart contract escrows.'
                                : 'Browse high-stakes operations across the Avalanche network.'}
                            <Link href="/missions/how-it-works" className="ml-2 text-primary hover:underline inline-flex items-center gap-1">
                                Learn how it works <Search size={12} />
                            </Link>
                        </p>
                    </div>

                    <div className="flex items-center bg-white/30 dark:bg-black/20 rounded-full px-2 py-1 shadow-sm border border-white/40 dark:border-white/10">
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors fluid-touch ${tab === 'browse' ? 'bg-white dark:bg-surface-dark shadow-sm' : 'hover:bg-white dark:hover:bg-surface-dark'}`}
                            onClick={() => switchTab('browse')}
                        >
                            Browse Ops
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors fluid-touch ${tab === 'create' ? 'bg-white dark:bg-surface-dark shadow-sm' : 'hover:bg-white dark:hover:bg-surface-dark'}`}
                            onClick={() => switchTab('create')}
                        >
                            <span className="flex items-center gap-1.5"><Plus size={14} /> Post</span>
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors fluid-touch ${(tab === 'manage' && isConnected) ? 'bg-white dark:bg-surface-dark shadow-sm' : 'hover:bg-white dark:hover:bg-surface-dark'}`}
                            onClick={() => switchTab('manage')}
                        >
                            My Ops
                        </button>
                    </div>
                </div>

                <div className="animate-enter">
                    {tab === 'browse' && (
                        <>
                            <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-4 mb-10 shadow-sm flex flex-col lg:flex-row items-center gap-4">
                                <div className="relative flex-1 w-full">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark" />
                                    <input
                                        className="w-full bg-white/30 dark:bg-black/20 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary text-sm font-medium placeholder:text-text-muted-light/60 outline-none"
                                        placeholder="Search by mission title..."
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted-light hover:text-text-dark transition-colors text-xs font-bold">X</button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                    <div className="relative min-w-[160px] flex-1 lg:flex-initial flex items-center gap-2">
                                        <SlidersHorizontal size={14} className="text-text-muted-light dark:text-text-muted-dark shrink-0" />
                                        <select
                                            className="w-full bg-white/30 dark:bg-black/40 border-none rounded-2xl py-3 pl-2 pr-8 focus:ring-2 focus:ring-primary text-sm font-bold appearance-none outline-none dark:text-white"
                                            value={specialization}
                                            onChange={e => setSpec(e.target.value)}
                                        >
                                            {SPECIALIZATIONS.map(s => <option key={s} className="bg-white dark:bg-surface-dark text-text-light dark:text-white">{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative min-w-[160px] flex-1 lg:flex-initial">
                                        <select
                                            className="w-full bg-white/30 dark:bg-black/40 border-none rounded-2xl py-3 pl-4 pr-10 focus:ring-2 focus:ring-primary text-sm font-bold appearance-none outline-none dark:text-white"
                                            value={rewardRange}
                                            onChange={e => setRewardRange(e.target.value)}
                                        >
                                            {REWARD_RANGES.map(r => <option key={r} className="bg-white dark:bg-surface-dark text-text-light dark:text-white">{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative min-w-[150px] flex-1 lg:flex-initial">
                                        <select
                                            className="w-full bg-white/30 dark:bg-black/40 border-none rounded-2xl py-3 pl-4 pr-10 focus:ring-2 focus:ring-primary text-sm font-bold appearance-none outline-none dark:text-white"
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}
                                        >
                                            {STATUS_FILTERS.map(s => <option key={s} className="bg-white dark:bg-surface-dark text-text-light dark:text-white">{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <BrowseMissions search={search} stateFilter={specialization} rewardFilter={rewardRange} statusFilter={statusFilter} />
                        </>
                    )}

                    {!isConnected && (tab === 'create' || tab === 'manage') ? (
                        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-20 text-center">
                            <Target size={64} className="mx-auto mb-6 text-text-muted-light/20" />
                            <h2 className="text-2xl font-bold mb-3">Restricted Access</h2>
                            <p className="text-text-muted-light/40 dark:text-text-muted-dark/40 max-w-xs mx-auto mb-8 text-sm">
                                Deploy your credentials to access the marketplace and escrow infrastructure.
                            </p>
                            <div className="inline-block"><ConnectButton /></div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-text-muted-light dark:text-text-muted-dark bg-primary/5 p-3 rounded-xl border border-primary/10 w-fit mx-auto">
                                <Search size={14} className="text-primary" />
                                <span>Unsure about the next steps?</span>
                                <Link href="/missions/how-it-works" className="text-primary font-bold hover:underline">
                                    View the 7-Step Workflow Guide
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {tab === 'create' && <CreateMission />}
                            {tab === 'manage' && <ManageMissions address={address!} />}
                        </>
                    )}
                </div>
            </div>
            <section className="px-4 md:px-8 py-20 mt-auto">
                <div className="max-w-7xl mx-auto w-full">
                    <Footer />
                </div>
            </section>
        </main>
    )
}

export default function MissionsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <MissionsContent />
        </Suspense>
    )
}

