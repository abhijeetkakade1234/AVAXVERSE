'use client'

import { useRouter } from 'next/navigation'

export function CtaSection() {
    const router = useRouter()

    return (
        <div>
            <h2>READY TO INITIATE?</h2>
            <p>Join the decentralized workforce. Permissionless and sovereign. Your future is on-chain.</p>
            <button
                onClick={() => router.push('/profile')}
            >
                Connect Identity
            </button>
            <button
                onClick={() => router.push('/jobs')}
            >
                Enter Board
            </button>
        </div>
    )
}
