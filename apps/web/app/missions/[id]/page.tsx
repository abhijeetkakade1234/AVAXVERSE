'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Zap, Target } from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, encodeFunctionData } from 'viem'
import { useSnackbar } from '@/context/SnackbarContext'
import { translateError } from '@/lib/error-translator'
import { CONTRACT_ADDRESSES, ACTIVE_CHAIN } from '@/lib/config'
import { ESCROW_FACTORY_ABI, ESCROW_ABI, ESCROW_STATES, IDENTITY_REGISTRY_ABI, type EscrowState } from '@/lib/abis'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'
import { type Mission, type MissionApplication } from '../types'
import { useGovernance } from '@/hooks/useGovernance'
import { DisputeModal } from '@/components/DisputeModal'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MISSION_STATUS_LABELS = ['OPEN', 'SELECTED', 'ACCEPTED', 'FUNDED', 'CLOSED', 'CANCELLED'] as const
const FLOW_STEPS = ['Posted', 'Applied', 'Selected', 'Accepted', 'Funded', 'Delivered', 'Closed'] as const

type Profile = {
    did: string
    name: string
    pfp: string
    metadataURI: string
    verificationLevel: bigint
    reputationScore: bigint
    registeredAt: bigint
    exists: boolean
}

export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const missionId = BigInt(id)
    const { address: connectedAddress } = useAccount()

    const [proposalURI, setProposalURI] = useState('')
    const [showSubmitInput, setShowSubmitInput] = useState(false)
    const [workUrl, setWorkUrl] = useState('')
    const [localError, setLocalError] = useState<string | null>(null)
    const [showDisputeModal, setShowDisputeModal] = useState(false)
    const [evidenceUrl, setEvidenceUrl] = useState('') // keeping this only for the CounterEvidence UI which still needs it
    const { propose } = useGovernance()

    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const { data: mission, isLoading: isMissionLoading, refetch: refetchMission } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJob',
        args: [missionId],
    }) as { data: Mission | undefined; isLoading: boolean; refetch: () => void }

    const escrowReady = !!mission?.escrow && mission.escrow !== ZERO_ADDRESS

    const { data: applicants, refetch: refetchApplicants } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getApplicants',
        args: [missionId],
        query: { enabled: !!mission },
    }) as { data: string[] | undefined; refetch: () => void }

    const { data: myApplication, refetch: refetchMyApplication } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getApplication',
        args: connectedAddress ? [missionId, connectedAddress as `0x${string}`] : undefined,
        query: { enabled: !!connectedAddress && !!mission },
    }) as { data: MissionApplication | undefined; refetch: () => void }

    const { data: userRequiredStake } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'requiredStakeFor',
        args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
        query: { enabled: !!connectedAddress },
    }) as { data: bigint | undefined }

    const { data: state, refetch: refetchEscrowState } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getState',
        query: { enabled: escrowReady },
    }) as { data: bigint | undefined; refetch: () => void }

    const { data: deliverableURI, refetch: refetchDeliverable } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'deliverableURI',
        query: { enabled: escrowReady },
    }) as { data: string | undefined; refetch: () => void }

    const { data: disputeReason, refetch: refetchDisputeReason } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'disputeReason',
        query: { enabled: escrowReady },
    }) as { data: string | undefined; refetch: () => void }

    const { data: disputeRaiser } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'disputeRaiser',
        query: { enabled: escrowReady },
    }) as { data: string | undefined }

    const { data: disputedAt } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'disputedAt',
        query: { enabled: escrowReady },
    }) as { data: bigint | undefined }

    const { data: submittedAt } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: '_submittedAt',
        query: { enabled: escrowReady },
    }) as { data: bigint | undefined }

    const { data: disputeEvidenceURI } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'disputeEvidenceURI',
        query: { enabled: escrowReady },
    }) as { data: string | undefined }

    const { data: counterEvidenceURI } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'counterEvidenceURI',
        query: { enabled: escrowReady },
    }) as { data: string | undefined }

    const { data: resolutionReasonHash } = useReadContract({
        address: (mission?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'resolutionReasonHash',
        query: { enabled: escrowReady },
    }) as { data: string | undefined }

    const { showSnackbar } = useSnackbar()

    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const explorerBase = ACTIVE_CHAIN.blockExplorers?.default?.url ?? 'https://testnet.snowtrace.io'

    useEffect(() => {
        if (isSuccess && hash) {
            showSnackbar('Mission update successful!', 'success')
            refetchMission()
            refetchApplicants()
            refetchMyApplication()
            refetchEscrowState()
            refetchDeliverable()
            refetchDisputeReason()
        }
    }, [isSuccess, hash, refetchApplicants, refetchDeliverable, refetchDisputeReason, refetchEscrowState, refetchMission, refetchMyApplication, showSnackbar])

    useEffect(() => {
        if (error) {
            showSnackbar(translateError(error), 'error')
        }
    }, [error, showSnackbar])

    const { data: missionCooldown } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'applicationCooldown',
    }) as { data: bigint | undefined }

    const { data: applicationStakeWei } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'applicationStakeWei',
    }) as { data: bigint | undefined }

    const { data: missionLastApp } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'lastApplicationAt',
        args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
        query: { enabled: !!connectedAddress },
    }) as { data: bigint | undefined }

    if (isMissionLoading) {
        return (
            <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark pt-24">
                <Navbar />
                <div className="flex items-center justify-center p-20 animate-pulse font-bold uppercase tracking-widest text-xs">Synchronizing Intelligence...</div>
            </main>
        )
    }

    if (!mission) {
        return (
            <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark pt-24">
                <Navbar />
                <div className="flex flex-col items-center justify-center p-20 glass-panel max-w-xl mx-auto mt-20 rounded-3xl border border-white/20">
                    <Target size={48} className="text-red-500 mb-6" />
                    <h1 className="text-2xl font-bold mb-2">Mission Not Found</h1>
                    <p className="opacity-60 mb-8">This operation identifier does not exist or has been purged from the registry.</p>
                    <Link href="/missions" className="text-primary font-bold hover:underline">Return to Marketplace</Link>
                </div>
            </main>
        )
    }

    const isClient = connectedAddress?.toLowerCase() === mission.client.toLowerCase()
    const isSelectedOperator = !!mission.freelancer && connectedAddress?.toLowerCase() === mission.freelancer.toLowerCase()
    const isTxBusy = isPending || isConfirming
    const missionStatus = MISSION_STATUS_LABELS[mission.status] ?? 'UNKNOWN'
    const escrowStateIndex = state !== undefined ? Number(state) : undefined
    const escrowStateName: EscrowState = escrowStateIndex !== undefined ? ESCROW_STATES[escrowStateIndex] : 'FUNDED'
    const createdDate = mission.createdAt > 0n ? new Date(Number(mission.createdAt * 1000n)).toLocaleDateString('en-US') : '-'
    const statusLabel = mission.status === 3 && escrowReady ? `FUNDED / ${escrowStateName}` : missionStatus
    const flowStepIndex = (() => {
        if (mission.status === 5) return 0 // cancelled
        if (mission.status === 0) return (applicants?.length ?? 0) > 0 ? 1 : 0
        if (mission.status === 1) return 2
        if (mission.status === 2) return 3
        if (mission.status === 3) {
            if (escrowStateIndex === undefined) return 4
            if (escrowStateIndex >= 4) return 6 // released
            if (escrowStateIndex >= 1) return 5 // submitted or later before release
            return 4
        }
        if (mission.status === 4) return 6 // closed
        return 0
    })()


    const handleApply = (proposal: string, stake: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'applyToJob',
            args: [missionId, proposal],
            value: stake,
        })
    }

    const handleSelectOperator = (operator: string) => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'selectOperator',
            args: [missionId, operator as `0x${string}`],
        })
    }

    const handleAcceptAssignment = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'acceptAssignment',
            args: [missionId],
        })
    }

    const handleFundEscrow = (budget: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'fundEscrow',
            args: [missionId],
            value: budget,
        })
    }


    const handleReopenMission = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'reopenJob',
            args: [missionId],
        })
    }

    const handleTimeoutReopen = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'timeoutReopenAndSlashSelected',
            args: [missionId],
        })
    }

    const handleTimeoutCancelByOperator = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'timeoutCancelByOperator',
            args: [missionId],
        })
    }

    const handleWithdrawApplicationStake = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'withdrawApplicationStake',
            args: [missionId],
        })
    }

    const handleSubmitWork = (uri: string) => {
        writeContract({
            address: mission.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'submitWork',
            args: [uri],
        })
    }

    const handleApproveWork = () => {
        writeContract({
            address: mission.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'approveWork',
        })
    }

    const handleRaiseDisputeWithProposal = async (reason: string, evidence: string) => {
        try {
            // Determine who the caller is to set the intended "winner" for the automated execution if the proposal passes.
            // A dispute raised by the client asks the DAO to vote YES to release funds back to the client.
            // A dispute raised by the operator asks the DAO to vote YES to release funds to the operator.
            const isClientCall = connectedAddress?.toLowerCase() === mission?.client.toLowerCase()
            const expectedWinner = (isClientCall ? mission?.client : mission?.freelancer) as `0x${string}`

            const description = `DISPUTE-${id}: Resolve dispute for Mission #${id}. Reason: ${reason}`
            const reasonHash = ('0x' + Buffer.from(description).toString('hex')) as `0x${string}` // Simplistic hash for execution

            // Encode the execution payload for the Governor to execute on the Escrow contract if the proposal passes
            const calldata = encodeFunctionData({
                abi: ESCROW_ABI,
                functionName: 'resolveDispute',
                args: [expectedWinner, reasonHash]
            })

            // First send to Governance with the execution payload pointing to the Escrow contract
            await propose(description, mission.escrow as `0x${string}`, calldata)

            // Then raise the dispute on the Escrow contract
            await writeContract({
                address: mission.escrow as `0x${string}`,
                abi: ESCROW_ABI,
                functionName: 'raiseDispute',
                args: [reason, evidence],
            })

            showSnackbar('Dispute raised and escalated to DAO Governance successfully!', 'success')
        } catch (error: unknown) {
            console.error('Failed to raise dispute and propose:', error)
            throw new Error(error instanceof Error ? error.message : 'Failed to complete dispute process')
        }
    }

    const handleSubmitCounterEvidence = (evidence: string) => {
        writeContract({
            address: mission.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'submitCounterEvidence',
            args: [evidence],
        })
    }

    const handleAutoApprove = () => {
        writeContract({
            address: mission.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'autoApprove',
        })
    }

    const handleRefund = () => {
        writeContract({
            address: mission.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'refund',
        })
    }

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300">
            <Navbar />

            <div className="pt-32 pb-20">
                <Section>
                    <Link href="/missions?tab=browse" className="inline-flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors mb-8 group text-sm font-bold">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
                    </Link>

                    <div className="space-y-6">
                        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-8">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Mission #{id}</div>
                                    <h1 className="text-3xl md:text-4xl font-black mt-1">{mission.title}</h1>
                                    <div suppressHydrationWarning className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Posted: {createdDate}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Status</div>
                                    <div className="font-bold text-primary">{statusLabel}</div>
                                    <div className="text-2xl font-black mt-2">{formatEther(mission.budget)} AVAX</div>
                                    {escrowReady && (
                                        <a
                                            href={`${explorerBase}/address/${mission.escrow}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                        >
                                            <ExternalLink size={10} /> View Escrow on Snowtrace
                                        </a>
                                    )}
                                    {hash && (
                                        <a
                                            href={`${explorerBase}/tx/${hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-xs text-emerald-500 hover:underline mt-1"
                                        >
                                            <ExternalLink size={10} className="inline mr-1" />Last Tx on Snowtrace
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Confused about the mission flow?</div>
                                        <div className="text-xs text-text-muted-light dark:text-text-muted-dark">View our 7-step guide to understand stakes, timeouts, and disputes.</div>
                                    </div>
                                </div>
                                <Link href="/missions/how-it-works" className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary/90 transition-colors shrink-0 fluid-touch">
                                    Learn More
                                </Link>
                            </div>
                            <div className="mt-6">
                                <div className="md:hidden space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Mission Progress</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{flowStepIndex + 1} / {FLOW_STEPS.length}</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {FLOW_STEPS.map((step, idx) => (
                                            <div
                                                key={step}
                                                className={`h-1.5 rounded-full flex-1 transition-colors duration-500 ${idx <= flowStepIndex ? 'bg-primary' : 'bg-white/10 dark:bg-white/5'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {FLOW_STEPS.map((step, idx) => (
                                            <div key={step} className={`flex items-center gap-2 ${idx > flowStepIndex ? 'opacity-30' : ''}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${idx <= flowStepIndex ? 'bg-primary' : 'bg-gray-500'}`} />
                                                <span className="text-[9px] font-bold uppercase tracking-tight">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark mb-2">
                                        {FLOW_STEPS.map((step, idx) => (
                                            <span key={step} className={idx > flowStepIndex ? 'opacity-40' : ''}>
                                                {step}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        {FLOW_STEPS.map((step, idx) => (
                                            <div
                                                key={step}
                                                className={`h-2 rounded-full flex-1 transition-colors duration-500 ${idx <= flowStepIndex ? 'bg-primary' : 'bg-white/10 dark:bg-white/5'}`}
                                                title={step}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Mission Status Card */}
                        <div className="glass-panel bg-primary/10 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
                            <div className="mt-1 p-2 bg-primary/20 rounded-xl text-primary">
                                <Zap size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold">What&apos;s next?</h3>
                                <div className="text-sm opacity-80 mt-1">
                                    {mission.status === 0 && (
                                        isClient ? "Waiting for operators to apply. Review proposals below when they arrive." : "This mission is open for applications. Submit your proposal to be considered!"
                                    )}
                                    {mission.status === 1 && (
                                        isSelectedOperator ? "You have been selected! Click 'Accept Assignment' below to confirm you're ready to start." : isClient ? "Waiting for the selected operator to accept the assignment." : "An operator has been selected and is reviewing the assignment."
                                    )}
                                    {mission.status === 2 && (
                                        isSelectedOperator ? "Assignment accepted! Please wait while the client funds the escrow to formally start the mission." : isClient ? "Operator has accepted! Now you must fund the escrow budget to secure the work." : "Selection confirmed. Waiting for client funding."
                                    )}
                                    {mission.status === 3 && (
                                        isSelectedOperator ? (
                                            escrowStateIndex === 0 ? "Mission is live! You can now start working and submit your deliverables below." :
                                                escrowStateIndex === 1 ? "Deliverables submitted. Waiting for the client to review and release funds." :
                                                    escrowStateIndex === 3 ? "Dispute active. Please wait for mediator resolution." :
                                                        "Mission active. Follow the escrow state below."
                                        ) : isClient ? (
                                            escrowStateIndex === 0 ? "Escrow funded. The operator is now authorized to work." :
                                                escrowStateIndex === 1 ? "Deliverables submitted! Review the work and approve to release funds." :
                                                    escrowStateIndex === 3 ? "Dispute raised. A mediator will review the evidence." :
                                                        "Escrow active. Monitor progress below."
                                        ) : "Mission in progress."
                                    )}
                                    {mission.status === 4 && "Mission successfully completed and funds released."}
                                    {mission.status === 5 && "This mission has been cancelled."}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PartyProfileCard role="Client" addr={mission.client} />
                            {mission.freelancer !== ZERO_ADDRESS ? (
                                <PartyProfileCard role="Selected Operator" addr={mission.freelancer} />
                            ) : (
                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 text-sm text-text-muted-light dark:text-text-muted-dark">
                                    No operator selected yet.
                                </div>
                            )}
                        </div>

                        {mission.status === 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-4">
                                    <h2 className="text-xl font-bold">Operator Applications</h2>
                                    {applicants && applicants.length > 0 ? (
                                        <div className="space-y-3">
                                            {applicants.map(addr => (
                                                <ApplicantRow
                                                    key={addr}
                                                    missionId={missionId}
                                                    operator={addr}
                                                    canSelect={!!isClient}
                                                    isBusy={isTxBusy}
                                                    onSelect={() => handleSelectOperator(addr)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">No applications yet.</p>
                                    )}
                                </div>

                                {!isClient && connectedAddress && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                        <h2 className="text-xl font-bold">Apply as Operator</h2>
                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                            Application stake: {formatEther(userRequiredStake ?? BigInt(0))} AVAX.
                                            {userRequiredStake !== undefined && (applicationStakeWei ?? BigInt(0)) > userRequiredStake && (
                                                <span className="text-emerald-500 font-bold ml-1"> (Reputation Discount Applied!)</span>
                                            )}
                                        </p>
                                        {myApplication?.exists ? (
                                            mission.status === 0 ? (
                                                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                                        <span className="material-symbols-outlined text-base">lock</span>
                                                        Stake Locked: {formatEther(userRequiredStake ?? BigInt(0))} AVAX
                                                    </div>
                                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                        Your application stake is currently locked in the contract to prevent spam. It will be refunded if you are selected and accept the assignment, or you can withdraw it if the client selects someone else.
                                                    </p>
                                                    <button
                                                        onClick={handleWithdrawApplicationStake}
                                                        disabled={isTxBusy}
                                                        className="py-2 px-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold disabled:opacity-40 hover:bg-red-500/20 transition-colors mt-2 fluid-touch"
                                                    >
                                                        Withdraw Application & Stake
                                                    </button>
                                                </div>
                                            ) : mission.status === 1 ? (
                                                isSelectedOperator ? (
                                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mb-2">
                                                            <span className="material-symbols-outlined text-base">verified</span>
                                                            You are selected!
                                                        </div>
                                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                            Your {formatEther(userRequiredStake ?? BigInt(0))} AVAX stake remains locked until you accept the assignment (which will refund it) or the client reopens the mission.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                            <span className="material-symbols-outlined text-base">info</span>
                                                            Another operator selected
                                                        </div>
                                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                            The client has selected someone else. If they do not quickly accept, the client might reopen the mission. Otherwise, you can withdraw your {formatEther(userRequiredStake ?? BigInt(0))} AVAX stake now.
                                                        </p>
                                                        <button
                                                            onClick={handleWithdrawApplicationStake}
                                                            disabled={isTxBusy}
                                                            className="py-2 px-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold disabled:opacity-40 hover:bg-red-500/20 transition-colors mt-2"
                                                        >
                                                            Withdraw Stake
                                                        </button>
                                                    </div>
                                                )
                                            ) : (mission.status >= 2 && mission.status <= 4) ? (
                                                isSelectedOperator ? (
                                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mb-2">
                                                            <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                                                            Stake Refunded
                                                        </div>
                                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                            Your {formatEther(userRequiredStake ?? BigInt(0))} AVAX initial stake was automatically refunded to your wallet when you accepted the assignment.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                            <span className="material-symbols-outlined text-base">info</span>
                                                            Mission in progress
                                                        </div>
                                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                            This mission is now closed to applicants. You may withdraw your {formatEther(userRequiredStake ?? BigInt(0))} AVAX stake.
                                                        </p>
                                                        <button
                                                            onClick={handleWithdrawApplicationStake}
                                                            disabled={isTxBusy}
                                                            className="py-2 px-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold disabled:opacity-40 hover:bg-red-500/20 transition-colors mt-2"
                                                        >
                                                            Withdraw Stake
                                                        </button>
                                                    </div>
                                                )
                                            ) : mission.status === 5 ? (
                                                <div className="bg-gray-500/10 border border-gray-500/20 p-4 rounded-xl flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                                                        <span className="material-symbols-outlined text-base">cancel</span>
                                                        Mission Cancelled
                                                    </div>
                                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                        This mission was cancelled. Please withdraw your {formatEther(userRequiredStake ?? BigInt(0))} AVAX stake.
                                                    </p>
                                                    <button
                                                        onClick={handleWithdrawApplicationStake}
                                                        disabled={isTxBusy}
                                                        className="py-2 px-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold disabled:opacity-40 hover:bg-red-500/20 transition-colors mt-2"
                                                    >
                                                        Withdraw Stake
                                                    </button>
                                                </div>
                                            ) : null
                                        ) : (
                                            <div className="space-y-4">
                                                <textarea
                                                    className="input-glass w-full resize-none text-sm"
                                                    rows={4}
                                                    placeholder="Proposal link or summary (IPFS/URL/notes)"
                                                    value={proposalURI}
                                                    onChange={e => {
                                                        setProposalURI(e.target.value)
                                                        setLocalError(null)
                                                    }}
                                                />
                                                {(() => {
                                                    const lastApp = missionLastApp ?? 0n
                                                    const cooldown = missionCooldown ?? 0n
                                                    const isLocked = lastApp > 0n && BigInt(currentTime) < lastApp + cooldown
                                                    const remaining = Number(lastApp + cooldown - BigInt(currentTime))

                                                    if (isLocked) {
                                                        const m = Math.floor(remaining / 60)
                                                        const s = remaining % 60
                                                        return (
                                                            <div className="w-full py-4 rounded-xl bg-primary/5 border border-primary/20 text-text-muted-light dark:text-text-muted-dark font-mono text-center text-sm flex items-center justify-center gap-2">
                                                                <span className="animate-pulse">⏳</span> Application Cooldown: {m}:{s.toString().padStart(2, '0')}
                                                            </div>
                                                        )
                                                    }

                                                    return (
                                                        <button
                                                            onClick={() => {
                                                                const proposal = proposalURI.trim()
                                                                if (!proposal) {
                                                                    setLocalError('Proposal is required to apply.')
                                                                    return
                                                                }
                                                                handleApply(proposal, userRequiredStake ?? BigInt(0))
                                                            }}
                                                            disabled={isTxBusy}
                                                            className="w-full py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40 shadow-lg shadow-primary/20 hover:animate-pulse fluid-touch"
                                                        >
                                                            {isTxBusy ? 'Submitting Application...' : 'Submit Application'}
                                                        </button>
                                                    )
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {(mission.status === 1 || mission.status === 2) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {isSelectedOperator && !mission.operatorAccepted && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6">
                                        <h2 className="text-xl font-bold mb-3">Assignment Acceptance</h2>
                                        <button
                                            onClick={handleAcceptAssignment}
                                            disabled={isTxBusy}
                                            className="w-full py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40 fluid-touch"
                                        >
                                            {isTxBusy ? 'Submitting...' : 'Accept Assignment'}
                                        </button>
                                    </div>
                                )}
                                {isSelectedOperator && mission.operatorAccepted && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                        <h2 className="text-xl font-bold">Waiting For Client Funding</h2>
                                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                            If client does not fund within timeout window, you can cancel and claim client commitment.
                                        </p>
                                        <button
                                            onClick={handleTimeoutCancelByOperator}
                                            disabled={isTxBusy}
                                            className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold disabled:opacity-40"
                                        >
                                            Timeout Cancel + Claim Deposit
                                        </button>
                                    </div>
                                )}
                                {isClient && mission.status === 2 && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                        <h2 className="text-xl font-bold">Fund Escrow</h2>
                                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                            {mission.operatorAccepted ? 'Selected operator has accepted. You can fund escrow now.' : 'Waiting for selected operator to accept assignment.'}
                                        </p>
                                        <button
                                            onClick={() => handleFundEscrow(mission.budget)}
                                            disabled={isTxBusy || !mission.operatorAccepted}
                                            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-40 shadow-lg shadow-emerald-500/20 fluid-touch"
                                        >
                                            {isTxBusy ? 'Funding...' : `Fund ${formatEther(mission.budget)} AVAX Escrow`}
                                        </button>
                                        {!mission.operatorAccepted && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={handleReopenMission}
                                                    disabled={isTxBusy}
                                                    className="w-full py-3 rounded-xl border border-white/20 font-bold disabled:opacity-40"
                                                >
                                                    Reopen Now
                                                </button>
                                                <button
                                                    onClick={handleTimeoutReopen}
                                                    disabled={isTxBusy}
                                                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold disabled:opacity-40"
                                                >
                                                    Timeout + Slash
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}


                        {mission.status === 3 && escrowReady && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                    <h2 className="text-xl font-bold">Work Delivery</h2>
                                    {isSelectedOperator && escrowStateIndex === 0 && (
                                        showSubmitInput ? (
                                            <>
                                                <input
                                                    className="input-glass w-full text-sm"
                                                    placeholder="Deliverable URL / IPFS CID / tx hash"
                                                    value={workUrl}
                                                    onChange={e => {
                                                        setWorkUrl(e.target.value)
                                                        setLocalError(null)
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const cleaned = workUrl.trim()
                                                            if (!cleaned) {
                                                                setLocalError('Deliverable cannot be empty.')
                                                                return
                                                            }
                                                            handleSubmitWork(cleaned)
                                                        }}
                                                        disabled={isTxBusy}
                                                        className="flex-1 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40"
                                                    >
                                                        {isTxBusy ? 'Submitting...' : 'Confirm Submit'}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowSubmitInput(false)}
                                                        className="px-4 py-3 rounded-xl border border-white/20"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button onClick={() => setShowSubmitInput(true)} className="w-full py-3 rounded-xl bg-primary text-white font-bold">Submit Work</button>
                                        )
                                    )}

                                    {deliverableURI && deliverableURI.trim() && (
                                        <div className="text-sm">
                                            <div className="font-bold mb-1">Submitted Artifact</div>
                                            <div className="break-all font-mono text-xs bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/10 dark:border-white/10">
                                                {deliverableURI}
                                            </div>
                                            {getDeliverableHref(deliverableURI) && (
                                                <a href={getDeliverableHref(deliverableURI)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-sm font-bold mt-2 hover:underline">
                                                    Open and Verify <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {localError && <p className="text-xs text-red-500 font-bold mt-2">{localError}</p>}
                                </div>

                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                    <h2 className="text-xl font-bold">Resolution</h2>

                                    {isClient && escrowStateIndex === 1 && (
                                        <div className="space-y-2">
                                            <button
                                                onClick={handleApproveWork}
                                                disabled={isTxBusy}
                                                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-40"
                                            >
                                                {isTxBusy ? 'Processing...' : 'Approve & Release Funds'}
                                            </button>
                                            <div className="text-[10px] text-center text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest font-bold">
                                                Protecting Operators: Auto-approves after 7 days
                                            </div>
                                            {submittedAt && submittedAt > BigInt(0) && (
                                                <button
                                                    onClick={handleAutoApprove}
                                                    disabled={isTxBusy || (Date.now() / 1000) < Number(submittedAt) + (7 * 24 * 60 * 60)}
                                                    className="w-full py-2 rounded-xl border border-emerald-500/20 text-emerald-500 text-xs font-bold disabled:opacity-40"
                                                >
                                                    Trigger Auto-Approve (Timeout Policy)
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {(isClient || isSelectedOperator) && escrowStateIndex === 1 && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                If there is an issue with the deliverables, you can raise a dispute to halt the escrow timeline and escalate to arbitration.
                                            </p>
                                            <button
                                                onClick={() => setShowDisputeModal(true)}
                                                className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 transition-colors"
                                            >
                                                Raise Dispute
                                            </button>
                                        </div>
                                    )}

                                    {escrowStateIndex === 3 && (isClient || isSelectedOperator) && (
                                        <div className="space-y-3">
                                            <div className="text-xs text-center text-text-muted-light dark:text-text-muted-dark font-bold uppercase tracking-widest">
                                                Dispute Active - 3 Day Response Window
                                            </div>
                                            {connectedAddress?.toLowerCase() !== disputeRaiser?.toLowerCase() && !counterEvidenceURI && (
                                                <div className="space-y-2">
                                                    <input
                                                        className="input-glass w-full text-sm"
                                                        placeholder="Counter Evidence Link"
                                                        value={evidenceUrl}
                                                        onChange={e => setEvidenceUrl(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={() => handleSubmitCounterEvidence(evidenceUrl.trim())}
                                                        disabled={isTxBusy}
                                                        className="w-full py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40"
                                                    >
                                                        Submit Counter Evidence
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {isClient && escrowStateIndex === 0 && (
                                        <button
                                            onClick={handleRefund}
                                            disabled={isTxBusy}
                                            className="w-full py-3 rounded-xl border border-white/20 font-bold disabled:opacity-40"
                                        >
                                            Request Refund
                                        </button>
                                    )}

                                    {disputeReason && disputeReason.trim() && (
                                        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                                            <div className="font-bold text-red-500">Dispute Investigation</div>
                                            <div className="text-sm">
                                                <span className="text-text-muted-light dark:text-text-muted-dark">Reason:</span> {disputeReason}
                                            </div>
                                            {disputeEvidenceURI && (
                                                <div className="text-sm">
                                                    <span className="text-text-muted-light dark:text-text-muted-dark">Initial Evidence:</span>{' '}
                                                    <a href={getDeliverableHref(disputeEvidenceURI)!} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                                                </div>
                                            )}
                                            {counterEvidenceURI && (
                                                <div className="text-sm">
                                                    <span className="text-text-muted-light dark:text-text-muted-dark">Counter Evidence:</span>{' '}
                                                    <a href={getDeliverableHref(counterEvidenceURI)!} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                                                </div>
                                            )}
                                            {resolutionReasonHash && (
                                                <div className="pt-2 border-t border-white/10 text-sm">
                                                    <div className="font-bold text-emerald-500">Mediator Resolution</div>
                                                    <a href={getDeliverableHref(resolutionReasonHash)!} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Audit Report</a>
                                                </div>
                                            )}
                                            {(!resolutionReasonHash && (isClient || isSelectedOperator)) && (
                                                <div className="pt-2 border-t border-white/10 text-sm space-y-2">
                                                    <div className="font-bold text-amber-500 mb-2">Community Resolution</div>
                                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                        If the mediator is unresponsive, or you want the community to decide, you can escalte this case to the DAO or view active governance cases.
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href="/governance"
                                                            className="flex-1 flex justify-center items-center py-2 rounded-xl border border-white/20 text-white text-xs font-bold hover:bg-white/5 transition-colors text-center bg-white/5"
                                                        >
                                                            Go to Governance Portal
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                                {disputeRaiser && <span>Raised by: {shortAddr(disputeRaiser)}</span>}
                                                {disputedAt && disputedAt > BigInt(0) && <span className="ml-3">At: {new Date(Number(disputedAt) * 1000).toLocaleString('en-US')}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Application stake visibility handled above in "Apply as Operator" section */}
                    </div>
                </Section>
            </div >

            <section className="px-4 md:px-8 py-20">
                <div className="max-w-7xl mx-auto w-full">
                    <Footer />
                </div>
            </section>

            <DisputeModal
                isOpen={showDisputeModal}
                onClose={() => setShowDisputeModal(false)}
                onSubmit={handleRaiseDisputeWithProposal}
                isSubmitting={isTxBusy}
            />
        </main >
    )
}

function ApplicantRow({
    missionId,
    operator,
    canSelect,
    isBusy,
    onSelect,
}: {
    missionId: bigint
    operator: string
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

    const { data: profile } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getProfile',
        args: [operator as `0x${string}`],
    }) as { data: Profile | undefined }

    const { data: userMissions } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJobsByUser',
        args: [operator as `0x${string}`],
    }) as { data: bigint[] | undefined }

    if (application && !application.exists) return null

    return (
        <div className="rounded-xl border border-white/20 dark:border-white/10 p-4 space-y-2 animate-enter">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Link href={`/profile/${operator}`} className="font-bold text-primary hover:underline">
                        {profile?.exists ? profile.name : shortAddr(operator)}
                    </Link>
                    <div className="text-xs text-text-muted-light dark:text-text-muted-dark">{shortAddr(operator)}</div>
                </div>
                <div className="text-right text-xs text-text-muted-light dark:text-text-muted-dark">
                    <div>Rep: {Number(profile?.reputationScore ?? BigInt(0))}</div>
                    <div>Missions: {userMissions?.length ?? 0}</div>
                </div>
            </div>

            {application?.proposalURI && (
                <div className="text-xs break-all bg-black/5 dark:bg-white/5 rounded-lg p-2 border border-black/10 dark:border-white/10">
                    {application.proposalURI}
                </div>
            )}

            {canSelect && (
                <button onClick={onSelect} disabled={isBusy} className="w-full py-2 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-40">
                    {isBusy ? 'Selecting...' : 'Select Operator'}
                </button>
            )}
        </div>
    )
}

function PartyProfileCard({ role, addr }: { role: string; addr: string }) {
    const { data: profile } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getProfile',
        args: [addr as `0x${string}`],
    }) as { data: Profile | undefined }

    const { data: userMissions } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJobsByUser',
        args: [addr as `0x${string}`],
    }) as { data: bigint[] | undefined }

    return (
        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6">
            <div className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">{role}</div>
            <Link href={`/profile/${addr}`} className="text-xl font-bold text-primary hover:underline">
                {profile?.exists ? profile.name : shortAddr(addr)}
            </Link>
            <div className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">{shortAddr(addr)}</div>
            <div className="text-sm mt-3">Reputation: <span className="font-bold">{Number(profile?.reputationScore ?? BigInt(0))}</span></div>
            <div className="text-sm">Past Missions: <span className="font-bold">{userMissions?.length ?? 0}</span></div>
            <Link href={`/profile/${addr}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline mt-2">
                View Profile <ExternalLink size={14} />
            </Link>
        </div>
    )
}

function getDeliverableHref(value: string) {
    const v = value.trim()
    if (!v) return null
    if (/^https?:\/\//i.test(v)) return v
    if (/^ipfs:\/\//i.test(v)) return `https://ipfs.io/ipfs/${v.replace(/^ipfs:\/\//i, '')}`
    if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(v) || /^bafy[a-z0-9]{20,}$/i.test(v)) return `https://ipfs.io/ipfs/${v}`
    if (/^0x([A-Fa-f0-9]{64})$/.test(v)) {
        const explorer = ACTIVE_CHAIN.blockExplorers?.default?.url || 'https://snowtrace.io'
        return `${explorer}/tx/${v}`
    }
    return null
}

function shortAddr(addr: string) {
    if (!addr || addr.length < 12) return addr
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
}
