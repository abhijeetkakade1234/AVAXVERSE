'use client'

import { useRouter } from 'next/navigation'
import { Rocket, Briefcase, Shield } from 'lucide-react'
import { AnimatedShaderHero } from '@/components/ui/animated-shader-hero'

export function HeroSection() {
    const router = useRouter()

    return (
        <section className="relative h-[100svh] min-h-[800px] w-full overflow-hidden shrink-0 flex flex-col items-center">
            <AnimatedShaderHero
                trustBadge={{
                    text: 'Avalanche C-Chain Mainnet Ready',
                    icon: <Shield size={13} />,
                }}
                headline={{ line1: 'DAOs. Jobs.', line2: 'Real Reputation.' }}
                subtitle="The unified operating layer for the future of work. Secure identities, trustless payments, and decentralized growth."
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
