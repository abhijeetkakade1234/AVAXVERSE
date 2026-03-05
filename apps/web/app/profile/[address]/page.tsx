'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import ProfileLayout from '@/components/profile/ProfileLayout'

export default function PublicProfilePage() {
    const params = useParams()
    const address = params.address as `0x${string}` | undefined

    return <ProfileLayout targetAddress={address} />
}
