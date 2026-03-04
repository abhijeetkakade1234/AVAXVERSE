'use client'

import { useRouter } from 'next/navigation'
import { Rocket, Briefcase } from 'lucide-react'
import { AnimatedShaderHero } from '@/components/ui/animated-shader-hero'

export function HeroSection() {
    const router = useRouter()

    return (
        <section className="relative w-full min-h-[800px] overflow-hidden shrink-0 flex flex-col items-center" style={{ height: '100svh' }}>
            <AnimatedShaderHero
                // trustBadge={{
                //     text: 'Avalanche C-Chain Mainnet Ready',
                //     icon: <Shield size={13} />,
                // }}
                headline={{ line1: 'AVAXVERSE', line2: 'Web3 Super App' }}
                subtitle="Unifying Identity, Freelancing, DeFi & Governance. The operating layer for the future of work."
                buttons={{
                    primary: {
                        text: 'Initialize ID',
                        icon: <Rocket size={17} />,
                        onClick: () => router.push('/profile'),
                    },
                    secondary: {
                        text: 'Enter Market',
                        icon: <Briefcase size={17} />,
                        onClick: () => router.push('/jobs'),
                    },
                }}
            />
        </section>
    )
}
