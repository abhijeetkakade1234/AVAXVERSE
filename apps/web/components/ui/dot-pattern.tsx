'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface DotPatternProps {
    className?: string
    dotColor?: string
    dotSize?: number
    gap?: number
    fade?: 'top' | 'bottom' | 'both' | 'radial' | 'none'
}

export function DotPattern({
    className,
    dotColor = 'rgba(255,255,255,0.04)',
    dotSize = 1,
    gap = 24,
    fade = 'both',
}: DotPatternProps) {
    const maskMap: Record<string, string> = {
        top: 'linear-gradient(to bottom, transparent, black 40%)',
        bottom: 'linear-gradient(to top, transparent, black 40%)',
        both: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        radial: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
        none: 'none',
    }

    return (
        <div
            className={cn('absolute inset-0 pointer-events-none', className)}
            style={{
                backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
                backgroundSize: `${gap}px ${gap}px`,
                maskImage: maskMap[fade],
                WebkitMaskImage: maskMap[fade],
            }}
        />
    )
}
