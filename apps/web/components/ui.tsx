'use client'

import { ReactNode } from 'react'

type StatCardProps = {
    icon: ReactNode
    label: string
    value: string
}

export function StatCard({ icon, label, value }: StatCardProps) {
    return (
        <div
            className="glass animate-enter"
            style={{ padding: '1.5rem', textAlign: 'center' }}
        >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#E84142' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{label}</div>
        </div>
    )
}

type FeatureCardProps = {
    icon: ReactNode
    title: string
    description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div
            className="glass animate-enter"
            style={{ padding: '1.75rem', transition: 'transform 0.2s', cursor: 'default' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div style={{ marginBottom: '0.75rem' }}>{icon}</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{title}</h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                {description}
            </p>
        </div>
    )
}

type SectionProps = {
    children: ReactNode
    style?: React.CSSProperties
}

export function Section({ children, style }: SectionProps) {
    return (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', ...style }}>
            {children}
        </section>
    )
}
