'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { User, BadgeCheck, Loader2, CheckCircle2, ShieldCheck, Cpu, Globe, Zap } from 'lucide-react'
import { Section } from '@/components/ui'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { IDENTITY_REGISTRY_ABI } from '@/lib/abis'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function ProfilePage() {
    const { address, isConnected } = useAccount()
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')

    const { data: profile } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getProfile',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        writeContract({
            address: CONTRACT_ADDRESSES.IdentityRegistry,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'register',
            args: [name, `data:application/json,${JSON.stringify({ bio })}`],
        })
    }

    const hasProfile = profile?.exists

    return (
        <main className="min-h-screen pt-48 pb-32 dot-grid">
            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

            <Section>
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Left Column: Info & Context */}
                    <div className="lg:w-1/3 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} /> Identity Protocol
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none gradient-text-subtle">
                            Your On-Chain <br /> <span className="text-red-500">Self.</span>
                        </h1>
                        <p className="text-white/50 leading-relaxed text-lg">
                            Ditch the silos. AVAXVERSE identities are decentralized, sovereign, and portable. Build your reputation and own it forever.
                        </p>

                        <div className="space-y-4 pt-6">
                            <FeatureSmall icon={<Cpu />} title="Decentralized IDs" desc="Built on W3C standards." />
                            <FeatureSmall icon={<Globe />} title="Fuji Connected" desc="Live on Avalanche Testnet." />
                            <FeatureSmall icon={<Zap />} title="Sovereign Data" desc="You control your metadata." />
                        </div>
                    </div>

                    {/* Right Column: Interaction Area */}
                    <div className="lg:w-2/3 w-full">
                        {!isConnected ? (
                            <div className="glass p-12 text-center border-white/5 glow-border">
                                <User size={64} className="mx-auto mb-6 text-white/10" />
                                <h2 className="text-2xl font-bold mb-3">Disconnected</h2>
                                <p className="text-white/40 mb-8 max-w-sm mx-auto">
                                    Your journey starts with a simple wallet connection. Join the AVAXVERSE ecosystem today.
                                </p>
                                <div className="inline-block transform transition-transform hover:scale-105 active:scale-95">
                                    <ConnectButton />
                                </div>
                            </div>
                        ) : hasProfile ? (
                            <div className="glass p-8 border-white/5 glow-border animate-enter">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl">
                                            <User size={40} className="text-white" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-lg border-2 border-[#111118]">
                                            <BadgeCheck size={16} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black mb-1">{profile.name}</h2>
                                        <p className="text-white/40 font-mono text-sm tracking-tighter truncate max-w-xs md:max-w-md">
                                            {profile.did}
                                        </p>
                                        <div className="flex gap-2 mt-4">
                                            <div className="badge badge-red">Level 1 Voyager</div>
                                            <div className="badge badge-gray">Early Adopter</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoCard label="Wallet Address" value={address ?? ''} mono />
                                    <InfoCard label="Reputation Score" value={profile.reputationScore.toString()} highlight />
                                    <InfoCard label="Registration Date" value={new Date(Number(profile.registeredAt) * 1000).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                                    <InfoCard label="Account Status" value="Active & Verified" />
                                </div>
                            </div>
                        ) : (
                            <div className="glass p-10 border-white/10 glow-border animate-enter relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                    <User size={160} />
                                </div>

                                <h2 className="text-3xl font-black mb-2">Claim your DID</h2>
                                <p className="text-white/40 mb-8 max-w-md">
                                    Establish your presence on-chain. This will create a permanent, non-custodial identity linked to your wallet.
                                </p>

                                <form onSubmit={handleRegister} className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/30">Display Name</label>
                                        <input
                                            className="input-field py-4 px-5 text-lg"
                                            placeholder="Satoshi Nakamoto"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/30">Short Bio</label>
                                        <textarea
                                            className="input-field py-4 px-5 min-h-[120px]"
                                            placeholder="Web3 builder, artist, or adventurer..."
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            style={{ resize: 'none' }}
                                        />
                                    </div>

                                    {isSuccess && (
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400">
                                            <CheckCircle2 size={18} />
                                            <p className="text-sm font-semibold">Broadcast successful! Your identity is being minted.</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn-primary py-4 px-10 w-full md:w-auto text-lg hover:shadow-red-500/40"
                                        disabled={isPending || isConfirming}
                                    >
                                        {isPending || isConfirming ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={20} />
                                                <span>Initialize Identity</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </Section>
        </main>
    )
}

function FeatureSmall({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-4 items-start group">
            <div className="mt-1 text-red-500 group-hover:scale-110 transition-transform">{icon}</div>
            <div>
                <h4 className="text-white font-bold text-sm tracking-tight">{title}</h4>
                <p className="text-white/30 text-xs">{desc}</p>
            </div>
        </div>
    )
}

function InfoCard({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl group hover:border-white/10 transition-colors">
            <div className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20 mb-2">{label}</div>
            <div className={`text-sm ${mono ? 'font-mono tracking-tighter' : 'font-bold'} ${highlight ? 'text-4xl md:text-5xl text-red-500 font-black mt-1' : 'text-white/90'} break-all`}>
                {value}
            </div>
        </div>
    )
}
