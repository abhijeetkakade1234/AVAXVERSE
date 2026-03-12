'use client'

import React from 'react'
import Link from 'next/link'
import { ExternalLink, Share2, Check } from 'lucide-react'
import { formatEther } from 'viem'
import { useSnackbar } from '@/context/SnackbarContext'
import { type Mission } from '@/app/missions/types'

const FLOW_STEP_COLORS = [
    { active: 'bg-slate-400',   label: 'text-slate-400',   dim: 'bg-slate-400/20' },   // Posted
    { active: 'bg-blue-500',    label: 'text-blue-400',    dim: 'bg-blue-500/15' },    // Applied
    { active: 'bg-violet-500',  label: 'text-violet-400',  dim: 'bg-violet-500/15' },  // Selected
    { active: 'bg-amber-500',   label: 'text-amber-400',   dim: 'bg-amber-500/15' },   // Accepted
    { active: 'bg-emerald-500', label: 'text-emerald-400', dim: 'bg-emerald-500/15' }, // Funded
    { active: 'bg-cyan-500',    label: 'text-cyan-400',    dim: 'bg-cyan-500/15' },    // Delivered
    { active: 'bg-yellow-400',  label: 'text-yellow-400',  dim: 'bg-yellow-400/15' },  // Closed
] as const

const FLOW_STEPS = ['Posted', 'Applied', 'Selected', 'Accepted', 'Funded', 'Delivered', 'Closed'] as const

const STATUS_COLOR: Record<string, string> = {
    OPEN:      'text-blue-400',
    SELECTED:  'text-violet-400',
    ACCEPTED:  'text-amber-400',
    FUNDED:    'text-emerald-400',
    CLOSED:    'text-yellow-400',
    CANCELLED: 'text-red-400',
}

interface MissionHeaderProps {
    id: string
    mission: Mission
    statusLabel: string
    flowStepIndex: number
    explorerBase: string
    hash?: `0x${string}`
}

export function MissionHeader({ id, mission, statusLabel, flowStepIndex, explorerBase, hash }: MissionHeaderProps) {
    const { showSnackbar } = useSnackbar()
    const [copied, setCopied] = React.useState(false)
    const escrowReady = !!mission.escrow && mission.escrow !== '0x0000000000000000000000000000000000000000'
    const createdDate = mission.createdAt > 0n
        ? new Date(Number(mission.createdAt * 1000n)).toLocaleDateString('en-US')
        : '-'

    const handleShare = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            showSnackbar('Mission link copied to clipboard!', 'success')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            showSnackbar('Failed to copy link.', 'error')
        }
    }

    const statusColorClass = STATUS_COLOR[statusLabel.split(' / ')[0]] ?? 'text-primary'

    return (
        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">
                        Mission #{id}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mt-1 leading-tight">{mission.title}</h1>
                    <div suppressHydrationWarning className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">
                        Posted: {createdDate}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Share button */}
                    <button
                        onClick={handleShare}
                        className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300
                            ${copied
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/10 border-white/20 text-text-muted-light dark:text-text-muted-dark hover:bg-primary/10 hover:border-primary/30 hover:text-primary'
                            }
                        `}
                    >
                        {copied ? <Check size={12} /> : <Share2 size={12} />}
                        {copied ? 'Copied!' : 'Share'}
                    </button>

                    <div className="text-right">
                        <div className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Status</div>
                        <div className={`font-bold ${statusColorClass}`}>{statusLabel}</div>
                        <div className="text-2xl font-black mt-1">{formatEther(mission.budget)} AVAX</div>
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
            </div>

            {/* Flow progress */}
            <MissionFlowProgress flowStepIndex={flowStepIndex} />
        </div>
    )
}

export function MissionFlowProgress({ flowStepIndex }: { flowStepIndex: number }) {
    return (
        <div className="mt-6">
            {/* Mobile */}
            <div className="md:hidden space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">
                        Mission Progress
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${FLOW_STEP_COLORS[flowStepIndex]?.label ?? 'text-primary'}`}>
                        {flowStepIndex + 1} / {FLOW_STEPS.length}
                    </span>
                </div>
                <div className="flex gap-1.5">
                    {FLOW_STEPS.map((step, idx) => (
                        <div
                            key={step}
                            className={`h-1.5 rounded-full flex-1 transition-all duration-700 ease-out ${
                                idx <= flowStepIndex
                                    ? FLOW_STEP_COLORS[idx]?.active
                                    : 'bg-white/10 dark:bg-white/5'
                            }`}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {FLOW_STEPS.map((step, idx) => (
                        <div key={step} className="flex items-center gap-2">
                            <div className={`rounded-full transition-all duration-500 ${FLOW_STEP_COLORS[idx]?.active} ${
                                idx === flowStepIndex
                                    ? 'w-2.5 h-2.5 ring-2 ring-offset-1 ring-offset-transparent opacity-100'
                                    : idx < flowStepIndex
                                    ? 'w-1.5 h-1.5 opacity-80'
                                    : 'w-1.5 h-1.5 opacity-20'
                            }`}
                            />
                            <span className={`text-[9px] font-bold uppercase tracking-tight transition-all duration-500 ${
                                idx === flowStepIndex
                                    ? `${FLOW_STEP_COLORS[idx]?.label} opacity-100`
                                    : idx < flowStepIndex
                                    ? `${FLOW_STEP_COLORS[idx]?.label} opacity-70`
                                    : 'text-text-muted-light dark:text-text-muted-dark opacity-30'
                            }`}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
                <div className="flex justify-between mb-2">
                    {FLOW_STEPS.map((step, idx) => (
                        <span
                            key={step}
                            className={`text-[10px] font-extrabold uppercase tracking-wider transition-all duration-500 ${
                                idx === flowStepIndex
                                    ? `${FLOW_STEP_COLORS[idx]?.label} scale-105`
                                    : idx < flowStepIndex
                                    ? FLOW_STEP_COLORS[idx]?.label + ' opacity-70'
                                    : 'text-text-muted-light dark:text-text-muted-dark opacity-30'
                            }`}
                        >
                            {step}
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    {FLOW_STEPS.map((step, idx) => (
                        <div
                            key={step}
                            title={step}
                            style={idx <= flowStepIndex ? { boxShadow: `0 0 8px 1px var(--step-glow-${idx})` } : {}}
                            className={`h-2 rounded-full flex-1 transition-all duration-700 ease-out ${
                                idx <= flowStepIndex
                                    ? FLOW_STEP_COLORS[idx]?.active
                                    : 'bg-white/10 dark:bg-white/5'
                            } ${idx === flowStepIndex ? 'scale-y-150' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export const FLOW_STEP_COLORS_EXPORT = FLOW_STEP_COLORS
