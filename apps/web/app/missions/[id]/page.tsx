'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap, Target } from 'lucide-react'
import { useAccount, usePublicClient, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseAbiItem } from 'viem'
import type { AbiEvent } from 'viem'
import { useSnackbar } from '@/context/SnackbarContext'
import { isUserRejection, translateError } from '@/lib/error-translator'
import { CONTRACT_ADDRESSES, ACTIVE_CHAIN, FEATURES } from '@/lib/config'
import { ESCROW_FACTORY_ABI, ESCROW_ABI, ESCROW_STATES, IDENTITY_REGISTRY_ABI, type EscrowState } from '@/lib/abis'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'
import { type Mission, type MissionApplication } from '../types'
import { DisputeModal } from '@/components/DisputeModal'
import { MissionHeader } from '@/components/missions/MissionHeader'
import { MissionStatusWidget } from '@/components/missions/MissionStatusWidget'
import { PartyProfileCard } from '@/components/missions/PartyProfileCard'
import { OperatorApplicationsPanel } from '@/components/missions/OperatorApplicationsPanel'
import { getDeliverableHref, shortAddr } from '../utils'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MISSION_STATUS_LABELS = ['OPEN', 'SELECTED', 'ACCEPTED', 'FUNDED', 'CLOSED', 'CANCELLED'] as const
const FLOW_STEPS = ['Posted', 'Applied', 'Selected', 'Accepted', 'Funded', 'Delivered', 'Closed'] as const
const EVENT_LOOKBACK_BLOCKS = 20000n
const MAX_LOG_BLOCK_SPAN = 2000n

function formatDuration(seconds: number): string {
    const clamped = Math.max(0, seconds)
    const minutes = Math.floor(clamped / 60)
    const remSeconds = clamped % 60
    if (minutes > 0) return `${minutes}m ${remSeconds}s`
    return `${remSeconds}s`
}

