'use client'

import React from 'react'
import Link from 'next/link'
import { useReadContract } from 'wagmi'
import { ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { IDENTITY_REGISTRY_ABI, ESCROW_FACTORY_ABI } from '@/lib/abis'
import { shortAddr } from '@/app/missions/utils'

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

// ⚡ Bolt Performance Optimization:
// Memoizing PartyProfileCard prevents expensive re-renders (involving Wagmi useReadContract hooks)
export const PartyProfileCard = React.memo(function PartyProfileCard({ role, addr }: { role: string; addr: string }) {
    const { data: profile } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getProfile',
        args: [addr as `0x${string}`],
    }) as { data: Profile | undefined }

    const { data: userMissions } = useReadContract({
        address: CONTRACT_ADDRESSES.EscrowFactory,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'getJobsByUser',
        args: [addr as `0x${string}`],
    }) as { data: bigint[] | undefined }

    const pfpSrc = profile?.pfp && profile.pfp.length > 0 ? profile.pfp : null
    const initials = (profile?.exists ? profile.name : shortAddr(addr)).slice(0, 2).toUpperCase()

    return (
        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 group hover:border-primary/30 transition-all duration-300">
            <div className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark mb-3">{role}</div>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20">
                    {pfpSrc
                        /* eslint-disable-next-line @next/next/no-img-element */
                        ? <img src={pfpSrc} alt={profile?.name ?? addr} className="w-full h-full object-cover" />
                        : initials
                    }
                </div>
                <div className="min-w-0">
                    <Link href={`/profile/${addr}`} className="text-xl font-bold text-primary hover:underline leading-tight block truncate">
                        {profile?.exists ? profile.name : shortAddr(addr)}
                    </Link>
                    <div className="text-xs text-text-muted-light dark:text-text-muted-dark font-mono">{shortAddr(addr)}</div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Reputation</div>
                    <div className="text-lg font-black">{Number(profile?.reputationScore ?? 0n)}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Past Missions</div>
                    <div className="text-lg font-black">{userMissions?.length ?? 0}</div>
                </div>
            </div>
            <Link href={`/profile/${addr}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                View Profile <ExternalLink size={13} />
            </Link>
        </div>
    )
})
