'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Zap, ShieldCheck, Search } from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESSES, ACTIVE_CHAIN } from '@/lib/config'
import { ESCROW_FACTORY_ABI, ESCROW_ABI, ESCROW_STATES, IDENTITY_REGISTRY_ABI, type EscrowState } from '@/lib/abis'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'
import { type Job, type JobApplication } from '../types'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const JOB_STATUS_LABELS = ['OPEN', 'SELECTED', 'ACCEPTED', 'FUNDED', 'CLOSED', 'CANCELLED'] as const
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

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const jobId = BigInt(id)
    const { address: connectedAddress } = useAccount()

    const [proposalURI, setProposalURI] = useState('')
    const [showDisputeInput, setShowDisputeInput] = useState(false)
    const [disputeReasonInput, setDisputeReasonInput] = useState('')
    const [showSubmitInput, setShowSubmitInput] = useState(false)
    const [workUrl, setWorkUrl] = useState('')
    const [evidenceUrl, setEvidenceUrl] = useState('')
    const [localError, setLocalError] = useState<string | null>(null)

    const { data: job, isLoading: isJobLoading, refetch: refetchJob } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJob',
        args: [jobId],
    }) as { data: Job | undefined; isLoading: boolean; refetch: () => void }

    const escrowReady = !!job?.escrow && job.escrow !== ZERO_ADDRESS

    const { data: applicants, refetch: refetchApplicants } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getApplicants',
        args: [jobId],
        query: { enabled: !!job },
    }) as { data: string[] | undefined; refetch: () => void }

    const { data: myApplication, refetch: refetchMyApplication } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getApplication',
        args: connectedAddress ? [jobId, connectedAddress as `0x${string}`] : undefined,
        query: { enabled: !!connectedAddress && !!job },
    }) as { data: JobApplication | undefined; refetch: () => void }

    const { data: userRequiredStake } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'requiredStakeFor',
        args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
        query: { enabled: !!connectedAddress },
    }) as { data: bigint | undefined }

    const { data: state, refetch: refetchEscrowState } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getState',
        query: { enabled: escrowReady },
    }) as { data: bigint | undefined; refetch: () => void }

    const { data: deliverableURI, refetch: refetchDeliverable } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'deliverableURI',
        query: { enabled: escrowReady },
    }) as { data: string | undefined; refetch: () => void }

    const { data: disputeReason, refetch: refetchDisputeReason } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'disputeReason',
        query: { enabled: escrowReady },
    }) as { data: string | undefined; refetch: () => void }

    const { data: disputeRaiser } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'disputeRaiser',
        query: { enabled: escrowReady },
    }) as { data: string | undefined }

    const { data: disputedAt } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'disputedAt',
        query: { enabled: escrowReady },
    }) as { data: bigint | undefined }

    const { data: submittedAt } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: '_submittedAt',
        query: { enabled: escrowReady },
    }) as { data: bigint | undefined }

    const { data: disputeEvidenceURI } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'disputeEvidenceURI',
        query: { enabled: escrowReady },
    }) as { data: string | undefined }

    const { data: counterEvidenceURI } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'counterEvidenceURI',
        query: { enabled: escrowReady },
    }) as { data: string | undefined }

    const { data: resolutionReasonHash } = useReadContract({
        address: (job?.escrow ?? ZERO_ADDRESS) as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'resolutionReasonHash',
        query: { enabled: escrowReady },
    }) as { data: string | undefined }

    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (!isSuccess) return
        refetchJob()
        refetchApplicants()
        refetchMyApplication()
        refetchEscrowState()
        refetchDeliverable()
        refetchDisputeReason()
    }, [isSuccess, refetchApplicants, refetchDeliverable, refetchDisputeReason, refetchEscrowState, refetchJob, refetchMyApplication])

    if (isJobLoading) {
        return (
            <main className="min-h-screen bg-background-light dark:bg-background-dark pt-40 flex items-center justify-center">
                <div className="text-text-muted-light dark:text-text-muted-dark font-bold uppercase tracking-widest animate-pulse text-sm">
                    Loading mission...
                </div>
            </main>
        )
    }

    if (!job) {
        return (
            <main className="min-h-screen bg-background-light dark:bg-background-dark pt-40 flex items-center justify-center">
                <div className="text-red-500 font-bold">MISSION ID NOT FOUND</div>
            </main>
        )
    }

    const isClient = connectedAddress?.toLowerCase() === job.client.toLowerCase()
    const isSelectedOperator = connectedAddress?.toLowerCase() === job.freelancer.toLowerCase()
    const isTxBusy = isPending || isConfirming
    const jobStatus = JOB_STATUS_LABELS[job.status] ?? 'UNKNOWN'
    const escrowStateIndex = state !== undefined ? Number(state) : undefined
    const escrowStateName: EscrowState = escrowStateIndex !== undefined ? ESCROW_STATES[escrowStateIndex] : 'FUNDED'
    const createdDate = job.createdAt > 0n ? new Date(Number(job.createdAt * 1000n)).toLocaleDateString('en-US') : '-'

    const txErrorMessage = (() => {
        if (!error) return null
        const message = error.message.toLowerCase()
        if (message.includes('user rejected')) return 'Transaction was rejected in wallet.'
        return error.message.split('\n')[0]
    })()

    const statusLabel = job.status === 3 && escrowReady ? `FUNDED / ${escrowStateName}` : jobStatus
    const flowStepIndex = (() => {
        if (job.status === 5) return 0 // cancelled
        if (job.status === 0) return (applicants?.length ?? 0) > 0 ? 1 : 0
        if (job.status === 1) return 2
        if (job.status === 2) return 3
        if (job.status === 3) {
            if (escrowStateIndex === undefined) return 4
            if (escrowStateIndex >= 4) return 6 // released
            if (escrowStateIndex >= 1) return 5 // submitted or later before release
            return 4
        }
        if (job.status === 4) return 6 // closed
        return 0
    })()

    const handleApply = (proposal: string, stake: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'applyToJob',
            args: [jobId, proposal],
            value: stake,
        })
    }

    const handleSelectOperator = (operator: string) => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'selectOperator',
            args: [jobId, operator as `0x${string}`],
        })
    }

    const handleAcceptAssignment = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'acceptAssignment',
            args: [jobId],
        })
    }

    const handleFundEscrow = (budget: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'fundEscrow',
            args: [jobId],
            value: budget,
        })
    }

    const handleReopenJob = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'reopenJob',
            args: [jobId],
        })
    }

    const handleTimeoutReopen = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'timeoutReopenAndSlashSelected',
            args: [jobId],
        })
    }

    const handleTimeoutCancelByOperator = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'timeoutCancelByOperator',
            args: [jobId],
        })
    }

    const handleWithdrawApplicationStake = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'withdrawApplicationStake',
            args: [jobId],
        })
    }

    const handleSubmitWork = (uri: string) => {
        writeContract({
            address: job.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'submitWork',
            args: [uri],
        })
    }

    const handleApproveWork = () => {
        writeContract({
            address: job.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'approveWork',
        })
    }

    const handleRaiseDispute = (reason: string, evidence: string) => {
        writeContract({
            address: job.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'raiseDispute',
            args: [reason, evidence],
        })
    }

    const handleSubmitCounterEvidence = (evidence: string) => {
        writeContract({
            address: job.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'submitCounterEvidence',
            args: [evidence],
        })
    }

    const handleAutoApprove = () => {
        writeContract({
            address: job.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'autoApprove',
        })
    }

    const handleRefund = () => {
        writeContract({
            address: job.escrow as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'refund',
        })
    }

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300">
            <Navbar />

            <div className="pt-32 pb-20">
                <Section>
                    <Link href="/jobs?tab=browse" className="inline-flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors mb-8 group text-sm font-bold">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
                    </Link>

                    <div className="space-y-6">
                        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-8">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Mission #{id}</div>
                                    <h1 className="text-3xl md:text-4xl font-black mt-1">{job.title}</h1>
                                    <div suppressHydrationWarning className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Posted: {createdDate}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Status</div>
                                    <div className="font-bold text-primary">{statusLabel}</div>
                                    <div className="text-2xl font-black mt-2">{formatEther(job.budget)} AVAX</div>
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
                                <Link href="/jobs/how-it-works" className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary/90 transition-colors shrink-0">
                                    Learn More
                                </Link>
                            </div>
                            <div className="mt-6">
                                <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark mb-2">
                                    {FLOW_STEPS.map(step => <span key={step}>{step}</span>)}
                                </div>
                                <div className="flex gap-2">
                                    {FLOW_STEPS.map((step, idx) => (
                                        <div
                                            key={step}
                                            className={`h-2 rounded-full flex-1 ${idx <= flowStepIndex ? 'bg-primary' : 'bg-white/10'}`}
                                            title={step}
                                        />
                                    ))}
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
                                    {job.status === 0 && (
                                        isClient ? "Waiting for operators to apply. Review proposals below when they arrive." : "This mission is open for applications. Submit your proposal to be considered!"
                                    )}
                                    {job.status === 1 && (
                                        isSelectedOperator ? "You have been selected! Click 'Accept Assignment' below to confirm you're ready to start." : isClient ? "Waiting for the selected operator to accept the assignment." : "An operator has been selected and is reviewing the assignment."
                                    )}
                                    {job.status === 2 && (
                                        isSelectedOperator ? "Assignment accepted! Please wait while the client funds the escrow to formally start the mission." : isClient ? "Operator has accepted! Now you must fund the escrow budget to secure the work." : "Selection confirmed. Waiting for client funding."
                                    )}
                                    {job.status === 3 && (
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
                                    {job.status === 4 && "Mission successfully completed and funds released."}
                                    {job.status === 5 && "This mission has been cancelled."}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PartyProfileCard role="Client" addr={job.client} />
                            {job.freelancer !== ZERO_ADDRESS ? (
                                <PartyProfileCard role="Selected Operator" addr={job.freelancer} />
                            ) : (
                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 text-sm text-text-muted-light dark:text-text-muted-dark">
                                    No operator selected yet.
                                </div>
                            )}
                        </div>

                        {job.status === 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-4">
                                    <h2 className="text-xl font-bold">Operator Applications</h2>
                                    {applicants && applicants.length > 0 ? (
                                        <div className="space-y-3">
                                            {applicants.map(addr => (
                                                <ApplicantRow
                                                    key={addr}
                                                    jobId={jobId}
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
                                            {userRequiredStake !== undefined && userRequiredStake < (userRequiredStake * BigInt(10) / BigInt(1)) && (
                                                <span className="text-emerald-500 font-bold ml-1"> (Reputation Discount Applied!)</span>
                                            )}
                                        </p>
                                        {myApplication?.exists ? (
                                            <div className="text-sm text-emerald-600 font-bold">You already applied to this mission.</div>
                                        ) : (
                                            <>
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
                                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40"
                                                >
                                                    {isTxBusy ? 'Submitting...' : 'Submit Application'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {(job.status === 1 || job.status === 2) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {isSelectedOperator && !job.operatorAccepted && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6">
                                        <h2 className="text-xl font-bold mb-3">Assignment Acceptance</h2>
                                        <button
                                            onClick={handleAcceptAssignment}
                                            disabled={isTxBusy}
                                            className="w-full py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40"
                                        >
                                            {isTxBusy ? 'Submitting...' : 'Accept Assignment'}
                                        </button>
                                    </div>
                                )}
                                {isSelectedOperator && job.operatorAccepted && (
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

                                {isClient && (
                                    <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 space-y-3">
                                        <h2 className="text-xl font-bold">Fund Escrow</h2>
                                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                            {job.operatorAccepted ? 'Selected operator has accepted. You can fund escrow now.' : 'Waiting for selected operator to accept assignment.'}
                                        </p>
                                        <button
                                            onClick={() => handleFundEscrow(job.budget)}
                                            disabled={isTxBusy || !job.operatorAccepted}
                                            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-40"
                                        >
                                            {isTxBusy ? 'Funding...' : `Fund ${formatEther(job.budget)} AVAX Escrow`}
                                        </button>
                                        {!job.operatorAccepted && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={handleReopenJob}
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

                        {job.status === 3 && escrowReady && (
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
                                        showDisputeInput ? (
                                            <>
                                                <textarea
                                                    className="input-glass w-full resize-none text-sm"
                                                    rows={2}
                                                    placeholder="Dispute reason"
                                                    value={disputeReasonInput}
                                                    onChange={e => {
                                                        setDisputeReasonInput(e.target.value)
                                                        setLocalError(null)
                                                    }}
                                                />
                                                <input
                                                    className="input-glass w-full text-sm"
                                                    placeholder="Evidence Link (IPFS/URL)"
                                                    value={evidenceUrl}
                                                    onChange={e => setEvidenceUrl(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const reason = disputeReasonInput.trim()
                                                            if (!reason) {
                                                                setLocalError('Dispute reason is required.')
                                                                return
                                                            }
                                                            handleRaiseDispute(reason, evidenceUrl.trim())
                                                        }}
                                                        disabled={isTxBusy}
                                                        className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-500 font-bold disabled:opacity-40"
                                                    >
                                                        {isTxBusy ? 'Submitting...' : 'Confirm Dispute'}
                                                    </button>
                                                    <button onClick={() => setShowDisputeInput(false)} className="px-4 py-3 rounded-xl border border-white/20">Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <button onClick={() => setShowDisputeInput(true)} className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-bold">Raise Dispute</button>
                                        )
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
                                            <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                                {disputeRaiser && <span>Raised by: {shortAddr(disputeRaiser)}</span>}
                                                {disputedAt && disputedAt > BigInt(0) && <span className="ml-3">At: {new Date(Number(disputedAt) * 1000).toLocaleString('en-US')}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {localError && <div className="text-sm text-red-500 font-bold">{localError}</div>}
                        {txErrorMessage && <div className="text-sm text-red-500 font-bold">{txErrorMessage}</div>}
                        {isSuccess && <div className="text-sm text-emerald-600 font-bold">Transaction confirmed on-chain.</div>}
                        {!isClient && myApplication?.exists && (
                            <button
                                onClick={handleWithdrawApplicationStake}
                                disabled={isTxBusy || ((job.status === 1 || job.status === 2) && isSelectedOperator)}
                                className="py-2 px-4 rounded-lg border border-white/20 text-sm font-bold disabled:opacity-40"
                            >
                                Withdraw Application Stake
                            </button>
                        )}
                    </div>
                </Section>
            </div>

            <section className="px-4 md:px-8 py-20">
                <div className="max-w-7xl mx-auto w-full">
                    <Footer />
                </div>
            </section>
        </main>
    )
}

function ApplicantRow({
    jobId,
    operator,
    canSelect,
    isBusy,
    onSelect,
}: {
    jobId: bigint
    operator: string
    canSelect: boolean
    isBusy: boolean
    onSelect: () => void
}) {
    const { data: application } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getApplication',
        args: [jobId, operator as `0x${string}`],
    }) as { data: JobApplication | undefined }

    const { data: profile } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getProfile',
        args: [operator as `0x${string}`],
    }) as { data: Profile | undefined }

    const { data: userJobs } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJobsByUser',
        args: [operator as `0x${string}`],
    }) as { data: bigint[] | undefined }

    return (
        <div className="rounded-xl border border-white/20 dark:border-white/10 p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Link href={`/profile/${operator}`} className="font-bold text-primary hover:underline">
                        {profile?.exists ? profile.name : shortAddr(operator)}
                    </Link>
                    <div className="text-xs text-text-muted-light dark:text-text-muted-dark">{shortAddr(operator)}</div>
                </div>
                <div className="text-right text-xs text-text-muted-light dark:text-text-muted-dark">
                    <div>Rep: {Number(profile?.reputationScore ?? BigInt(0))}</div>
                    <div>Jobs: {userJobs?.length ?? 0}</div>
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

    const { data: userJobs } = useReadContract({
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
            <div className="text-sm">Past Jobs: <span className="font-bold">{userJobs?.length ?? 0}</span></div>
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