async function getLogsChunked({
    publicClient,
    address,
    event,
    args,
    fromBlock,
    toBlock,
}: {
    publicClient: ReturnType<typeof usePublicClient>
    address: `0x${string}`
    event: AbiEvent
    args?: Record<string, unknown>
    fromBlock: bigint
    toBlock: bigint
}) {
    if (!publicClient) return []
    const allLogs: Array<{ args: Record<string, unknown>; blockNumber?: bigint }> = []
    let cursor = fromBlock
    while (cursor <= toBlock) {
        const end = cursor + MAX_LOG_BLOCK_SPAN > toBlock ? toBlock : cursor + MAX_LOG_BLOCK_SPAN
        const logs = await publicClient.getLogs({
            address,
            event,
            args,
            fromBlock: cursor,
            toBlock: end,
        })
        allLogs.push(...(logs as Array<{ args: Record<string, unknown>; blockNumber?: bigint }>))
        cursor = end + 1n
    }
    return allLogs
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
    const [evidenceUrl, setEvidenceUrl] = useState('')
    const disputesEnabled = FEATURES.disputes
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))
    const [lastAttemptTime, setLastAttemptTime] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000)
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

    const publicClient = usePublicClient()
    const [withdrawnOperators, setWithdrawnOperators] = useState<string[]>([])

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

    const { data: missionCooldown } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'applicationCooldownSec',
    }) as { data: bigint | undefined }
    const { data: selectionTimeoutSec } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'selectionTimeoutSec',
    }) as { data: bigint | undefined }
    const { data: fundingTimeoutSec } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'fundingTimeoutSec',
    }) as { data: bigint | undefined }
    const { data: escrowReviewTimeoutSec } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'escrowReviewTimeoutSec',
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

    const { data: requiredDisputeFee } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getDisputeFee',
        args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
        query: { enabled: !!connectedAddress },
    }) as { data: bigint | undefined }
    const { data: userBaseRole } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getBaseRole',
        args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
        query: { enabled: !!connectedAddress },
    }) as { data: bigint | number | undefined }
    const normalizedBaseRole = typeof userBaseRole === 'bigint'
        ? Number(userBaseRole)
        : userBaseRole

    const { showSnackbar } = useSnackbar()
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
    const explorerBase = ACTIVE_CHAIN.blockExplorers?.default?.url ?? 'https://testnet.snowtrace.io'
    const [selectedAtTimestamp, setSelectedAtTimestamp] = useState<number | null>(null)
    const [acceptedAtTimestamp, setAcceptedAtTimestamp] = useState<number | null>(null)

    useEffect(() => {
        let cancelled = false
        const fetchWithdrawnOperators = async () => {
            if (!publicClient) return
            try {
                const latestBlock = await publicClient.getBlockNumber()
                const fromBlock = latestBlock > EVENT_LOOKBACK_BLOCKS ? latestBlock - EVENT_LOOKBACK_BLOCKS : 0n
                const logs = await getLogsChunked({
                    publicClient,
                    address: CONTRACT_ADDRESSES.EscrowFactory,
                    event: parseAbiItem('event ApplicationStakeWithdrawn(uint256 indexed jobId, address indexed operator, uint256 amount)') as AbiEvent,
                    args: { jobId: missionId },
                    fromBlock,
                    toBlock: latestBlock,
                })
                if (cancelled) return
                const uniqueWithdrawn = new Set<string>()
                for (const log of logs) {
                    const operator = (log.args?.operator as string | undefined)?.toLowerCase()
                    const amount = log.args?.amount as bigint | undefined
                    if (operator && amount !== undefined && amount > 0n) {
                        uniqueWithdrawn.add(operator)
                    }
                }
                setWithdrawnOperators(Array.from(uniqueWithdrawn))
            } catch (error) {
                if (!cancelled) {
                    console.warn('Failed to fetch withdraw logs for mission filtering:', error)
                }
            }
        }

        fetchWithdrawnOperators()
        return () => {
            cancelled = true
        }
    }, [publicClient, missionId, hash, isSuccess, applicants?.length])

    useEffect(() => {
        let cancelled = false
        const fetchStageTimestamps = async () => {
            if (!publicClient) return
            try {
                const latestBlock = await publicClient.getBlockNumber()
                const fromBlock = latestBlock > EVENT_LOOKBACK_BLOCKS ? latestBlock - EVENT_LOOKBACK_BLOCKS : 0n
                const [selectedLogs, acceptedLogs] = await Promise.all([
                    getLogsChunked({
                        publicClient,
                        address: CONTRACT_ADDRESSES.EscrowFactory,
                        event: parseAbiItem('event OperatorSelected(uint256 indexed jobId, address indexed operator)') as AbiEvent,
                        args: { jobId: missionId },
                        fromBlock,
                        toBlock: latestBlock,
                    }),
                    getLogsChunked({
                        publicClient,
                        address: CONTRACT_ADDRESSES.EscrowFactory,
                        event: parseAbiItem('event AssignmentAccepted(uint256 indexed jobId, address indexed operator)') as AbiEvent,
                        args: { jobId: missionId },
                        fromBlock,
                        toBlock: latestBlock,
                    }),
                ])

                const latestSelected = selectedLogs[selectedLogs.length - 1]
                const latestAccepted = acceptedLogs[acceptedLogs.length - 1]
                const blocks = await Promise.all([
                    latestSelected?.blockNumber !== undefined
                        ? publicClient.getBlock({ blockNumber: latestSelected.blockNumber })
                        : null,
                    latestAccepted?.blockNumber !== undefined
                        ? publicClient.getBlock({ blockNumber: latestAccepted.blockNumber })
                        : null,
                ])

                if (cancelled) return
                setSelectedAtTimestamp(blocks[0] ? Number(blocks[0].timestamp) : null)
                setAcceptedAtTimestamp(blocks[1] ? Number(blocks[1].timestamp) : null)
            } catch {
                if (!cancelled) {
                    setSelectedAtTimestamp(null)
                    setAcceptedAtTimestamp(null)
                }
            }
        }

        fetchStageTimestamps()
        return () => {
            cancelled = true
        }
    }, [publicClient, missionId, hash, isSuccess])

    useEffect(() => {
        if (isSuccess && hash) {
            showSnackbar('Mission update successful!', 'success')
            refetchMission(); refetchApplicants(); refetchMyApplication()
            refetchEscrowState(); refetchDeliverable(); refetchDisputeReason()
        }
    }, [isSuccess, hash, refetchApplicants, refetchDeliverable, refetchDisputeReason, refetchEscrowState, refetchMission, refetchMyApplication, showSnackbar])

    useEffect(() => {
        if (error) {
            const translated = translateError(error)
            showSnackbar(translated, isUserRejection(error) ? 'info' : 'error')
        }
    }, [error, showSnackbar])

    if (isMissionLoading) {
        return (
            <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark pt-24">
                <Navbar />
                <div className="flex items-center justify-center p-20 animate-pulse font-bold uppercase tracking-widest text-xs">
                    Synchronizing Intelligence...
                </div>
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

    // ── Derived state ──────────────────────────────────────────────────────
    const isClient = connectedAddress?.toLowerCase() === mission.client.toLowerCase()
    const isSelectedOperator = !!mission.freelancer && connectedAddress?.toLowerCase() === mission.freelancer.toLowerCase()
    const isTxBusy = isPending || isConfirming
    const missionStatus = MISSION_STATUS_LABELS[mission.status] ?? 'UNKNOWN'
    const escrowStateIndex = state !== undefined ? Number(state) : undefined
    const escrowStateName: EscrowState = escrowStateIndex !== undefined ? ESCROW_STATES[escrowStateIndex] : 'FUNDED'
    const statusLabel = mission.status === 3 && escrowReady ? `FUNDED / ${escrowStateName}` : missionStatus
    const withdrawnOperatorSet = new Set(withdrawnOperators)
    const hasWithdrawnMyApplication = connectedAddress
        ? withdrawnOperatorSet.has(connectedAddress.toLowerCase())
        : false
    const hasLockedApplicationStake = Boolean(myApplication?.exists) && !hasWithdrawnMyApplication
    const activeApplicants = (applicants ?? []).filter((operator) => !withdrawnOperatorSet.has(operator.toLowerCase()))
    const selectionTimeoutSeconds = Number(selectionTimeoutSec ?? 0n)
    const fundingTimeoutSeconds = Number(fundingTimeoutSec ?? 0n)
    const reviewTimeoutSeconds = Number(escrowReviewTimeoutSec ?? 1800n)
    const selectionTimeoutReadyAt = selectedAtTimestamp !== null && selectionTimeoutSeconds > 0
        ? selectedAtTimestamp + selectionTimeoutSeconds
        : null
    const fundingTimeoutReadyAt = acceptedAtTimestamp !== null && fundingTimeoutSeconds > 0
        ? acceptedAtTimestamp + fundingTimeoutSeconds
        : null
    const selectionTimeoutRemaining = selectionTimeoutReadyAt !== null
        ? Math.max(0, selectionTimeoutReadyAt - currentTime)
        : null
    const fundingTimeoutRemaining = fundingTimeoutReadyAt !== null
        ? Math.max(0, fundingTimeoutReadyAt - currentTime)
        : null
    const canTriggerSelectionTimeout = selectionTimeoutRemaining === 0
    const canTriggerFundingTimeout = fundingTimeoutRemaining === 0
    const autoApproveReadyAt = submittedAt && submittedAt > 0n
        ? Number(submittedAt) + reviewTimeoutSeconds
        : null
    const autoApproveRemaining = autoApproveReadyAt !== null
        ? Math.max(0, autoApproveReadyAt - currentTime)
        : null
    const notifyLocalError = (message: string) => {
        setLocalError(message)
        showSnackbar(message, 'error')
    }

    const flowStepIndex = (() => {
        if (mission.status === 5) return 0
        if (mission.status === 0) return activeApplicants.length > 0 ? 1 : 0
        if (mission.status === 1) return 2
        if (mission.status === 2) return 3
        if (mission.status === 3) {
            if (escrowStateIndex === undefined) return 4
            if (escrowStateIndex >= 4) return 6
            if (escrowStateIndex >= 1) return 5
            return 4
        }
        if (mission.status === 4) return 6
        return 0
    })()

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleApply = (proposal: string, stake: bigint) => {
        setLastAttemptTime(Math.floor(Date.now() / 1000))
        writeContract({ address: CONTRACT_ADDRESSES.EscrowFactory, abi: ESCROW_FACTORY_ABI, functionName: 'applyToJob', args: [missionId, proposal], value: stake })
    }

    const handleSelectOperator = (operator: string) => {
        if (withdrawnOperatorSet.has(operator.toLowerCase())) {
            showSnackbar('This operator already withdrew application stake and is no longer selectable.', 'info')
            return
        }
        writeContract({ address: CONTRACT_ADDRESSES.EscrowFactory, abi: ESCROW_FACTORY_ABI, functionName: 'selectOperator', args: [missionId, operator as `0x${string}`] })
    }

    const handleAcceptAssignment = () =>
        writeContract({ address: CONTRACT_ADDRESSES.EscrowFactory, abi: ESCROW_FACTORY_ABI, functionName: 'acceptAssignment', args: [missionId] })

    const handleFundEscrow = (budget: bigint) =>
        writeContract({ address: CONTRACT_ADDRESSES.EscrowFactory, abi: ESCROW_FACTORY_ABI, functionName: 'fundEscrow', args: [missionId], value: budget })

    const handleReopenMission = () =>
        writeContract({ address: CONTRACT_ADDRESSES.EscrowFactory, abi: ESCROW_FACTORY_ABI, functionName: 'reopenJob', args: [missionId] })

    const handleTimeoutReopen = () =>
        writeContract({ address: CONTRACT_ADDRESSES.EscrowFactory, abi: ESCROW_FACTORY_ABI, functionName: 'timeoutReopenAndSlashSelected', args: [missionId], gas: 600000n })

    const handleTimeoutCancelByOperator = () =>
        writeContract({ address: CONTRACT_ADDRESSES.EscrowFactory, abi: ESCROW_FACTORY_ABI, functionName: 'timeoutCancelByOperator', args: [missionId], gas: 600000n })

    const handleWithdrawApplicationStake = () => {
        if (!hasLockedApplicationStake) {
            showSnackbar('Application stake already withdrawn for this mission.', 'info')
            return
        }
        writeContract({ address: CONTRACT_ADDRESSES.EscrowFactory, abi: ESCROW_FACTORY_ABI, functionName: 'withdrawApplicationStake', args: [missionId] })
    }

    const handleSubmitWork = (uri: string) =>
        writeContract({ address: mission.escrow as `0x${string}`, abi: ESCROW_ABI, functionName: 'submitWork', args: [uri] })

    const handleApproveWork = () =>
        writeContract({ address: mission.escrow as `0x${string}`, abi: ESCROW_ABI, functionName: 'approveWork' })

    const handleRaiseDisputeWithProposal = async (reason: string, evidence: string) => {
        try {
            if (!disputesEnabled) {
                throw new Error('Disputes are disabled in current MVP mode.')
            }
            if (requiredDisputeFee === undefined) {
                throw new Error('Dispute fee is still loading. Please wait and retry.')
            }
            await writeContract({
                address: mission.escrow as `0x${string}`,
                abi: ESCROW_ABI,
                functionName: 'raiseDispute',
                args: [reason, evidence],
                value: requiredDisputeFee ?? 0n
            })
            showSnackbar('Dispute submitted successfully. Mediator review is now active.', 'success')
        } catch (error: unknown) {
            throw new Error(translateError(error))
        }
    }

    const handleSubmitCounterEvidence = (evidence: string) =>
        writeContract({ address: mission.escrow as `0x${string}`, abi: ESCROW_ABI, functionName: 'submitCounterEvidence', args: [evidence] })

    const handleAutoApprove = () =>
        writeContract({ address: mission.escrow as `0x${string}`, abi: ESCROW_ABI, functionName: 'autoApprove' })

    const handleRefund = () =>
        writeContract({ address: mission.escrow as `0x${string}`, abi: ESCROW_ABI, functionName: 'refund' })

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300">
            <Navbar />
            <div className="pt-32 pb-20">
                <Section>
                    <Link
                        href="/missions?tab=browse"
                        className="inline-flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors mb-8 group text-sm font-bold"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Marketplace
                    </Link>

                    <div className="space-y-6">
                        {/* ① Header + progress */}
                        <MissionHeader
                            id={id}
                            mission={mission}
                            statusLabel={statusLabel}
                            flowStepIndex={flowStepIndex}
                            explorerBase={explorerBase}
                            hash={hash}
                        />

                        {/* Description / Metadata URI */}
                        {mission.metadataURI && (
                            <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">description</span>
                                    Objective Description
                                </h2>
                                <div className="text-sm text-text-muted-light dark:text-text-muted-dark whitespace-pre-wrap break-words leading-relaxed">
                                    {getDeliverableHref(mission.metadataURI) ? (
                                        <a href={getDeliverableHref(mission.metadataURI)!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all">
                                            {mission.metadataURI}
                                        </a>
                                    ) : (
                                        <span>{mission.metadataURI}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ② How-it-works hint */}
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Zap size={20} /></div>
                                <div>
                                    <div className="text-sm font-bold">Confused about the mission flow?</div>
                                    <div className="text-xs text-text-muted-light dark:text-text-muted-dark">View our 7-step guide to understand stakes, timeouts, and disputes.</div>
                                </div>
                            </div>
                            <Link href="/missions/how-it-works" className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary/90 transition-colors shrink-0 fluid-touch">
                                Learn More
                            </Link>
                        </div>

                        {/* ③ What's next */}
                        <MissionStatusWidget
                            missionStatus={mission.status}
                            isClient={isClient}
                            isSelectedOperator={isSelectedOperator}
                            escrowStateIndex={escrowStateIndex}
                        />

                        {/* ④ Party cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PartyProfileCard role="Client" addr={mission.client} />
                            {mission.freelancer !== ZERO_ADDRESS ? (
                                <PartyProfileCard role="Selected Operator" addr={mission.freelancer} />
                            ) : (
                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 text-sm text-text-muted-light dark:text-text-muted-dark flex items-center justify-center">
                                    No operator selected yet.
                                </div>
                            )}
                        </div>

                        {/* ⑤ Open mission: Applications panel + Apply form */}
                        {mission.status === 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                <OperatorApplicationsPanel
                                    missionId={missionId}
                                    applicants={activeApplicants}
                                    canSelect={!!isClient}
                                    isBusy={isTxBusy}
                                    onSelect={handleSelectOperator}
                                />

                                {!isClient && connectedAddress && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                        <h2 className="text-xl font-bold">Apply as Operator</h2>
                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                            Application stake: {formatEther(userRequiredStake ?? 0n)} AVAX.
                                            {userRequiredStake !== undefined && (applicationStakeWei ?? 0n) > userRequiredStake && (
                                                <span className="text-emerald-500 font-bold ml-1">(Reputation Discount Applied!)</span>
                                            )}
                                        </p>
                                        {myApplication?.exists ? (
                                            // ── Applied states ─────────────────────────────────
                                            mission.status === 0 ? (
                                                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col gap-3">
                                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs">
                                                        <div className="text-amber-500 font-bold">You already applied to this mission</div>
                                                        <div className="text-text-muted-light dark:text-text-muted-dark mt-1">
                                                            One application per operator is allowed in MVP fast mode.
                                                        </div>
                                                    </div>
                                                    {hasLockedApplicationStake ? (
                                                        <>
                                                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                                                <span className="material-symbols-outlined text-base">lock</span>
                                                                Application stake is currently locked
                                                            </div>
                                                            <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                                Your stake is locked to prevent spam. It will be refunded if selected and you accept, or you can withdraw it otherwise.
                                                            </p>
                                                            <button onClick={handleWithdrawApplicationStake} disabled={isTxBusy} className="py-2 px-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold disabled:opacity-40 hover:bg-red-500/20 transition-colors mt-2 fluid-touch">
                                                                Withdraw Application & Stake
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs">
                                                            <div className="text-emerald-500 font-bold">Application withdrawn</div>
                                                            <div className="text-text-muted-light dark:text-text-muted-dark mt-1">
                                                                Stake is already withdrawn. You cannot re-apply to this mission in MVP mode.
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null
                                        ) : (
                                            // ── Not yet applied ─────────────────────────────────
                                            <div className="space-y-4">
                                                {normalizedBaseRole === 0 && (
                                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs">
                                                        <div className="text-amber-500 font-bold">Base role required</div>
                                                        <div className="text-text-muted-light dark:text-text-muted-dark mt-1">
                                                            Set your base role to OPERATOR in profile settings before applying.
                                                        </div>
                                                    </div>
                                                )}
                                                {normalizedBaseRole !== undefined && normalizedBaseRole !== 0 && normalizedBaseRole !== 2 && (
                                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs">
                                                        <div className="text-amber-500 font-bold">Role mismatch</div>
                                                        <div className="text-text-muted-light dark:text-text-muted-dark mt-1">
                                                            Your base role is not OPERATOR. Only OPERATOR role can apply to missions.
                                                        </div>
                                                    </div>
                                                )}
                                                <textarea
                                                    className="input-glass w-full resize-none text-sm"
                                                    rows={4}
                                                    placeholder="Proposal link or summary (IPFS/URL/notes)"
                                                    value={proposalURI}
                                                    onChange={e => { setProposalURI(e.target.value); setLocalError(null) }}
                                                />
                                                {(() => {
                                                    const lastApp = missionLastApp ?? 0n
                                                    const cooldown = missionCooldown ?? 0n
                                                    const isLocked = lastApp > 0n && BigInt(currentTime) < lastApp + cooldown
                                                    const lastAttempt = lastAttemptTime ?? 0
                                                    const localCooldown = 5
                                                    const isLocalLocked = lastAttempt > 0 && currentTime < lastAttempt + localCooldown

                                                    if (isLocked || isLocalLocked) {
                                                        const remaining = isLocked 
                                                            ? Number(lastApp + cooldown - BigInt(currentTime))
                                                            : Number(lastAttempt + localCooldown - currentTime)
                                                        
                                                        const m = Math.floor(remaining / 60), s = remaining % 60
                                                        return (
                                                            <div className="w-full py-4 rounded-xl bg-primary/5 border border-primary/20 text-text-muted-light dark:text-text-muted-dark font-mono text-center text-sm flex items-center justify-center gap-2">
                                                                <span className="material-symbols-outlined text-base">hourglass_top</span> Application cooldown active: {m}:{s.toString().padStart(2, '0')}
                                                            </div>
                                                        )
                                                    }
                                                    return (
                                                        <button
                                                            onClick={() => {
                                                                const p = proposalURI.trim()
                                                                if (!p) { notifyLocalError('Proposal is required to apply.'); return }
                                                                if (normalizedBaseRole === undefined) { notifyLocalError('Role is still loading. Please wait a second and retry.'); return }
                                                                if (normalizedBaseRole === 0) { notifyLocalError('Set your base role to OPERATOR in profile settings before applying.'); return }
                                                                if (normalizedBaseRole !== 2) { notifyLocalError('Only OPERATOR role can apply to missions.'); return }
                                                                if (userRequiredStake === undefined) { notifyLocalError('Still calculating required stake. Please wait.'); return }
                                                                handleApply(p, userRequiredStake)
                                                            }}
                                                            disabled={isTxBusy || userRequiredStake === undefined || normalizedBaseRole === undefined || normalizedBaseRole === 0 || normalizedBaseRole !== 2}
                                                            className="w-full py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40 shadow-lg shadow-primary/20 hover:animate-pulse fluid-touch"
                                                        >
                                                            {isTxBusy ? 'Submitting Application...' : 'Submit Application'}
                                                        </button>
                                                    )
                                                })()}
                                                {localError && <p className="text-xs text-red-500 font-bold">{localError}</p>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ⑥ Selected / Accepted stage actions */}
                        {(mission.status === 1 || mission.status === 2) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {isSelectedOperator && !mission.operatorAccepted && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6">
                                        <h2 className="text-xl font-bold mb-3">Assignment Acceptance</h2>
                                        <button onClick={handleAcceptAssignment} disabled={isTxBusy} className="w-full py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40 fluid-touch">
                                            {isTxBusy ? 'Submitting...' : 'Accept Assignment'}
                                        </button>
                                    </div>
                                )}
                                {isClient && mission.status === 1 && !mission.operatorAccepted && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                        <h2 className="text-xl font-bold">Selected Operator Pending Acceptance</h2>
                                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                            You can reopen immediately, or timeout and slash once the window ends.
                                        </p>
                                        {selectionTimeoutRemaining !== null && selectionTimeoutRemaining > 0 && (
                                            <div className="text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 p-2">
                                                Timeout unlocks in {formatDuration(selectionTimeoutRemaining)}.
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={handleReopenMission} disabled={isTxBusy} className="w-full py-3 rounded-xl border border-white/20 font-bold disabled:opacity-40">Reopen Now</button>
                                            <button
                                                onClick={handleTimeoutReopen}
                                                disabled={isTxBusy || !canTriggerSelectionTimeout}
                                                className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold disabled:opacity-40"
                                            >
                                                Timeout + Slash
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {isSelectedOperator && mission.operatorAccepted && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                        <h2 className="text-xl font-bold">Waiting For Client Funding</h2>
                                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">If client does not fund within timeout, you can cancel and claim their commitment.</p>
                                        {fundingTimeoutRemaining !== null && fundingTimeoutRemaining > 0 && (
                                            <div className="text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 p-2">
                                                Timeout unlocks in {formatDuration(fundingTimeoutRemaining)}.
                                            </div>
                                        )}
                                        <button
                                            onClick={handleTimeoutCancelByOperator}
                                            disabled={isTxBusy || !canTriggerFundingTimeout}
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
                                        <button onClick={() => handleFundEscrow(mission.budget)} disabled={isTxBusy || !mission.operatorAccepted} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-40 shadow-lg shadow-emerald-500/20 fluid-touch">
                                            {isTxBusy ? 'Funding...' : `Fund ${formatEther(mission.budget)} AVAX Escrow`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ⑦ Funded stage: Work Delivery + Resolution */}
                        {mission.status === 3 && escrowReady && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Work Delivery */}
                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                    <h2 className="text-xl font-bold">Work Delivery</h2>
                                    {isSelectedOperator && escrowStateIndex === 0 && (
                                        showSubmitInput ? (
                                            <>
                                                <input
                                                    className="input-glass w-full text-sm"
                                                    placeholder="Deliverable URL / IPFS CID / tx hash"
                                                    value={workUrl}
                                                    onChange={e => { setWorkUrl(e.target.value); setLocalError(null) }}
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => { const c = workUrl.trim(); if (!c) { notifyLocalError('Deliverable cannot be empty.'); return } handleSubmitWork(c) }} disabled={isTxBusy} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40">
                                                        {isTxBusy ? 'Submitting...' : 'Confirm Submit'}
                                                    </button>
                                                    <button onClick={() => setShowSubmitInput(false)} className="px-4 py-3 rounded-xl border border-white/20">Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <button onClick={() => setShowSubmitInput(true)} className="w-full py-3 rounded-xl bg-primary text-white font-bold">Submit Work</button>
                                        )
                                    )}
                                    {deliverableURI && deliverableURI.trim() && (
                                        <div className="text-sm">
                                            <div className="font-bold mb-1">Submitted Artifact</div>
                                            <div className="break-all font-mono text-xs bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/10 dark:border-white/10">{deliverableURI}</div>
                                            {getDeliverableHref(deliverableURI) && (
                                                <a href={getDeliverableHref(deliverableURI)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-sm font-bold mt-2 hover:underline">
                                                    Open and Verify →
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {localError && <p className="text-xs text-red-500 font-bold mt-2">{localError}</p>}
                                </div>

                                {/* Resolution */}
                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                    <h2 className="text-xl font-bold">Resolution</h2>
                                    {isClient && escrowStateIndex === 1 && (
                                        <div className="space-y-2">
                                            <button onClick={handleApproveWork} disabled={isTxBusy} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-40">
                                                {isTxBusy ? 'Processing...' : 'Approve & Release Funds'}
                                            </button>
                                            <div className="text-[10px] text-center text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest font-bold">
                                                Protecting Operators: Auto-approves after review timeout
                                            </div>
                                            {submittedAt && submittedAt > 0n && (
                                                <>
                                                    {autoApproveRemaining !== null && autoApproveRemaining > 0 && (
                                                        <div className="text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 p-2 text-center">
                                                            Auto-approve unlocks in {formatDuration(autoApproveRemaining)}.
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={handleAutoApprove}
                                                        disabled={isTxBusy || (autoApproveRemaining !== null && autoApproveRemaining > 0)}
                                                        className="w-full py-2 rounded-xl border border-emerald-500/20 text-emerald-500 text-xs font-bold disabled:opacity-40"
                                                    >
                                                        Trigger Auto-Approve (Timeout Policy)
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {(isClient || isSelectedOperator) && escrowStateIndex === 1 && disputesEnabled && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                If there is an issue with the deliverables, raise a dispute to halt the escrow and escalate to arbitration.
                                            </p>
                                            <button onClick={() => setShowDisputeModal(true)} className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 transition-colors">
                                                Raise Dispute
                                            </button>
                                        </div>
                                    )}
                                    {(isClient || isSelectedOperator) && !disputesEnabled && (
                                        <div className="space-y-2">
                                            <div className="rounded-xl border border-white/20 bg-white/5 p-3 text-xs text-text-muted-light dark:text-text-muted-dark">
                                                Mission-only mode: dispute and governance actions are disabled for this MVP release.
                                            </div>
                                        </div>
                                    )}
                                    {escrowStateIndex === 3 && (isClient || isSelectedOperator) && disputesEnabled && (
                                        <div className="space-y-3">
                                            <div className="text-xs text-center text-text-muted-light dark:text-text-muted-dark font-bold uppercase tracking-widest">
                                                Dispute Active - 30 Minute Response Window
                                            </div>
                                            {connectedAddress?.toLowerCase() !== disputeRaiser?.toLowerCase() && !counterEvidenceURI && (
                                                <div className="space-y-2">
                                                    <input className="input-glass w-full text-sm" placeholder="Counter Evidence Link" value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} />
                                                    <button
                                                        onClick={() => {
                                                            const evidence = evidenceUrl.trim()
                                                            if (!evidence) {
                                                                notifyLocalError('Counter evidence link is required.')
                                                                return
                                                            }
                                                            handleSubmitCounterEvidence(evidence)
                                                        }}
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
                                        <button onClick={handleRefund} disabled={isTxBusy} className="w-full py-3 rounded-xl border border-white/20 font-bold disabled:opacity-40">
                                            Request Refund
                                        </button>
                                            )}
                                    {disputesEnabled && disputeReason && disputeReason.trim() && (
                                        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                                            <div className="font-bold text-red-500">Dispute Investigation</div>
                                            <div className="text-sm"><span className="text-text-muted-light dark:text-text-muted-dark">Reason:</span> {disputeReason}</div>
                                            {disputeEvidenceURI && (
                                                <div className="text-sm"><span className="text-text-muted-light dark:text-text-muted-dark">Initial Evidence:</span>{' '}
                                                    <a href={getDeliverableHref(disputeEvidenceURI)!} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                                                </div>
                                            )}
                                            {counterEvidenceURI && (
                                                <div className="text-sm"><span className="text-text-muted-light dark:text-text-muted-dark">Counter Evidence:</span>{' '}
                                                    <a href={getDeliverableHref(counterEvidenceURI)!} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                                                </div>
                                            )}
                                            {resolutionReasonHash && (
                                                <div className="pt-2 border-t border-white/10 text-sm">
                                                    <div className="font-bold text-emerald-500">Mediator Resolution</div>
                                                    <a href={getDeliverableHref(resolutionReasonHash)!} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Audit Report</a>
                                                </div>
                                            )}
                                            {!resolutionReasonHash && (isClient || isSelectedOperator) && FEATURES.governance && (
                                                <div className="pt-2 border-t border-white/10 text-sm space-y-2">
                                                    <div className="font-bold text-amber-500 mb-2">Community Resolution</div>
                                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                        If the mediator is unresponsive, escalate to the DAO or view active governance cases.
                                                    </p>
                                                    <Link href="/governance" className="flex-1 flex justify-center items-center py-2 rounded-xl border border-white/20 text-white text-xs font-bold hover:bg-white/5 transition-colors bg-white/5">
                                                        Go to Governance Portal
                                                    </Link>
                                                </div>
                                            )}
                                            <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                                {disputeRaiser && <span>Raised by: {shortAddr(disputeRaiser)}</span>}
                                                {disputedAt && disputedAt > 0n && <span className="ml-3">At: {new Date(Number(disputedAt) * 1000).toLocaleString('en-US')}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Section>
            </div>

            <section className="px-4 md:px-8 py-20">
                <div className="max-w-7xl mx-auto w-full"><Footer /></div>
            </section>

            {disputesEnabled && (
                <DisputeModal
                    isOpen={showDisputeModal}
                    onClose={() => setShowDisputeModal(false)}
                    onSubmit={handleRaiseDisputeWithProposal}
                    isSubmitting={isTxBusy}
                />
            )}
        </main>
    )
}





