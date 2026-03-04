'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Reveal } from '@/components/ui/reveal'

const stats = [
    { label: 'ACTIVE IDENTITIES', value: 1284, suffix: '+' },
    { label: 'SECURED MISSIONS', value: 342, suffix: '' },
    { label: 'ESCROW VOLUME', value: 42, prefix: '$', suffix: 'K' },
    { label: 'TRUST SCORE', value: 99.8, suffix: '%' },
]

export function StatsSection() {
    return (
        <section className="relative w-full bg-black overflow-hidden py-16 md:py-20">
            {/* Top/bottom border lines */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--avax-red)]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--avax-red)]/20 to-transparent" />

            {/* Subtle dot grid texture */}
            <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-nowrap md:grid md:grid-cols-4 gap-6 md:gap-0 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 hide-scrollbar scroll-pl-6 snap-x">
                    {stats.map((stat, i) => (
                        <Reveal
                            key={i}
                            delay={i * 0.1}
                            direction="up"
                            className="min-w-[240px] md:min-w-0 snap-start"
                        >
                            <div className="relative p-6 md:p-8 flex flex-col items-center group">
                                {/* Stat label */}
                                <span className="text-[10px] font-black tracking-[0.3em] text-[var(--avax-red)] opacity-60 mb-4 uppercase">
                                    {stat.label}
                                </span>

                                {/* Stat value */}
                                <div className="flex items-baseline gap-1 text-4xl md:text-6xl font-black tracking-tighter text-white">
                                    {stat.prefix && <span className="text-[var(--avax-red)]">{stat.prefix}</span>}
                                    <AnimatedCounter target={stat.value} decimals={stat.value % 1 !== 0 ? 1 : 0} />
                                    {stat.suffix && <span className="text-[var(--avax-red)]">{stat.suffix}</span>}
                                </div>

                                {/* Glowing Red Underline */}
                                <div className="mt-6 w-12 h-[2px] bg-white/[0.06] rounded-full overflow-hidden group-hover:w-3/4 transition-all duration-700 ease-out">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        whileInView={{ x: '0%' }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full w-full bg-gradient-to-r from-[var(--avax-red)] to-[var(--avax-red)]/30 shadow-[0_0_12px_rgba(232,65,66,0.5)]"
                                    />
                                </div>

                                {/* Vertical divider - desktop only */}
                                {i < stats.length - 1 && (
                                    <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
                                )}
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    )
}