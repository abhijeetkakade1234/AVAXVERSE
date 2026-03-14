'use client'

import React from 'react'
import { Zap } from 'lucide-react'

type Props = {
    missionStatus: number
    isClient: boolean
    isSelectedOperator: boolean
    escrowStateIndex: number | undefined
}

const STEP_COLORS = [
    'text-slate-400 bg-slate-400/10 border-slate-400/20',
    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'text-violet-400 bg-violet-500/10 border-violet-500/20',
    'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
]

const stepColor = (idx: number) => STEP_COLORS[idx] ?? STEP_COLORS[0]

export function MissionStatusWidget({ missionStatus, isClient, isSelectedOperator, escrowStateIndex }: Props) {
    const colorIdx = missionStatus === 0 ? 0
        : missionStatus === 1 ? 2
        : missionStatus === 2 ? 3
        : missionStatus === 3 ? 4
        : missionStatus === 4 ? 6
        : 0

    const message = (() => {
        if (missionStatus === 0) return isClient
            ? 'Waiting for operators to apply. Review proposals when they arrive.'
            : 'This mission is open for applications. Submit your proposal!'
        if (missionStatus === 1) return isSelectedOperator
            ? "You've been selected! Accept the assignment below to confirm you're ready."
            : isClient
            ? 'Waiting for the selected operator to accept the assignment.'
            : 'An operator has been selected and is reviewing the assignment.'
        if (missionStatus === 2) return isSelectedOperator
            ? 'Assignment accepted! Waiting for the client to fund the escrow.'
            : isClient
            ? 'Operator has accepted! Fund the escrow budget to start the mission.'
            : 'Selection confirmed. Waiting for client funding.'
        if (missionStatus === 3) {
            if (isSelectedOperator) return escrowStateIndex === 0
                ? 'Mission is live! Submit your deliverables below when ready.'
                : escrowStateIndex === 1
                ? 'Deliverables submitted. Waiting for client review.'
                : escrowStateIndex === 3
                ? 'Dispute active. Awaiting mediator resolution.'
                : 'Mission active — follow the escrow state below.'
            if (isClient) return escrowStateIndex === 0
                ? 'Escrow funded. The operator is now authorized to work.'
                : escrowStateIndex === 1
                ? 'Deliverables submitted! Review and approve to release funds.'
                : escrowStateIndex === 3
                ? 'Dispute raised. A mediator will review the evidence.'
                : 'Escrow active — monitor progress below.'
            return 'Mission in progress.'
        }
        if (missionStatus === 4) return 'Mission successfully completed and funds released. 🎉'
        if (missionStatus === 5) return 'This mission has been cancelled.'
        return ''
    })()

    const cls = stepColor(colorIdx)

    return (
        <div className={`glass-panel ${cls} border rounded-3xl p-6 flex items-start gap-4 transition-all duration-500`}>
            <div className={`mt-0.5 p-2 rounded-xl ${cls}`}>
                <Zap size={18} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold">What&apos;s next?</h3>
                <div className="text-sm opacity-80 mt-1 leading-relaxed">{message}</div>
            </div>
        </div>
    )
}
