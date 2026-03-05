'use client'

import { useAccount } from 'wagmi'
import ProfileLayout from '@/components/profile/ProfileLayout'

export default function MyProfilePage() {
    const { address } = useAccount()

    return <ProfileLayout targetAddress={address} />
}
