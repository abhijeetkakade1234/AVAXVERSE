'use client'

import React from 'react'
import { motion, type Variants } from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface RevealProps {
    children: React.ReactNode
    direction?: Direction
    delay?: number
    duration?: number
    blur?: boolean
    className?: string
    once?: boolean
    amount?: number
}

const getVariants = (direction: Direction, blur: boolean): Variants => {
    const hidden: Record<string, number | string> = { opacity: 0 }
    const visible: Record<string, number | string> = { opacity: 1 }

    switch (direction) {
        case 'up':
            hidden.y = 40
            visible.y = 0
            break
        case 'down':
            hidden.y = -40
            visible.y = 0
            break
        case 'left':
            hidden.x = 40
            visible.x = 0
            break
        case 'right':
            hidden.x = -40
            visible.x = 0
            break
        case 'none':
            break
    }

    if (blur) {
        hidden.filter = 'blur(8px)'
        visible.filter = 'blur(0px)'
    }

    return { hidden, visible }
}

export function Reveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.7,
    blur = false,
    className,
    once = true,
    amount = 0.3,
}: RevealProps) {
    const variants = getVariants(direction, blur)

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
