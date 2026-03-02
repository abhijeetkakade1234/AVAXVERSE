'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Hexagon, LayoutGrid, User, Briefcase } from 'lucide-react'

const NAV_LINKS = [
    { href: '/', label: 'Explore', icon: <LayoutGrid size={14} /> },
    { href: '/profile', label: 'Identity', icon: <User size={14} /> },
    { href: '/jobs', label: 'Jobs', icon: <Briefcase size={14} /> },
] as const

export function Navbar() {
    const pathname = usePathname()

    return (
        <div
            style={{
                position: 'fixed',
                top: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                width: 'max-content',
                maxWidth: '90vw',
            }}
        >
            <header
                className="glass animate-enter"
                style={{
                    background: 'rgba(10,10,15,0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '99px',
                    padding: '0.45rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                }}
            >
                {/* Logo */}
                <Link
                    href="/"
                    style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0 0.8rem',
                        borderRight: '1px solid rgba(255,255,255,0.08)'
                    }}
                >
                    <Hexagon size={18} fill="#E84142" stroke="none" />
                    <span
                        style={{
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            letterSpacing: '-0.025em',
                            color: '#fff'
                        }}
                    >
                        AVAXVERSE
                    </span>
                </Link>

                {/* Nav links */}
                <nav
                    style={{
                        display: 'flex',
                        gap: '0.2rem',
                    }}
                >
                    {NAV_LINKS.map(({ href, label, icon }) => {
                        const active = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '99px',
                                    textDecoration: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: active ? '#fff' : 'rgba(255,255,255,0.48)',
                                    background: active ? 'rgba(232,65,66,0.15)' : 'transparent',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                <span style={{ color: active ? '#E84142' : 'inherit', display: 'flex' }}>{icon}</span>
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Wallet Button Container - styled matches pill nav */}
                <div style={{ paddingLeft: '0.2rem' }}>
                    <ConnectButton
                        chainStatus="icon"
                        showBalance={false}
                        accountStatus="avatar"
                    />
                </div>
            </header>
        </div>
    )
}
