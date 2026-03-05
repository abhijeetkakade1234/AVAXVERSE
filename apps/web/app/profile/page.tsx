'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import {
    User,
    BadgeCheck,
    Loader2,
    ShieldCheck,
    Zap,
    Edit3,
    Twitter,
    Github,
    Camera,
    Save,
    X,
    TrendingUp,
    Award
} from 'lucide-react'
import { Section } from '@/components/ui'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { IDENTITY_REGISTRY_ABI } from '@/lib/abis'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface ProfileData {
    exists: boolean;
    name: string;
    pfp: string;
    metadataURI: string;
    reputationScore: bigint;
    registeredAt: bigint;
    did: string;
}

export default function ProfilePage() {
    const { address, isConnected } = useAccount()
    const [isEditing, setIsEditing] = useState(false)

    // Form States
    const [name, setName] = useState('')
    const [pfp, setPfp] = useState('')
    const [bio, setBio] = useState('')
    const [twitter, setTwitter] = useState('')
    const [github, setGithub] = useState('')
    const [skills, setSkills] = useState<string[]>([])
    const [newSkill, setNewSkill] = useState('')

    const { data: profileResult } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getProfile',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const profile = profileResult as ProfileData | undefined

    // Sync form with profile data when it loads
    useEffect(() => {
        if (profile?.exists && !isEditing) {
            // Delaying state updates strictly to the next tick avoids cascading synchronous renders
            setTimeout(() => {
                setName(prev => prev !== profile.name ? profile.name : prev)
                setPfp(prev => prev !== (profile.pfp || '') ? (profile.pfp || '') : prev)
                try {
                    const metaContent = profile.metadataURI.replace('data:application/json,', '')
                    const meta = JSON.parse(metaContent)
                    setBio(prev => prev !== (meta.bio || '') ? (meta.bio || '') : prev)
                    setTwitter(prev => prev !== (meta.socials?.twitter || '') ? (meta.socials?.twitter || '') : prev)
                    setGithub(prev => prev !== (meta.socials?.github || '') ? (meta.socials?.github || '') : prev)

                    // For skills array, do a simple stringified comparison
                    setSkills(prev => JSON.stringify(prev) !== JSON.stringify(meta.skills || []) ? (meta.skills || []) : prev)
                } catch {
                    setBio(prev => prev !== profile.metadataURI ? profile.metadataURI : prev)
                }
            }, 0)
        }
    }, [profile, isEditing])

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

    function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        const metadata = JSON.stringify({
            bio,
            socials: { twitter, github },
            skills
        })

        if (!profile?.exists) {
            writeContract({
                address: CONTRACT_ADDRESSES.IdentityRegistry,
                abi: IDENTITY_REGISTRY_ABI,
                functionName: 'register',
                args: [name, pfp, `data:application/json,${metadata}`],
            })
        } else {
            writeContract({
                address: CONTRACT_ADDRESSES.IdentityRegistry,
                abi: IDENTITY_REGISTRY_ABI,
                functionName: 'updateProfile',
                args: [name, pfp, `data:application/json,${metadata}`],
            })
        }
    }

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()])
            setNewSkill('')
        }
    }

    const removeSkill = (s: string) => {
        setSkills(skills.filter(sk => sk !== s))
    }

    if (!isConnected) {
        return (
            <main className="min-h-screen pt-48 pb-32 dot-grid bg-[#111118] text-white">
                <Section>
                    <div className="glass p-12 text-center border-white/5 glow-border max-w-2xl mx-auto">
                        <User size={64} className="mx-auto mb-6 text-white/10" />
                        <h2 className="text-3xl font-black mb-4">Identity Restricted</h2>
                        <p className="text-white/40 mb-8 max-w-sm mx-auto text-lg">
                            Establish your secure connection to the AVAXVERSE protocols.
                        </p>
                        <div className="inline-block transform transition-transform hover:scale-105 active:scale-95">
                            <ConnectButton />
                        </div>
                    </div>
                </Section>
            </main>
        )
    }

    return (
        <main className="min-h-screen pt-48 pb-32 dot-grid bg-[#111118] text-white">
            <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

            <Section>
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Left Column: Stats & Reputation */}
                    <div className="lg:w-1/3 w-full space-y-6">
                        <div className="glass-card p-10 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <TrendingUp size={160} />
                            </div>

                            <h3 className="text-white font-bold text-xl mb-8 flex items-center gap-2">
                                <Award className="text-red-500" /> Reputation Level
                            </h3>

                            <div className="text-7xl font-black text-red-500 mb-2">
                                {profile?.exists ? profile.reputationScore.toString() : '0'}
                            </div>
                            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-8">Score Points</div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    <span>Next Tier: Sentinel</span>
                                    <span>{profile?.exists ? Math.min(100, Number(profile.reputationScore) * 10) : '0'}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000"
                                        style={{ width: `${profile?.exists ? Math.min(100, Number(profile.reputationScore) * 10) : '0'}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl border-white/5 space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-white/30">Protocol Stats</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <StatItem label="Jobs Done" value="0" />
                                <StatItem label="Grown Level" value="1" />
                                <StatItem label="Voted" value="0" />
                                <StatItem label="Did" value={profile?.exists ? `#${profile.did.slice(0, 4)}` : 'N/A'} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Profile Info & Edit */}
                    <div className="lg:w-2/3 w-full">
                        <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
                            {/* Banner / Header */}
                            <div className="h-48 bg-gradient-to-br from-red-600/20 to-blue-600/10 relative">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="absolute top-6 right-6 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 font-bold text-sm backdrop-blur-md"
                                >
                                    {isEditing ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Refine Identity</>}
                                </button>
                            </div>

                            <div className="px-10 pb-10">
                                <div className="relative -mt-20 mb-8 flex flex-col md:flex-row md:items-end gap-6">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-[#111118] bg-[#15151e] shadow-2xl relative">
                                            {pfp ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={pfp} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10">
                                                    <User size={64} />
                                                </div>
                                            )}
                                            {isEditing && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                    <Camera className="text-white" size={32} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 pb-2">
                                        {isEditing ? (
                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="text-4xl font-black bg-transparent border-b-2 border-red-500/50 focus:border-red-500 outline-none w-full max-w-md"
                                                placeholder="Enter Name..."
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-5xl font-black tracking-tight">{profile?.exists ? profile.name : 'Unknown Citizen'}</h1>
                                                {profile?.exists && <ShieldCheck className="text-red-500" size={28} />}
                                            </div>
                                        )}
                                        <div className="text-white/30 font-mono text-sm mt-2">{address}</div>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                    <Camera size={12} /> Profile Picture URL
                                                </label>
                                                <input
                                                    value={pfp}
                                                    onChange={(e) => setPfp(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-colors"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                    <Twitter size={12} /> Twitter Handle
                                                </label>
                                                <input
                                                    value={twitter}
                                                    onChange={(e) => setTwitter(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-colors"
                                                    placeholder="@username"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                    <Github size={12} /> GitHub Profile
                                                </label>
                                                <input
                                                    value={github}
                                                    onChange={(e) => setGithub(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-colors"
                                                    placeholder="username"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Bio / Description</label>
                                                <textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-colors h-12 resize-none"
                                                    placeholder="Tell your story..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                <Zap size={12} /> Specializations
                                            </label>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {skills.map(skill => (
                                                    <span key={skill} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                                                        {skill}
                                                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white"><X size={14} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    value={newSkill}
                                                    onChange={(e) => setNewSkill(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none"
                                                    placeholder="Add skill (Rust, UI/UX, Audit...)"
                                                />
                                                <button type="button" onClick={addSkill} className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-sm font-bold">Add</button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isPending || isConfirming}
                                            className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-white/10 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/20"
                                        >
                                            {isPending || isConfirming ? <><Loader2 className="animate-spin" /> Transmission in Progress...</> : <><Save /> Sync to Blockchain</>}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-12 animate-in fade-in duration-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">The Narrative</h4>
                                                <p className="text-xl text-white/60 leading-relaxed font-medium">
                                                    {bio || 'No archival data found for this entity. The narrative remains unwritten.'}
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Skill Vectors</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {skills.length > 0 ? skills.map(skill => (
                                                        <span key={skill} className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-xs font-bold hover:border-red-500/30 transition-colors">
                                                            {skill}
                                                        </span>
                                                    )) : (
                                                        <span className="text-white/20 italic text-sm">No specialized training records found.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-10 border-t border-white/5">
                                            {twitter && (
                                                <a href={`https://x.com/${twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold text-sm">
                                                    <Twitter size={18} className="text-blue-400" /> Twitter
                                                </a>
                                            )}
                                            {github && (
                                                <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold text-sm">
                                                    <Github size={18} /> GitHub
                                                </a>
                                            )}
                                            {profile?.exists && (
                                                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-green-500/5 border border-green-500/20 text-green-500 font-bold text-sm ml-auto">
                                                    <BadgeCheck size={18} /> Verified Identity
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </main>
    )
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{label}</div>
            <div className="text-xl font-black text-white/80">{value}</div>
        </div>
    )
}
