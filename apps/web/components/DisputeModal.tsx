'use client'

import React, { useState } from 'react'
import { AlertCircle, Scale, Check, X, ArrowRight, Users, Clock } from 'lucide-react'

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, evidence: string) => Promise<void>;
    isSubmitting: boolean;
}

export function DisputeModal({ isOpen, onClose, onSubmit, isSubmitting }: DisputeModalProps) {
    const [step, setStep] = useState(1)
    const [agreed, setAgreed] = useState(false)
    const [reason, setReason] = useState('')
    const [evidence, setEvidence] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleNext = () => {
        if (step === 1 && !agreed) return
        setStep(step + 1)
    }

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Dispute reason is required.')
            return
        }
        setError('')
        try {
            await onSubmit(reason, evidence)
            // Reset state on successful submission
            setStep(1)
            setAgreed(false)
            setReason('')
            setEvidence('')
            onClose()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit dispute')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#1A1A2E] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 text-red-500 rounded-xl">
                            <AlertCircle size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Raise Dispute</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto">
                    {/* Stepper */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-10" />
                        <StepIndicator active={step >= 1} number={1} label="Terms" />
                        <StepIndicator active={step >= 2} number={2} label="Details" />
                        <StepIndicator active={step >= 3} number={3} label="Submit" />
                    </div>

                    {/* Step 1: Terms */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Dispute Arbitration Process</h3>
                                <div className="space-y-3">
                                    <InfoCard
                                        icon={<Scale size={18} />}
                                        title="Initial Mediation"
                                        desc="Your dispute will first be reviewed by an appointed mediator who will verify the deliverables."
                                    />
                                    <InfoCard
                                        icon={<Users size={18} />}
                                        title="DAO Escalation"
                                        desc="Raising a dispute automatically creates a Governance Proposal, allowing the community jury to vote if the mediator is unresponsive."
                                    />
                                    <InfoCard
                                        icon={<Clock size={18} />}
                                        title="Timeframe"
                                        desc="The opposing party has 3 days to submit counter-evidence before a resolution can be enforced."
                                    />
                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <div className="text-red-500 mt-1"><AlertCircle size={18} /></div>
                                        <div>
                                            <div className="text-sm font-bold text-red-500 mb-1">High Risk Warning</div>
                                            <div className="text-xs text-red-400/80 leading-relaxed">
                                                Whatever the governance community votes, the dispute fund will be distributed accordingly. The DAO&apos;s decision is final. Dispute at your own risk.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 p-4 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                                <div className="mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-5 h-5 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-0"
                                    />
                                </div>
                                <div className="text-sm text-white/70 group-hover:text-white/90">
                                    I understand the dispute process, accept the high risks involved, and agree that the DAO community&apos;s vote on the funds is final.
                                </div>
                            </label>
                        </div>
                    )}

                    {/* Step 2: Form */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-bold text-white">Dispute Details</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                        Reason for Dispute *
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value)
                                            setError('')
                                        }}
                                        placeholder="Explain exactly why the deliverables were unsatisfactory or why funds should be returned..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none h-32"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                        Evidence Link (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={evidence}
                                        onChange={(e) => setEvidence(e.target.value)}
                                        placeholder="IPFS CID or HTTPS URL to screenshots/logs"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                                {error && <div className="text-red-400 text-xs font-bold">{error}</div>}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <h3 className="text-lg font-bold text-white">Review & Submit</h3>

                            <div className="bg-black/20 border border-white/10 rounded-xl p-6 space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Reason</div>
                                    <div className="text-sm text-white whitespace-pre-wrap">{reason}</div>
                                </div>
                                {evidence && (
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Evidence</div>
                                        <div className="text-sm text-primary break-all">{evidence}</div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs leading-relaxed">
                                <strong>Important:</strong> Submitting this will lock the escrow funds and create a public governance proposal. This action cannot be undone.
                            </div>

                            {error && <div className="text-red-400 text-xs font-bold text-center">{error}</div>}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between mt-auto">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl border border-white/20 text-sm font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                            Back
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 ? !agreed : !reason.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            Next Step <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                        >
                            {isSubmitting ? 'Transacting...' : 'Confirm Dispute'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function StepIndicator({ active, number, label }: { active: boolean, number: number, label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 bg-[#1A1A2E] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${active ? 'bg-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]' : 'bg-black/40 text-white/30 border border-white/10'}`}>
                {active && number < 3 ? <Check size={14} /> : number}
            </div>
            <span className={`text-[10px] uppercase tracking-widest transition-colors ${active ? 'text-primary font-bold' : 'text-white/30'}`}>
                {label}
            </span>
        </div>
    )
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {

    return (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
            <div className="text-primary mt-1">{icon}</div>
            <div>
                <div className="text-sm font-bold text-white mb-1">{title}</div>
                <div className="text-xs text-white/50 leading-relaxed">{desc}</div>
            </div>
        </div>
    )
}
