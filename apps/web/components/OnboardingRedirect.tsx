'use client'

interface ProfileData {
    exists: boolean;
    name: string;
    pfp: string;
    metadataURI: string;
    reputationScore: bigint;
    registeredAt: bigint;
    did: string;
}

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { IDENTITY_REGISTRY_ABI } from '@/lib/abis'

export default function OnboardingRedirect() {
    const router = useRouter()
    const pathname = usePathname()
    const { address, isConnected } = useAccount()

    const { data: profileResult, isFetched } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'getProfile',
        args: address ? [address] : undefined,
        query: { enabled: !!address && !!isConnected },
    })

    useEffect(() => {
        // If connected, but no profile exists, and not already on the profile page
        // we redirect to /profile to force registration.
        if (isConnected && isFetched && profileResult) {
            const profile = profileResult as ProfileData
            const isUnregistered = !profile.exists

            if (isUnregistered && pathname !== '/profile') {
                router.push('/profile')
            }
        }
    }, [isConnected, isFetched, profileResult, pathname, router])

    return null
}
