'use client'

import React from 'react'
import { Reveal } from './reveal'

type BadgeVariant = 'red' | 'gray' | 'green' | 'blue'

interface SectionHeaderProps {
    badge?: string
    badgeVariant?: BadgeVariant
    title: React.ReactNode
    subtitle?: string
    align?: 'center' | 'left'
    className?: string
}

export function SectionHeader({
    badge,
    badgeVariant = 'gray',
    title,
    subtitle,
    align = 'center',
    className = '',
}: SectionHeaderProps) {
    const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

    return (
        <div className={`flex flex-col ${alignment} ${className}`}>
            {badge && (
                <Reveal delay={0} blur>
                    <div className={`badge badge-${badgeVariant} mb-6`}>
                        {badge}
                    </div>
                </Reveal>
            )}

            <Reveal delay={0.1} blur>
                <h2 className={`text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] ${align === 'center' ? '' : 'max-w-2xl'}`}>
                    {title}
                </h2>
            </Reveal>

            {subtitle && (
                <Reveal delay={0.25} blur>
                    <p className={`mt-8 text-xl md:text-2xl text-[var(--avax-muted)] font-light leading-relaxed ${align === 'center' ? 'max-w-3xl' : 'max-w-xl'}`}>
                        {subtitle}
                    </p>
                </Reveal>
            )}
        </div>
    )
}
