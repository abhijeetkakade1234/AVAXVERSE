'use client'

import { motion, useTransform, useScroll, useSpring } from 'motion/react'
import { useRef, useState, useLayoutEffect, ReactNode } from 'react'

interface HorizontalScrollProps {
    children: ReactNode
    id?: string
}

export default function HorizontalScroll({ children, id }: HorizontalScrollProps) {
    const targetRef = useRef<HTMLDivElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)
    const [scrollRange, setScrollRange] = useState(0)
    const [viewportWidth, setViewportWidth] = useState(0)

    const { scrollYProgress } = useScroll({
        target: targetRef,
    })

    // Smoothen the scroll progress slightly for that high-end feel
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    useLayoutEffect(() => {
        const updateRange = () => {
            if (contentRef.current) {
                // Total width of all content including gaps
                setScrollRange(contentRef.current.scrollWidth)
            }
            setViewportWidth(window.innerWidth)
        }

        updateRange()

        // Use ResizeObserver for more reliable measurement
        const observer = new ResizeObserver(updateRange)
        if (contentRef.current) observer.observe(contentRef.current)

        window.addEventListener('resize', updateRange)
        return () => {
            observer.disconnect()
            window.removeEventListener('resize', updateRange)
        }
    }, [])

    // Dynamic transform: 
    // Starts at 0 (first element visible on left)
    // Ends at - (content width - viewport width)
    const x = useTransform(
        smoothProgress,
        [0.05, 0.95], // Give a small buffer at start and end
        [0, -(scrollRange - viewportWidth + 100)]
    )

    // Progress bar width
    const progressBarWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"])

    return (
        <section
            ref={targetRef}
            id={id}
            className="relative h-[600vh] bg-transparent z-20" // Higher z-index for pinning
        >
            <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
                <motion.div
                    ref={contentRef}
                    style={{ x }}
                    className="flex gap-16 px-10 md:px-32 items-center will-change-transform"
                >
                    {children}
                </motion.div>

                {/* Optional Progress Indicator at the bottom of the sticky section */}
                <div className="absolute bottom-10 left-10 md:left-32 right-10 md:right-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        style={{ width: progressBarWidth }}
                        className="h-full bg-primary/60 shadow-[0_0_10px_rgba(123,97,255,0.5)]"
                    />
                </div>
            </div>
        </section>
    )
}
