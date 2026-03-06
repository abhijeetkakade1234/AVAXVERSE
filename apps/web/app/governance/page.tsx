'use client'

import {
    Vote as VoteIcon,
    Users,
    Target,
    Clock,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useGovernance } from '@/hooks/useGovernance'
import { formatUnits } from 'viem'
import { usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { AVAX_GOVERNOR_ABI } from '@/lib/abis'
import { useEffect, useState } from 'react'
import { useSnackbar } from '@/context/SnackbarContext'

interface Proposal {
    id: string;
    fullId: bigint;
    title: string;
    desc: string;
    status: 'active' | 'defeated' | 'passed' | 'pending';
    votes: { yes: number; no: number; abstain: number };
}

export default function GovernancePage() {
    const { address, votingPower, isDelegated, selfDelegate, castVote, propose } = useGovernance()
    const [activeTab, setActiveTab] = useState<'active' | 'passed' | 'failed'>('active')
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isActionPending, setIsActionPending] = useState(false)
    const publicClient = usePublicClient()
    const { showSnackbar } = useSnackbar()

    const handlePropose = async () => {
        setIsActionPending(true)
        try {
            const uniqueId = Math.random().toString(36).substring(7).toUpperCase()
            await propose(`AVGP-${uniqueId}: New Community Proposal via UI. This is a modular upgrade proposal.`)
            window.location.reload()
        } catch (error: unknown) {
            console.error('Proposal error:', error)
            const errMsg = error instanceof Error ? error.message : String(error)
            if (errMsg.toLowerCase().includes('user rejected')) {
                showSnackbar('Transaction cancelled by user.', 'info')
            } else if (errMsg.toLowerCase().includes('gas limit')) {
                showSnackbar('Gas estimation failed. Try a slightly different description to ensure a unique proposal hash.', 'error')
            } else {
                showSnackbar('Failed to submit proposal. Please ensure you have enough voting power.', 'error')
            }
        } finally {
            setIsActionPending(false)
        }
    }

    const handleVote = async (proposalId: bigint, support: number) => {
        setIsActionPending(true)
        try {
            await castVote(proposalId, support)
            window.location.reload()
        } catch (error: unknown) {
            console.error('Vote error:', error)
            const errMsg = error instanceof Error ? error.message : String(error)
            if (errMsg.toLowerCase().includes('user rejected')) {
                showSnackbar('Transaction cancelled by user.', 'info')
            } else {
                showSnackbar('Failed to cast vote. ensure you haven\'t already voted.', 'error')
            }
        } finally {
            setIsActionPending(false)
        }
    }

    const handleDelegate = async () => {
        setIsActionPending(true)
        try {
            await selfDelegate()
            window.location.reload()
        } catch (error: unknown) {
            console.error('Delegation error:', error)
            const errMsg = error instanceof Error ? error.message : String(error)
            if (errMsg.toLowerCase().includes('user rejected')) {
                showSnackbar('Transaction cancelled by user.', 'info')
            } else {
                showSnackbar('Delegation failed. Please try again.', 'error')
            }
        } finally {
            setIsActionPending(false)
        }
    }

    useEffect(() => {
        async function fetchProposals() {
            if (!publicClient) return
            try {
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

                const proposalData = await Promise.all(logs.map(async (log) => {
                    const args = log.args as { proposalId: bigint; description: string }
                    const proposalId = args.proposalId

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

                    return {
                        id: proposalId.toString().slice(0, 8),
                        fullId: proposalId,
                        title: args.description.split('.')[0] || 'Untitled Proposal',
                        desc: args.description,
                        status: (state === 1 ? 'active' : state === 3 ? 'defeated' : state === 4 ? 'passed' : 'pending') as Proposal['status'],
                        votes: {
                            yes: Number(forVotes) || 0,
                            no: Number(againstVotes) || 0,
                            abstain: Number(abstainVotes) || 0
                        },
                    }
                }))

                setProposals(proposalData.reverse())
            } catch (error) {
                console.error('Error fetching proposals:', error)
                showSnackbar('Failed to fetch proposals.', 'error')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProposals()
    }, [publicClient, showSnackbar])

    return (
        <div className="bg-[#B4AAFD] bg-gradient-to-b from-[#B4AAFD] via-[#9B8CFA] to-[#1A1A2E] dark:from-[#1A1A2E] dark:to-[#121222] text-gray-900 dark:text-white font-display antialiased min-h-screen flex flex-col relative">
            <Navbar />

            <div className="pt-32 pb-20 relative z-10 w-full">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
                        <div className="lg:w-1/2 space-y-6">
                            <div className="flex items-center gap-2 bg-white/40 dark:bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 w-fit">
                                <Users size={16} className="text-primary dark:text-white" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Democracy Protocol</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                                Community <br /> <span className="gradient-text">Governance.</span>
                            </h1>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 border border-white/20">
                                <p className="text-lg text-white/70 max-w-lg">
                                    Shape the future of AVAXVERSE. Propose changes, vote on upgrades, and allocate ecosystem resources.
                                </p>
                            </div>

                            {!isDelegated && address && (
                                <div className="p-6 rounded-2xl bg-white/20 dark:bg-white/5 border border-white/20 backdrop-blur-md flex items-center justify-between shadow-xl">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white uppercase tracking-wider">Action Required</span>
                                        <span className="text-xs text-white/60">You need to delegate to yourself to vote</span>
                                    </div>
                                    <button
                                        disabled={isActionPending}
                                        onClick={handleDelegate}
                                        className={`btn-primary py-2 px-6 text-xs ${isActionPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isActionPending ? 'Processing...' : 'Delegate Now'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Governance Stats */}
                        <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <GovStat label="Your Voting Power" value={`${parseFloat(formatUnits(votingPower, 18)).toLocaleString()} AVAXV`} icon={<TrendingUp size={20} />} />
                            <GovStat label="Active Proposals" value={proposals.filter(p => p.status === 'active').length.toString()} icon={<Clock size={20} />} />
                            <GovStat label="Total Proposals" value={proposals.length.toString()} icon={<Users size={20} />} />
                            <GovStat label="Quorum Threshold" value="4%" icon={<Target size={20} />} />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                        <div className="flex p-1.5 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl w-full md:w-auto">
                            <TabBtn active={activeTab === 'active'} onClick={() => setActiveTab('active')} label="Active" count={proposals.filter(p => p.status === 'active').length} />
                            <TabBtn active={activeTab === 'passed'} onClick={() => setActiveTab('passed')} label="Passed" count={proposals.filter(p => p.status === 'passed').length} />
                            <TabBtn active={activeTab === 'failed'} onClick={() => setActiveTab('failed')} label="Failed" count={proposals.filter(p => p.status === 'defeated').length} />
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                disabled={isActionPending}
                                onClick={handlePropose}
                                className={`btn-primary py-3 px-8 text-sm shadow-lg shadow-primary/20 ${isActionPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isActionPending ? 'Transaction Pending...' : 'New Proposal'}
                            </button>
                        </div>
                    </div>

                    {/* Proposals List */}
                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="glass-panel p-20 rounded-3xl text-center text-white/50 border border-white/10">Loading proposals...</div>
                        ) : proposals.length === 0 ? (
                            <div className="glass-panel p-20 rounded-3xl text-center text-white/50 border border-white/10">No proposals found</div>
                        ) : (
                            proposals
                                .filter(p => {
                                    if (activeTab === 'active') return p.status === 'active' || p.status === 'pending'
                                    if (activeTab === 'passed') return p.status === 'passed'
                                    if (activeTab === 'failed') return p.status === 'defeated'
                                    return true
                                })
                                .map((p, idx) => (
                                    <ProposalCard
                                        key={idx}
                                        id={p.id}
                                        title={p.title}
                                        desc={p.desc}
                                        status={p.status}
                                        votes={p.votes}
                                        onVote={(support) => handleVote(p.fullId, support)}
                                        hasPower={votingPower > 0n}
                                        isPending={isActionPending}
                                    />
                                ))
                        )}
                    </div>
                </div>
            </div>

            <section className="px-4 md:px-8 py-20 mt-auto">
                <div className="max-w-7xl mx-auto w-full">
                    <Footer />
                </div>
            </section>
        </div>
    )
}

function GovStat({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="glass-panel p-8 rounded-3xl border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 dark:bg-primary/20 text-white">
                    {icon}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</span>
            </div>
            <div className="text-4xl font-bold tracking-tight text-white">{value}</div>
        </div>
    )
}

function TabBtn({ active, label, count, onClick }: { active: boolean, label: string, count: number, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${active
                ? 'bg-white/30 dark:bg-white/20 text-white shadow-lg'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
        >
            {label} <span className={`text-[10px] px-2 py-0.5 rounded-md ${active ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30'}`}>{count}</span>
        </button>
    )
}

function ProposalCard({
    id,
    title,
    desc,
    status,
    votes,
    onVote,
    hasPower,
    isPending
}: {
    id: string,
    title: string,
    desc: string,
    status: string,
    votes: { yes: number, no: number, abstain: number },
    onVote: (support: number) => void,
    hasPower: boolean,
    isPending: boolean
}) {
    const totalVotes = votes.yes + votes.no + votes.abstain || 1
    const yesPercent = Math.round((votes.yes / totalVotes) * 100)
    const noPercent = Math.round((votes.no / totalVotes) * 100)

    return (
        <div className="glass-panel p-10 rounded-[2.5rem] border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl mission-card-hover group relative overflow-hidden transition-all duration-500">
            <div className="flex flex-col lg:flex-row gap-10 items-start relative z-10">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-white/30 tracking-widest">{id}</span>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                            <Clock size={12} className="text-primary" /> {status.toUpperCase()}
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white group-hover:text-primary transition-colors duration-300 leading-tight">{title}</h3>
                    <p className="text-base text-white/50 leading-relaxed max-w-3xl line-clamp-2">{desc}</p>
                </div>

                <div className="w-full lg:w-80 space-y-8 shrink-0">
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-white/40">
                                <span className="text-neon-green">For / {yesPercent}%</span>
                                <span className="text-red-400">Against / {noPercent}%</span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex p-0.5 border border-white/5 backdrop-blur-sm">
                                <div className="h-full bg-neon-green rounded-full shadow-[0_0_10px_rgba(0,255,148,0.3)] transition-all duration-1000" style={{ width: `${yesPercent}%` }} />
                                <div className="h-full bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.3)] transition-all duration-1000" style={{ width: `${noPercent}%` }} />
                            </div>
                        </div>
                    </div>

                    {status === 'active' && (
                        <div className="space-y-3">
                            {hasPower ? (
                                <div className="flex gap-3">
                                    <button
                                        disabled={isPending || !hasPower}
                                        onClick={() => onVote(1)}
                                        className={`flex-1 py-3.5 rounded-2xl bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-black uppercase tracking-widest hover:bg-neon-green hover:text-black transition-all duration-300 shadow-lg shadow-neon-green/5 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isPending ? '...' : 'Vote Yes'}
                                    </button>
                                    <button
                                        disabled={isPending || !hasPower}
                                        onClick={() => onVote(0)}
                                        className={`flex-1 py-3.5 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-400 hover:text-white transition-all duration-300 shadow-lg shadow-red-400/5 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isPending ? '...' : 'Vote No'}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Insufficient Power to Vote</span>
                                </div>
                            )}
                        </div>
                    )}

                    <button className="btn-secondary w-full py-3 text-xs justify-center opacity-40 hover:opacity-100 transition-opacity">
                        Operational Details <ArrowUpRight size={16} className="ml-2" />
                    </button>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12">
                <VoteIcon size={240} className="text-white" />
            </div>
        </div>
    )
}
