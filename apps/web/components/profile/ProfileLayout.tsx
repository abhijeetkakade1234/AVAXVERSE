import React, { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { type Abi, isAddress } from 'viem'
import { notFound } from 'next/navigation'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { IDENTITY_REGISTRY_ABI, ESCROW_FACTORY_ABI, ESCROW_ABI } from '@/lib/abis'
import Navbar from '@/components/Navbar'
import ProfileSidebar from './ProfileSidebar'
import ProfileTab from './ProfileTab'
import AchievementsTab from './AchievementsTab'
import MissionsTab from './MissionsTab'
import SettingsTab from './SettingsTab'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Footer from '@/components/Footer'

interface ProfileData {
    exists: boolean;
    name: string;
    pfp: string;
    metadataURI: string;
    reputationScore: bigint;
    registeredAt: bigint;
    did: string;
}

interface JobData {
    id: number;
    escrow: `0x${string}`;
    client: `0x${string}`;
    freelancer: `0x${string}`;
    title: string;
    budget: bigint;
    createdAt: bigint;
    status: number;
}

interface ProfileLayoutProps {
    targetAddress: `0x${string}` | undefined;
}

export default function ProfileLayout({ targetAddress }: ProfileLayoutProps) {
    const { address: connectedAddress } = useAccount()
    const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'missions' | 'settings'>('profile')

    // 0. Validate Address
    if (targetAddress && !isAddress(targetAddress)) {
        notFound()
    }

    // 1. Fetch Profile
    const {
        data: profileResult,
        isLoading: isProfileLoadingRaw,
        isFetched: isProfileFetched,
        error: profileError,
        refetch: refetchProfile
    } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getProfile',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
            retry: 1, // Only retry once for local dev errors
        },
    })

    const isProfileLoading = isProfileLoadingRaw && !isProfileFetched;
    const profile = profileResult as ProfileData | undefined
    const isOwnProfile = connectedAddress?.toLowerCase() === targetAddress?.toLowerCase()

    // 1.5 Auto-switch to settings if profile doesn't exist and it's own profile
    useEffect(() => {
        if (isProfileFetched && !profile?.exists && isOwnProfile) {
            const timer = setTimeout(() => {
                setActiveTab('settings');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isProfileFetched, profile?.exists, isOwnProfile]);

    // 2. Fetch Job IDs
    const { data: jobIds } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJobsByUser',
        args: targetAddress ? [targetAddress] : undefined,
        query: { enabled: !!targetAddress },
    })

    // 3. Fetch Job Details & Statuses via Multicall
    const jobDetailCalls = useMemo(() => {
        if (!jobIds) return []
        return (jobIds as bigint[]).flatMap((id) => [
            {
                address: CONTRACT_ADDRESSES.EscrowFactory,
                abi: ESCROW_FACTORY_ABI,
                functionName: 'getJob',
                args: [id],
            },
        ])
    }, [jobIds])

    const { data: jobDetailsResults } = useReadContracts({
        contracts: jobDetailCalls as { address: `0x${string}`; abi: Abi; functionName: string; args: unknown[] }[],
        query: { enabled: jobDetailCalls.length > 0 },
    })

    // 4. Fetch Statuses for those escrows
    const statusCalls = useMemo(() => {
        if (!jobDetailsResults) return []
        return jobDetailsResults
            .filter((res): res is { status: 'success'; result: { escrow: `0x${string}` } } => res.status === 'success')
            .map((res) => ({
                address: res.result.escrow,
                abi: ESCROW_ABI,
                functionName: 'getState',
            }))
    }, [jobDetailsResults])

    const { data: statusResults } = useReadContracts({
        contracts: statusCalls as { address: `0x${string}`; abi: Abi; functionName: string }[],
        query: { enabled: statusCalls.length > 0 },
    })

    // 5. Combine everything into a JobData array
    const allJobs: JobData[] = useMemo(() => {
        if (!jobIds || !jobDetailsResults || !statusResults || !targetAddress) return []
        const jobs: JobData[] = []
        let statusIdx = 0
        const idArray = jobIds as bigint[]

        for (let i = 0; i < idArray.length; i++) {
            const detailRes = jobDetailsResults[i] as { status: string; result: Record<string, unknown> }
            if (detailRes.status === 'success') {
                const statusRes = statusResults[statusIdx] as { status: string; result: unknown }
                const jobBase = detailRes.result as unknown as JobData

                const isClient = jobBase.client.toLowerCase() === targetAddress.toLowerCase()
                const isFreelancer = jobBase.freelancer.toLowerCase() === targetAddress.toLowerCase()

                // Only show jobs if they are the client or the confirmed selected freelancer
                if (isClient || isFreelancer) {
                    jobs.push({
                        ...jobBase,
                        id: Number(idArray[i]),
                        status: statusRes?.status === 'success' ? (statusRes.result as number) : 0,
                    })
                }
                statusIdx++
            }
        }
        // Sort by newest first
        return jobs.sort((a, b) => Number(b.createdAt - a.createdAt))
    }, [jobIds, jobDetailsResults, statusResults, targetAddress])

    if (!targetAddress) {
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

    // Handle Connection Errors (Node is down)
    if (profileError) {
        return (
            <>
                <Navbar />
                <main className="min-h-[calc(100vh-80px)] pt-32 pb-32 flex items-center justify-center">
                    <div className="glass-panel text-center border-red-500/20 shadow-2xl max-w-lg w-full mx-auto rounded-3xl p-12 relative overflow-hidden bg-red-500/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                        <div className="relative z-10">
                            <span className="material-symbols-outlined text-6xl text-red-500/40 mb-6 block">cloud_off</span>
                            <h2 className="text-3xl font-black mb-4 dark:text-white text-gray-900 tracking-tight">Node Unreachable</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto text-lg leading-relaxed">
                                We couldn&apos;t connect to the blockchain node at <code className="bg-black/20 px-2 py-1 rounded">127.0.0.1:8545</code>.
                                Please ensure your local node (Hardhat/Anvil) is running and try again.
                            </p>
                            <button
                                onClick={() => refetchProfile()}
                                className="bg-[#8B82F6] hover:bg-[#8B82F6]/90 text-white py-3 px-8 rounded-2xl font-bold shadow-lg transition-all"
                            >
                                Retry Connection
                            </button>
                        </div>
                    </div>
                </main>
            </>
        )
    }

    // Determine values for UI placeholders
    const displayName = profile?.exists ? profile.name || 'Anonymous' : 'Unregistered'
    const displayPfp = profile?.exists && profile.pfp ? profile.pfp : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyNDyh0o4T-h5lq_CvLTwkGYW6jT9ScebzSFfzGMjJriawSOpU-0Rn5aOMMNq8IK1pcSBQA8GlaOlnOEv8tVzfHlkgVvlgS4Z2FKnNYaC_zSD25Lv2kejSlnWiunSleIDeRHrXr-AC6DxLf6Jcy7UgitB5nwUUGigOkXO6dbVFIZL1gLbDy6-xf7DnGhU7DmgqCfOIRMpM7GBBiN7hbYHMXFESQCstHCE1gt68rfMYBkwgET_w88P-2EeWkzgaxu9ed96JJBEjBZw'

    // Calculate Rank Metrics
    const rawReputation = Number(profile?.reputationScore || 0);
    const displayReputation = profile?.exists ? rawReputation.toString() : '0'
    const currentLevel = Math.max(1, Math.floor(rawReputation / 200) + 1);
    const trustScore = Math.min(10.0, 5.0 + (rawReputation / 1000) * 5.0).toFixed(1);
    const globalRank = profile?.exists ? Math.max(1, 10000 - Math.floor(rawReputation * 12.5)) : null;

    const RANKS = [
        { name: 'Apprentice', min: 0 },
        { name: 'Voyager', min: 100 },
        { name: 'Master', min: 250 },
        { name: 'Elite', min: 500 },
        { name: 'Grandmaster', min: 1000 },
        { name: 'Legend', min: 2500 },
    ];

    const currentRankIdx = [...RANKS].reverse().findIndex(r => rawReputation >= r.min);
    const currentRank = RANKS[RANKS.length - 1 - currentRankIdx] || RANKS[0];
    const nextRank = RANKS[RANKS.length - currentRankIdx] || null;

    const progressToNext = nextRank
        ? Math.floor(((rawReputation - currentRank.min) / (nextRank.min - currentRank.min)) * 100)
        : 100;

    let parsedSocials = { twitter: '', github: '' };
    let parsedSkills: string[] = [];
    let parsedBio = '';
    if (profile?.exists && profile.metadataURI) {
        try {
            const metaStr = profile.metadataURI.replace('data:application/json,', '');
            const metaObj = JSON.parse(metaStr);
            parsedSocials = metaObj.socials || { twitter: '', github: '' };
            parsedSkills = metaObj.skills || [];
            parsedBio = metaObj.bio || '';
        } catch { /* ignore */ }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-500">
                <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-8 gap-8 relative z-10">
                    <ProfileSidebar
                        profileExists={!!profile?.exists}
                        displayName={displayName}
                        displayPfp={displayPfp}
                        parsedBio={parsedBio}
                        parsedSocials={parsedSocials}
                        parsedSkills={parsedSkills}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isOwnProfile={isOwnProfile}
                        totalJobs={allJobs.length}
                        reputationScore={rawReputation}
                        targetAddress={targetAddress}
                    />

                    <main className="flex-1 min-w-0">
                        {activeTab === 'profile' && (
                            <ProfileTab
                                profileExists={!!profile?.exists}
                                displayReputation={displayReputation}
                                currentLevel={currentLevel}
                                trustScore={trustScore}
                                globalRank={globalRank}
                                reputationScore={rawReputation}
                                currentRankName={currentRank.name}
                                nextRankName={nextRank?.name || 'Legendary Status'}
                                progressToNext={progressToNext}
                            />
                        )}

                        {activeTab === 'achievements' && (
                            <AchievementsTab
                                totalJobs={allJobs.length}
                                reputationScore={rawReputation}
                            />
                        )}

                        {activeTab === 'missions' && (
                            <MissionsTab
                                allJobs={allJobs}
                            />
                        )}

                        {activeTab === 'settings' && isOwnProfile && (
                            <SettingsTab
                                profile={profile}
                                isProfileLoading={isProfileLoading}
                                displayName={displayName}
                                refetchProfile={refetchProfile}
                                setActiveTab={setActiveTab}
                            />
                        )}
                    </main>
                </div>
                <section className="px-4 md:px-8 py-20 mt-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        <Footer />
                    </div>
                </section>
            </div>
        </>
    )
}
