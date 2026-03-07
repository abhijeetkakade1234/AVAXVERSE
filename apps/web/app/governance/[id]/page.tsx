'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Vote as VoteIcon,
    AlertCircle,
    Clock,
    Users,
    MessageSquare
} from 'lucide-react'
import { usePublicClient } from 'wagmi'
import { formatUnits, keccak256, toHex } from 'viem'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useGovernance } from '@/hooks/useGovernance'
import { useSnackbar } from '@/context/SnackbarContext'
import { translateError } from '@/lib/error-translator'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { AVAX_GOVERNOR_ABI } from '@/lib/abis'

interface ProposalDetail {
    id: string;
    fullId: bigint;
    title: string;
    desc: string;
    type?: 'dispute' | 'protocol';
    status: 'active' | 'defeated' | 'passed' | 'pending';
    votes: { yes: number; no: number; abstain: number };
    targets: `0x${string}`[];
    values: bigint[];
    calldatas: `0x${string}`[];
}

export default function GovernanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const proposalId = BigInt(id)

    const { votingPower, castVote, execute } = useGovernance()
    const [proposal, setProposal] = useState<ProposalDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isActionPending, setIsActionPending] = useState(false)
    const publicClient = usePublicClient()
    const { showSnackbar } = useSnackbar()

    useEffect(() => {
        async function fetchProposal() {
            if (!publicClient) return
            try {
                // Fetch all proposals to find the description (standard way without indexer)
                const logs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESSES.AVAXGovernor,
                    event: {
                        type: 'event',
                        name: 'ProposalCreated',
                        inputs: [
                            { name: 'proposalId', type: 'uint256', indexed: false },
                            { name: 'proposer', type: 'address', indexed: false },
                            { name: 'targets', type: 'address[]', indexed: false },
                            { name: 'values', type: 'uint256[]', indexed: false },
                            { name: 'signatures', type: 'string[]', indexed: false },
                            { name: 'calldatas', type: 'bytes[]', indexed: false },
                            { name: 'voteStart', type: 'uint256', indexed: false },
                            { name: 'voteEnd', type: 'uint256', indexed: false },
                            { name: 'description', type: 'string', indexed: false },
                        ],
                    },
                    fromBlock: 0n,
                })

                const log = logs.find((l) => (l.args as { proposalId?: bigint }).proposalId === proposalId)
                const description = log ? ((log.args as { description?: string }).description || 'Description unavailable') : 'Description unavailable'

                const [againstVotes, forVotes, abstainVotes] = await publicClient.readContract({
                    address: CONTRACT_ADDRESSES.AVAXGovernor,
                    abi: AVAX_GOVERNOR_ABI,
                    functionName: 'proposalVotes',
                    args: [proposalId],
                }) as [bigint, bigint, bigint]

                const state = await publicClient.readContract({
                    address: CONTRACT_ADDRESSES.AVAXGovernor,
                    abi: AVAX_GOVERNOR_ABI,
                    functionName: 'state',
                    args: [proposalId],
                }) as number

                setProposal({
                    id: proposalId.toString().slice(0, 8),
                    fullId: proposalId,
                    title: description.split('.')[0] || 'Untitled Proposal',
                    desc: description,
                    status: (state === 1 ? 'active' : state === 3 ? 'defeated' : state === 4 ? 'passed' : 'pending') as ProposalDetail['status'],
                    type: (description.toLowerCase().includes('dispute') ? 'dispute' : 'protocol') as ProposalDetail['type'],
                    votes: {
                        yes: Number(forVotes) || 0,
                        no: Number(againstVotes) || 0,
                        abstain: Number(abstainVotes) || 0
                    },
                    targets: log ? ((log.args as { targets?: `0x${string}`[] }).targets || []) : [],
                    values: log ? ((log.args as { values?: bigint[] }).values || []) : [],
                    calldatas: log ? ((log.args as { calldatas?: `0x${string}`[] }).calldatas || []) : []
                })
            } catch (error) {
                console.error('Error fetching proposal:', error)
                showSnackbar('Failed to fetch proposal details.', 'error')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProposal()
    }, [publicClient, proposalId, showSnackbar])

    const handleVote = async (support: number) => {
        setIsActionPending(true)
        try {
            await castVote(proposalId, support)
            window.location.reload()
        } catch (error: unknown) {
            console.error('Vote error:', error)
            const translated = translateError(error)
            if (translated.includes('cancelled')) {
                showSnackbar(translated, 'info')
            } else {
                showSnackbar(translated, 'error')
            }
        } finally {
            setIsActionPending(false)
        }
    }

    const handleExecute = async () => {
        if (!proposal || proposal.status !== 'passed') return
        setIsActionPending(true)
        try {
            const descriptionHash = keccak256(toHex(proposal.desc))
            await execute(proposal.targets, proposal.values, proposal.calldatas, descriptionHash)
            window.location.reload()
        } catch (error: unknown) {
            console.error('Execute error:', error)
            const translated = translateError(error)
            if (translated.includes('cancelled')) {
                showSnackbar(translated, 'info')
            } else {
                showSnackbar(translated, 'error')
            }
        } finally {
            setIsActionPending(false)
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background-light dark:bg-background-dark pt-40 flex items-center justify-center">
                <div className="text-text-muted-light dark:text-text-muted-dark font-bold uppercase tracking-widest animate-pulse text-sm">
                    Loading proposal...
                </div>
            </main>
        )
    }

    if (!proposal) {
        return (
            <main className="min-h-screen bg-background-light dark:bg-background-dark pt-40 flex flex-col items-center justify-center gap-4">
                <div className="text-red-500 font-bold">PROPOSAL NOT FOUND</div>
                <Link href="/governance" className="text-primary hover:underline">Return to Governance</Link>
            </main>
        )
    }

    const totalVotes = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain || 1
    const yesPercent = Math.round((proposal.votes.yes / totalVotes) * 100)
    const noPercent = Math.round((proposal.votes.no / totalVotes) * 100)
    const hasPower = votingPower > 0n

    return (
        <div className="bg-[#B4AAFD] bg-gradient-to-b from-[#B4AAFD] via-[#9B8CFA] to-[#1A1A2E] dark:from-[#1A1A2E] dark:to-[#121222] text-gray-900 dark:text-white font-display antialiased min-h-screen flex flex-col relative">
            <Navbar />

            <div className="pt-32 pb-20 relative z-10 w-full flex-grow">
                <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
                    <Link href="/governance" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group text-sm font-bold">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Proposals
                    </Link>

                    <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                        <div className="flex flex-col gap-8 relative z-10">
                            {/* Header Row */}
                            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-white/10 pb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                            <Clock size={12} className="text-primary" /> {proposal.status.toUpperCase()}
                                        </div>
                                        {proposal.type === 'dispute' && (
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-400/20 text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-400/30">
                                                <AlertCircle size={12} /> DISPUTE CASE
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs font-mono text-white/40 tracking-widest mt-2">Proposal ID: {proposal.id}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Your Voting Power</div>
                                    <div className="text-xl font-black text-primary">{parseFloat(formatUnits(votingPower, 18)).toLocaleString()} AVAXV</div>
                                </div>
                            </div>

                            {/* Title & Desc */}
                            <div className="space-y-4">
                                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{proposal.title}</h1>
                                <p className="text-lg text-white/70 leading-relaxed whitespace-pre-wrap">{proposal.desc}</p>
                            </div>

                            {/* Voting Progress */}
                            <div className="bg-black/20 rounded-3xl p-6 md:p-8 space-y-6 border border-white/5">
                                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest">
                                    <div className="text-neon-green">For / {yesPercent}% ({proposal.votes.yes})</div>
                                    <div className="text-red-400">Against / {noPercent}% ({proposal.votes.no})</div>
                                </div>
                                <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden flex p-1 border border-white/10 backdrop-blur-md">
                                    <div className="h-full bg-neon-green rounded-full shadow-[0_0_15px_rgba(0,255,148,0.4)] transition-all duration-1000" style={{ width: `${yesPercent}%` }} />
                                    <div className="h-full bg-red-400 rounded-full shadow-[0_0_15px_rgba(248,113,113,0.4)] transition-all duration-1000" style={{ width: `${noPercent}%` }} />
                                </div>

                                {/* Vote Actions */}
                                {proposal.status === 'active' && (
                                    <div className="pt-4 border-t border-white/5">
                                        {hasPower ? (
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <button
                                                    disabled={isActionPending}
                                                    onClick={() => handleVote(1)}
                                                    className={`flex-1 py-4 rounded-2xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-black uppercase tracking-widest hover:bg-neon-green hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,255,148,0.1)] hover:shadow-[0_0_30px_rgba(0,255,148,0.4)] ${isActionPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {isActionPending ? 'Transacting...' : proposal.type === 'dispute' ? 'Vote Yes (Release Funds to Operator)' : 'Vote For'}
                                                </button>
                                                <button
                                                    disabled={isActionPending}
                                                    onClick={() => handleVote(0)}
                                                    className={`flex-1 py-4 rounded-2xl bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-black uppercase tracking-widest hover:bg-red-400 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(248,113,113,0.1)] hover:shadow-[0_0_30px_rgba(248,113,113,0.4)] ${isActionPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {isActionPending ? 'Transacting...' : proposal.type === 'dispute' ? 'Vote No (Refund Client)' : 'Vote Against'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Insufficient Voting Power to Vote</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Execute Action */}
                                {proposal.status === 'passed' && (
                                    <div className="pt-4 border-t border-white/5">
                                        <button
                                            disabled={isActionPending}
                                            onClick={handleExecute}
                                            className={`w-full py-4 rounded-2xl bg-primary border border-primary/30 text-white text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_rgba(180,170,253,0.3)] hover:shadow-[0_0_30px_rgba(180,170,253,0.5)] ${isActionPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isActionPending ? 'Executing...' : 'Execute Resolution'}
                                        </button>
                                        <div className="text-center mt-3 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                            The community has voted. Anyone can execute this payload.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Background Decor */}
                        <VoteIcon size={300} className="absolute -right-16 -bottom-16 text-white opacity-[0.02] pointer-events-none -rotate-12" />
                    </div>

                    {/* Discussion Thread Placeholder */}
                    <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/20 bg-white/5 dark:bg-white/5 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                            <MessageSquare className="text-primary" size={24} />
                            <h2 className="text-2xl font-black text-white">Community Discussion</h2>
                        </div>

                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                            <Users size={48} className="text-white/20" />
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white/50">Discussion Thread Coming Soon</h3>
                                <p className="text-sm text-white/30 max-w-sm mx-auto">
                                    In a future update, jurors and delegates will be able to discuss evidence, share perspectives, and coordinate voting strategies directly in this space.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <section className="px-4 md:px-8 py-10 mt-auto">
                <div className="max-w-7xl mx-auto w-full">
                    <Footer />
                </div>
            </section>
        </div>
    )
}
