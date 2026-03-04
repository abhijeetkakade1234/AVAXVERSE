'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useInView, useMotionValue, animate } from 'framer-motion'

interface AnimatedCounterProps {
    target: number
    suffix?: string
    prefix?: string
    duration?: number
    decimals?: number
    className?: string
}

export function AnimatedCounter({
    target,
    suffix = '',
    prefix = '',
    duration = 2,
    decimals = 0,
    className = '',
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })
    const motionValue = useMotionValue(0)
    const [display, setDisplay] = useState('0')

    useEffect(() => {
        if (!isInView) return

        const controls = animate(motionValue, target, {
            duration,
            ease: [0.25, 0.4, 0.25, 1],
            onUpdate: (v) => {
                if (decimals > 0) {
                    setDisplay(v.toFixed(decimals))
                } else {
                    setDisplay(Math.round(v).toLocaleString())
                }
            },
        })

        return controls.stop
    }, [isInView, target, duration, decimals, motionValue])

    return (
        <span ref={ref} className={`stat-number ${className}`}>
            {prefix}{display}{suffix}
        </span>
    )
}
