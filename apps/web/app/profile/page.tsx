'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Loader2, X, Twitter, Github } from 'lucide-react'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { IDENTITY_REGISTRY_ABI } from '@/lib/abis'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Navbar from '@/components/Navbar'

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

    const { data: profileResult, refetch } = useReadContract({
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
            setTimeout(() => {
                setName(prev => prev !== profile.name ? profile.name : prev)
                setPfp(prev => prev !== (profile.pfp || '') ? (profile.pfp || '') : prev)
                try {
                    const metaContent = profile.metadataURI.replace('data:application/json,', '')
                    const meta = JSON.parse(metaContent)
                    setBio(prev => prev !== (meta.bio || '') ? (meta.bio || '') : prev)
                    setTwitter(prev => prev !== (meta.socials?.twitter || '') ? (meta.socials?.twitter || '') : prev)
                    setGithub(prev => prev !== (meta.socials?.github || '') ? (meta.socials?.github || '') : prev)
                    setSkills(prev => JSON.stringify(prev) !== JSON.stringify(meta.skills || []) ? (meta.skills || []) : prev)
                } catch {
                    setBio(prev => prev !== profile.metadataURI ? profile.metadataURI : prev)
                }
            }, 0)
        }
    }, [profile, isEditing])

    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash })

    // Log errors for debugging
    useEffect(() => {
        if (writeError) console.error("Smart Contract Write Error:", writeError);
        if (receiptError) console.error("Transaction Receipt Error:", receiptError);
        if (hash) console.log("Transaction Hash:", hash);
        if (isSuccess) console.log("Transaction Confirmed!");
    }, [writeError, receiptError, hash, isSuccess]);

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                setIsEditing(false)
                refetch()
            }, 0)
        }
    }, [isSuccess, refetch])

    function handleSave(e: React.FormEvent) {
        e.preventDefault()
        console.log("Submitting Profile Data:", { name, pfp, bio, twitter, github, skills });

        if (!name.trim()) {
            console.error("Name is required.");
            return;
        }

        const metadata = JSON.stringify({
            bio,
            socials: { twitter, github },
            skills
        })

        try {
            if (!profile?.exists) {
                console.log("Registering new profile...");
                writeContract({
                    address: CONTRACT_ADDRESSES.IdentityRegistry,
                    abi: IDENTITY_REGISTRY_ABI,
                    functionName: 'register',
                    args: [name, pfp, `data:application/json,${metadata}`],
                })
            } else {
                console.log("Updating existing profile...");
                writeContract({
                    address: CONTRACT_ADDRESSES.IdentityRegistry,
                    abi: IDENTITY_REGISTRY_ABI,
                    functionName: 'updateProfile',
                    args: [name, pfp, `data:application/json,${metadata}`],
                })
            }
        } catch (err) {
            console.error("Caught error during writeContract invocation:", err);
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
            <>
                <Navbar />
                <main className="min-h-[calc(100vh-80px)] pt-32 pb-32 flex items-center justify-center">
                    <div className="glass-panel text-center border-white/5 shadow-2xl max-w-lg w-full mx-auto rounded-3xl p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B82F6]/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                        <div className="relative z-10">
                            <span className="material-symbols-outlined text-6xl text-white/20 mb-6 block">shield_lock</span>
                            <h2 className="text-3xl font-black mb-4 dark:text-white text-gray-900 tracking-tight">Identity Restricted</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto text-lg leading-relaxed">
                                Establish your secure connection to the AVAXVERSE protocols to view your Elite Profile.
                            </p>
                            <div className="flex justify-center transform transition-transform hover:scale-105 active:scale-95">
                                <ConnectButton showBalance={false} />
                            </div>
                        </div>
                    </div>
                </main>
            </>
        )
    }

    // Determine values for UI placeholders
    const displayName = profile?.exists ? profile.name || 'Anonymous' : 'Unregistered'
    const displayPfp = profile?.exists && profile.pfp ? profile.pfp : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyNDyh0o4T-h5lq_CvLTwkGYW6jT9ScebzSFfzGMjJriawSOpU-0Rn5aOMMNq8IK1pcSBQA8GlaOlnOEv8tVzfHlkgVvlgS4Z2FKnNYaC_zSD25Lv2kejSlnWiunSleIDeRHrXr-AC6DxLf6Jcy7UgitB5nwUUGigOkXO6dbVFIZL1gLbDy6-xf7DnGhU7DmgqCfOIRMpM7GBBiN7hbYHMXFESQCstHCE1gt68rfMYBkwgET_w88P-2EeWkzgaxu9ed96JJBEjBZw'
    const displayReputation = profile?.exists ? Number(profile.reputationScore).toString() : '0'

    let parsedSocials = { twitter: '', github: '' };
    let parsedSkills: string[] = [];
    if (profile?.exists && profile.metadataURI) {
        try {
            const metaStr = profile.metadataURI.replace('data:application/json,', '');
            const metaObj = JSON.parse(metaStr);
            parsedSocials = metaObj.socials || { twitter: '', github: '' };
            parsedSkills = metaObj.skills || [];
        } catch (e) { /* ignore */ }
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-8 gap-8 relative z-10">
                {/* SIDEBAR */}
                <aside className="w-72 flex-shrink-0 hidden lg:block">
                    <div className="sticky top-24 space-y-6">
                        <div className="glass-panel bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(30,27,75,0.4)] rounded-2xl p-6 shadow-sm border border-white/40 dark:border-white/10">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="relative mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-[#8B82F6]/30 object-cover" src={displayPfp} />
                                    {profile?.exists && (
                                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-[#1E1B4B] rounded-full"></div>
                                    )}
                                </div>
                                <h3 className="font-bold text-xl leading-tight dark:text-white text-gray-900">{displayName}</h3>
                                <span className="text-sm text-[#8B82F6] font-semibold">
                                    {profile?.exists ? 'Elite Contributor' : 'Guest'}
                                </span>
                                <div className="flex gap-3 mt-4">
                                    {parsedSocials.twitter && (
                                        <a className="p-2 bg-white/50 dark:bg-white/10 rounded-xl hover:text-[#8B82F6] transition-colors border border-white/20 dark:text-gray-300" href={`https://x.com/${parsedSocials.twitter}`} target="_blank" rel="noopener noreferrer">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                        </a>
                                    )}
                                    {parsedSocials.github && (
                                        <a className="p-2 bg-white/50 dark:bg-white/10 rounded-xl hover:text-[#8B82F6] transition-colors border border-white/20 dark:text-gray-300" href={`https://github.com/${parsedSocials.github}`} target="_blank" rel="noopener noreferrer">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {parsedSkills.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-widest mb-3">Specializations</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedSkills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-[#8B82F6]/10 text-[#8B82F6] rounded-full text-xs font-medium border border-[#8B82F6]/20">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <nav className="space-y-1">
                                <a className="flex items-center gap-3 px-4 py-3 bg-white/60 dark:bg-[#1E1B4B] rounded-xl font-medium shadow-sm border border-white/50 dark:border-white/5 text-[#8B82F6]" href="#">
                                    <span className="material-symbols-outlined text-xl">person_pin</span>
                                    Profile
                                </a>
                                <a className="flex items-center gap-3 px-4 py-3 hover:bg-white/40 dark:hover:bg-white/5 rounded-xl font-medium text-[#4B5563] dark:text-[#9CA3AF] transition-colors" href="#">
                                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                                    Achievements
                                </a>
                                <a className="flex items-center gap-3 px-4 py-3 hover:bg-white/40 dark:hover:bg-white/5 rounded-xl font-medium text-[#4B5563] dark:text-[#9CA3AF] transition-colors" href="#">
                                    <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
                                    Missions
                                </a>
                                <a className="flex items-center gap-3 px-4 py-3 hover:bg-white/40 dark:hover:bg-white/5 rounded-xl font-medium text-[#4B5563] dark:text-[#9CA3AF] transition-colors mt-8" href="#">
                                    <span className="material-symbols-outlined text-xl">settings</span>
                                    Settings
                                </a>
                            </nav>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 space-y-8 min-w-0">
                    <div className="relative w-full h-64 rounded-3xl overflow-hidden cinematic-shadow">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Cinematic Banner" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABcPunXsUHfXdwSaxe6TCjdEwYgRvCVp-R2a5i7Q4Ab6x7sqfLJLKA9l0wTzrvC6Vk8y7cc7guUUFlKBxy6yaHmLRyn_76h64saPzsIr2cuAce7SW7IBqr80-tmsGHaoLUHZ9fzkQZ4XM2xWhhIyzm_drwLZnMUzQ689gLfJoaPTfZ2k2Nbw_qEXTbCWfxrqzO3noiVL-ahLngKxMoAU26RQCCspE96kM-d2WCgNx7IggLNxwqsDHnP-OX0gbXMnsdO7KTbi6IQBE" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                                    <span className="material-symbols-outlined text-4xl text-white">shield_person</span>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white tracking-tight">Elite Identity Profile</h1>
                                    <p className="text-white/70 font-medium">Curated on-chain reputation for the Avalanche ecosystem</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between min-h-[320px]" style={{ background: 'linear-gradient(135deg, #4A44A2 0%, #1E1B4B 100%)' }}>
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-[#8B82F6]/30 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-4 backdrop-blur-md">
                                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                            Verified Elite
                                        </span>
                                        <h2 className="text-3xl font-bold mb-1">Soulbound Reputation</h2>
                                        <p className="text-white/70">Unified cross-subnet performance index.</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-6xl font-black gradient-text tracking-tighter">{displayReputation}</div>
                                        <div className="text-sm font-bold text-[#8B82F6] tracking-widest uppercase">Reputation Score</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-semibold text-white/80">Verification Level: <span className="text-white">Master</span></span>
                                        {profile?.reputationScore && profile.reputationScore > 900 ? (
                                            <span className="text-xs font-bold text-[#8B82F6] bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">Elite Reached</span>
                                        ) : (
                                            <span className="text-xs font-bold text-[#8B82F6] bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {Math.min(100, Math.max(0, Number(profile?.reputationScore || 0) / 10))}% to Elite
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                                        <div className="h-full bg-gradient-to-r from-[#8B82F6] to-fuchsia-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Number(profile?.reputationScore || 0) / 10)}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-white/40 uppercase font-bold tracking-widest">
                                        <span>Apprentice</span>
                                        <span>Voyager</span>
                                        <span>Master</span>
                                        <span className="text-white/80">Elite</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(30,27,75,0.4)] border border-white/40 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-[#8B82F6]/10 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-5xl text-[#8B82F6]">explore</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-1 dark:text-white text-gray-900">Voyager Rank</h3>
                            <p className="text-[#8B82F6] font-bold tracking-widest text-sm mb-6">LEVEL 4 CONTRIBUTOR</p>
                            <div className="w-full pt-6 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Global Rank</div>
                                    <div className="font-bold text-xl text-gray-900 dark:text-[#F3F4F6]">#412</div>
                                </div>
                                <div>
                                    <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Trust Score</div>
                                    <div className="font-bold text-xl text-gray-900 dark:text-[#F3F4F6]">9.8/10</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold dark:text-[#F3F4F6] text-gray-900">Verified Achievements</h3>
                                <button className="text-sm font-semibold text-[#8B82F6]">Browse NFT Gallery</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-panel bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl p-5 hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                    </div>
                                    <h4 className="font-bold mb-1 dark:text-[#F3F4F6] text-gray-900">Genesis Pioneer</h4>
                                    <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">First 1000 contract deployers on Avalanche C-Chain.</p>
                                </div>
                                <div className="glass-panel bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl p-5 hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">verified_user</span>
                                    </div>
                                    <h4 className="font-bold mb-1 dark:text-[#F3F4F6] text-gray-900">Audit Master</h4>
                                    <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">Verified reviewer for 15+ community subnets.</p>
                                </div>
                                <div className="glass-panel bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl p-5 hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">terminal</span>
                                    </div>
                                    <h4 className="font-bold mb-1 dark:text-[#F3F4F6] text-gray-900">Subnet Architect</h4>
                                    <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">Deployed production custom subnet infrastructure.</p>
                                </div>
                                <div className="glass-panel bg-white/40 dark:bg-white/5 border border-dashed border-[#8B82F6]/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:bg-[#8B82F6]/5 transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-[#8B82F6]/10 text-[#8B82F6] flex items-center justify-center mb-2 group-hover:rotate-90 transition-transform">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#8B82F6]">Claim New Badge</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold dark:text-[#F3F4F6] text-gray-900">Portfolio Feed</h3>
                                <button className="text-sm font-semibold text-[#8B82F6]">View History</button>
                            </div>
                            <div className="glass-panel bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl p-2 max-h-[380px] overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <div className="p-4 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold dark:text-[#F3F4F6] text-gray-900">Teleporter Integration</h4>
                                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase">Completed</span>
                                        </div>
                                        <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] mb-3">Implemented cross-chain messaging between Subnet A and C-Chain.</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] bg-[#8B82F6]/10 text-[#8B82F6] px-2 py-0.5 rounded font-bold uppercase tracking-tight">Smart Contracts</span>
                                            <span className="text-[10px] bg-[#8B82F6]/10 text-[#8B82F6] px-2 py-0.5 rounded font-bold uppercase tracking-tight">Go</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-black/5 dark:border-white/5 mx-4"></div>
                                    <div className="p-4 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold dark:text-[#F3F4F6] text-gray-900">Liquid Staking Dashboard</h4>
                                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase">Completed</span>
                                        </div>
                                        <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] mb-3">Frontend architecture for Avalanche staking derivatives.</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] bg-[#8B82F6]/10 text-[#8B82F6] px-2 py-0.5 rounded font-bold uppercase tracking-tight">UI/UX</span>
                                            <span className="text-[10px] bg-[#8B82F6]/10 text-[#8B82F6] px-2 py-0.5 rounded font-bold uppercase tracking-tight">React</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="glass-panel bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(30,27,75,0.4)] border border-white/40 dark:border-white/10 rounded-3xl p-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B82F6]/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
                            <div className="max-w-xl relative z-10 w-full">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B82F6]/10 text-[#8B82F6] text-xs font-bold uppercase tracking-wider mb-4">
                                    Identity Details
                                </span>
                                <h3 className="text-3xl font-bold mb-3 tracking-tight dark:text-[#F3F4F6] text-gray-900">Identity Management</h3>
                                <p className="text-[#4B5563] dark:text-[#9CA3AF] mb-8 text-lg">Your .avax handle is the core of your elite reputation. Manage your credentials and verified accounts below.</p>

                                {!isEditing ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/10">
                                                <label className="block text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase mb-2">Registered Handle</label>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-bold dark:text-[#F3F4F6] text-gray-900">{profile?.exists ? displayName : 'Not Registered'}</span>
                                                    <span className={`material-symbols-outlined ${profile?.exists ? 'text-green-500' : 'text-gray-400'}`}>
                                                        {profile?.exists ? 'verified' : 'cancel'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/10">
                                                <label className="block text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase mb-2">Verification Level</label>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-bold dark:text-[#F3F4F6] text-gray-900">{profile?.exists ? 'Master Lvl' : 'None'}</span>
                                                    <span className="material-symbols-outlined text-[#8B82F6]">workspace_premium</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full flex items-center justify-center gap-2 bg-[#8B82F6] hover:bg-[#8B82F6]/90 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-[#8B82F6]/20 transition-all transform hover:-translate-y-1"
                                        >
                                            <span className="material-symbols-outlined">security</span>
                                            {profile?.exists ? 'Update Identity Details' : 'Register Identity'}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSave} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    className="w-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                                    placeholder="e.g. Alex.avax"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">Avatar URL</label>
                                                <input
                                                    type="url"
                                                    value={pfp}
                                                    onChange={e => setPfp(e.target.value)}
                                                    className="w-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                                    placeholder="https://..."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">Bio / Metadata</label>
                                                <textarea
                                                    value={bio}
                                                    onChange={e => setBio(e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                                    placeholder="Tell the ecosystem about yourself..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                                                        <Twitter size={14} /> X (Twitter)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={twitter}
                                                        onChange={e => setTwitter(e.target.value)}
                                                        className="w-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                                        placeholder="username"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                                                        <Github size={14} /> GitHub
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={github}
                                                        onChange={e => setGithub(e.target.value)}
                                                        className="w-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                                        placeholder="username"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">Specializations</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newSkill}
                                                        onChange={e => setNewSkill(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                addSkill()
                                                            }
                                                        }}
                                                        className="flex-1 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                                        placeholder="e.g. Smart Contracts"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addSkill}
                                                        className="bg-white/20 dark:bg-[#1E1B4B] p-3 rounded-2xl hover:bg-white/40 dark:hover:bg-white/10 transition-colors border border-white/40 dark:border-white/10 text-[#8B82F6] flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined">add</span>
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {skills.map((skill, index) => (
                                                        <span key={index} className="px-3 py-1 bg-[#8B82F6]/10 text-[#8B82F6] rounded-full text-xs font-medium border border-[#8B82F6]/20 flex items-center gap-1 group">
                                                            {skill}
                                                            <button type="button" onClick={() => removeSkill(skill)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <X size={12} className="hover:text-red-400" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 py-4 px-6 rounded-2xl font-bold bg-white/20 dark:bg-[#1E1B4B] text-gray-900 dark:text-[#F3F4F6] hover:bg-white/40 dark:hover:bg-white/10 transition-colors border border-white/40 dark:border-white/10"
                                                disabled={isPending || isConfirming}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isPending || isConfirming || !name.trim()}
                                                className="flex-1 flex justify-center items-center gap-2 bg-[#8B82F6] hover:bg-[#8B82F6]/90 text-white py-4 px-6 rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isPending || isConfirming ? (
                                                    <Loader2 className="animate-spin" size={24} />
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined">save</span>
                                                        Sync to Blockchain
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        {(writeError || receiptError) && (
                                            <p className="text-red-500 text-sm font-medium mt-2 text-center">
                                                {writeError?.message?.split('\n')[0] || receiptError?.message?.split('\n')[0] || 'Transaction failed. Check console.'}
                                            </p>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    )
}
