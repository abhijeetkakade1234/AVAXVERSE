'use client';

import React from 'react'
import { useRouter } from 'next/navigation'
import { Reveal } from '@/components/ui/reveal'

export function CtaSection() {
    const router = useRouter();

    return (
        <section className="relative w-full py-40 md:py-64 flex flex-col items-center justify-center overflow-hidden bg-black">
            {/* Massive Floor Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[var(--avax-red)]/10 blur-[180px] rounded-full pointer-events-none" />
            {/* Additional ambient particles */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--avax-red)]/20 rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-[var(--avax-red)]/15 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto space-y-12 md:space-y-16">
                {/* Label */}
                <Reveal direction="up">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--avax-red)]/20 bg-[var(--avax-red)]/5 backdrop-blur-md">
                        <span className="text-[10px] font-black tracking-[0.3em] text-[var(--avax-red)] uppercase">Start Journey</span>
                    </div>
                </Reveal>

                {/* Heading */}
                <Reveal direction="up" delay={0.1}>
                    <h2 className="text-5xl md:text-8xl lg:text-[9rem] font-black tracking-tighter leading-[0.85] text-white">
                        Your future is{' '}
                        <br className="hidden md:block" />
                        <span className="gradient-text italic">on-chain</span>.
                    </h2>
                </Reveal>

                {/* Subtext */}
                <Reveal direction="up" delay={0.25} blur>
                    <p className="text-lg md:text-2xl text-[var(--avax-muted)] font-light leading-relaxed max-w-3xl">
                        Join the decentralized workforce. Permissionless and sovereign. Build your reputation, earn trustlessly, govern collectively.
                    </p>
                </Reveal>

                {/* Buttons */}
                <Reveal direction="up" delay={0.4}>
                    <div className="flex flex-col sm:flex-row gap-6 pt-8">
                        <button
                            onClick={() => router.push('/profile')}
                            className="group relative px-12 md:px-16 py-5 md:py-6 rounded-2xl font-bold text-lg md:text-xl text-white bg-[var(--avax-red)] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_80px_-15px_rgba(232,65,66,0.4)]"
                        >
                            {/* Shimmer sweep */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="relative">Launch Identity</span>
                        </button>

                        <button
                            onClick={() => router.push('/jobs')}
                            className="px-12 md:px-16 py-5 md:py-6 rounded-2xl font-bold text-lg md:text-xl text-white border border-white/10 hover:bg-white/5 hover:border-[var(--avax-red)]/30 hover:-translate-y-1 transition-all duration-500"
                        >
                            Explore Missions
                        </button>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}
