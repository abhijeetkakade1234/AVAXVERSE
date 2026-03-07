'use client'

import React, { useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import Link from 'next/link'
import { useSnackbar } from '@/context/SnackbarContext'
import { translateError } from '@/lib/error-translator'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ESCROW_FACTORY_ABI } from '@/lib/abis'

const VALIDATOR_NETWORKS = ['Avalanche DAO Mainnet', 'Fuji Testnet', 'Private Subnet']

export default function CreateJob() {
    const { showSnackbar } = useSnackbar()
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
    const { data: clientCommitmentWei } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'clientCommitmentWei',
    }) as { data: bigint | undefined }
    const tagInputRef = useRef<HTMLInputElement>(null)

    const [fieldErrors, setFieldErrors] = useState<{ title?: string; budget?: string }>({})

    const [form, setForm] = useState({
        title: '',
        desc: '',
        budget: '',
        tags: [] as string[],
        validator: VALIDATOR_NETWORKS[0],
    })

    const addTag = (raw: string) => {
        const tag = raw.trim().toUpperCase()
        if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }))
    }

    const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value) {
            e.preventDefault()
            addTag(e.currentTarget.value)
            e.currentTarget.value = ''
        }
    }

    const handleSubmit = () => {
        const errors: { title?: string; budget?: string } = {}
        const trimmedTitle = form.title.trim()

        if (!trimmedTitle) errors.title = 'Mission title is required.'

        let parsedBudget: bigint | null = null
        if (!form.budget.trim()) {
            errors.budget = 'Mission budget is required.'
        } else {
            try {
                parsedBudget = parseEther(form.budget)
                if (parsedBudget <= BigInt(0)) errors.budget = 'Mission budget must be greater than 0 AVAX.'
            } catch {
                errors.budget = 'Enter a valid AVAX amount (for example: 0.5 or 12).'
            }
        }

        setFieldErrors(errors)
        if (Object.keys(errors).length > 0 || parsedBudget === null) {
            return
        }

        writeContract({
            address: CONTRACT_ADDRESSES.EscrowFactory,
            abi: ESCROW_FACTORY_ABI,
            functionName: 'createJob',
            args: [trimmedTitle, parsedBudget, form.desc.trim()],
            value: clientCommitmentWei ?? BigInt(0),
        })
    }

    const canSubmit = form.title.trim() !== '' && form.budget !== '' && !isPending && !isConfirming

    React.useEffect(() => {
        if (isSuccess) {
            showSnackbar('Mission posted successfully!', 'success')
        }
    }, [isSuccess, showSnackbar])

    React.useEffect(() => {
        if (error) {
            showSnackbar(translateError(error), 'error')
        }
    }, [error, showSnackbar])

    if (isSuccess) {
        return (
            <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-20 text-center animate-enter">
                <span className="material-symbols-outlined text-neon-green text-6xl block mb-6">check_circle</span>
                <h2 className="text-2xl font-bold mb-2">Mission Posted</h2>
                <p className="text-text-muted-light dark:text-text-muted-dark mb-8">Operators can now apply. Select one, then fund escrow after acceptance.</p>
                <Link href="/jobs?tab=browse" className="text-primary font-bold hover:underline">Return to Marketplace</Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="space-y-8 animate-enter">
                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">assignment</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-dark">Mission Brief</h2>
                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark font-medium">Define the objective and expected deliverables.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark ml-1">
                                Mission Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                className="input-glass text-xl font-semibold w-full"
                                placeholder="e.g., Cross-Chain Liquidity Subnet Deployment"
                                type="text"
                                value={form.title}
                                onChange={e => {
                                    setForm(f => ({ ...f, title: e.target.value }))
                                    setFieldErrors(prev => ({ ...prev, title: undefined }))
                                }}
                            />
                            {fieldErrors.title && <p className="text-xs text-red-400 font-bold ml-1">{fieldErrors.title}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark ml-1">Objective Description / Metadata URI</label>
                            <textarea
                                className="input-glass resize-none w-full"
                                placeholder="Describe scope, acceptance criteria, links, or metadata URI..."
                                rows={5}
                                value={form.desc}
                                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">terminal</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-dark">Technical Specs</h2>
                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark font-medium">Tags and validator preferences for applicants.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark ml-1">
                                Protocol Tags <span className="text-text-muted-light/40 font-normal normal-case tracking-normal text-xs">(Enter or comma to add)</span>
                            </label>
                            <div className="flex flex-wrap gap-2 p-3 input-glass min-h-[58px] cursor-text" onClick={() => tagInputRef.current?.focus()}>
                                {form.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-primary text-white rounded-full text-xs font-bold flex items-center gap-1">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:opacity-70 transition-opacity leading-none">
                                            <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                    </span>
                                ))}
                                <input
                                    ref={tagInputRef}
                                    className="bg-transparent border-none p-0 text-sm focus:ring-0 min-w-[100px] outline-none flex-1"
                                    placeholder={form.tags.length === 0 ? 'e.g. SUBNET-EVM, DeFi...' : 'Add tag...'}
                                    type="text"
                                    onKeyDown={handleTagKeyDown}
                                    onBlur={e => {
                                        if (e.target.value) {
                                            addTag(e.target.value)
                                            e.target.value = ''
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark ml-1">Validator Network</label>
                            <select
                                className="input-glass text-sm outline-none cursor-pointer dark:text-white"
                                value={form.validator}
                                onChange={e => setForm(f => ({ ...f, validator: e.target.value }))}
                            >
                                {VALIDATOR_NETWORKS.map(n => <option key={n} className="bg-white dark:bg-surface-dark text-text-light dark:text-white">{n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-8 shadow-sm overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-text-dark">Budget Setup</h2>
                                <p className="text-sm text-text-muted-light dark:text-text-muted-dark font-medium">Set mission budget now. Fund escrow later after operator acceptance.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-text-muted-light dark:text-text-muted-dark">
                                Operators apply to this mission after posting. You can compare profiles, history, and proposals before selecting one.
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark ml-1">
                                    Mission Budget <span className="text-red-400">*</span>
                                </label>
                                <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                    <Info size={14} className="inline mr-1 text-primary" />
                                    Note: A 7-day auto-review policy applies. If you don&apos;t approve or dispute within 7 days of delivery, funds release automatically.
                                    <Link href="/jobs/how-it-works" className="ml-1 text-primary hover:underline font-bold">Learn more about periods & disputes.</Link>
                                </p>
                                <div className="relative">
                                    <input
                                        className="input-glass w-full font-black pr-20 text-3xl"
                                        placeholder="0.00"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.budget}
                                        onChange={e => {
                                            setForm(f => ({ ...f, budget: e.target.value }))
                                            setFieldErrors(prev => ({ ...prev, budget: undefined }))
                                        }}
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-extrabold text-xl text-primary">AVAX</span>
                                </div>
                                {fieldErrors.budget && <p className="text-xs text-red-400 font-bold ml-1">{fieldErrors.budget}</p>}
                            </div>
                        </div>

                        <div className="mt-10 p-6 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                                <p className="text-sm text-text-muted-light dark:text-text-muted-dark font-medium leading-snug">
                                    Escrow locks only after operator selection and acceptance. Commitment deposit: <span className="font-bold text-primary">{formatEther(clientCommitmentWei ?? BigInt(0))} AVAX</span> (refunded when escrow is funded).
                                </p>
                            </div>
                            <div className="pt-4 border-t border-primary/10 flex items-center gap-4">
                                <span className="material-symbols-outlined text-text-muted-light/60 text-xl">timer</span>
                                <p className="text-[11px] text-text-muted-light/60 dark:text-text-muted-dark/60 font-bold uppercase tracking-widest">
                                    Quality Assurance Policy: Deliverables are automatically approved after 7 days of client inactivity to ensure fair operator payment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 pt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="w-full max-w-md bg-primary hover:bg-primary/90 text-white py-5 px-8 rounded-3xl font-extrabold text-xl shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 cinematic-shadow disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isPending || isConfirming ? <span className="material-symbols-outlined animate-spin text-2xl">sync</span> : <span className="material-symbols-outlined text-2xl">rocket_launch</span>}
                        {isPending ? 'Signing Payload...' : isConfirming ? 'Publishing Mission...' : 'Post Mission'}
                    </button>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">shield</span>
                        Wallet connection required for posting on-chain.
                    </p>

                    {/* Success and error messages are handled by the Snackbar */}
                </div>
            </div>
        </div>
    )
}
