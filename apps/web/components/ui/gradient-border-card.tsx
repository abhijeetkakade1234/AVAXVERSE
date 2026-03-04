'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface GradientBorderCardProps {
    children: React.ReactNode
    className?: string
    glowOnHover?: boolean
}

export function GradientBorderCard({
    children,
    className,
    glowOnHover = true,
}: GradientBorderCardProps) {
    return (
        <div
            className={cn(
                'relative group rounded-2xl p-[1px] overflow-hidden',
                'bg-gradient-to-br from-[var(--avax-border)] via-transparent to-[var(--avax-border)]',
                glowOnHover && 'hover:from-[var(--avax-red)] hover:via-[rgba(232,65,66,0.3)] hover:to-[var(--avax-red)]',
                'transition-all duration-700',
            )}
        >
            {/* Hover glow */}
            {glowOnHover && (
                <div className="absolute -inset-1 bg-[var(--avax-red)] opacity-0 group-hover:opacity-[0.08] blur-2xl transition-opacity duration-700 pointer-events-none" />
            )}

            <div
                className={cn(
                    'relative rounded-[15px] bg-[var(--avax-surface)] h-full',
                    className
                )}
            >
                {children}
            </div>
        </div>
    )
}
