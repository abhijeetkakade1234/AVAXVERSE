'use client'

import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const navLinks = [
    { href: '/explorer', label: 'Explorer' },
    { href: '/governance', label: 'Governance' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/profile', label: 'Profile' },
    { href: '/vision', label: 'Vision' },
  ]

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)

    const media = window.matchMedia('(min-width: 1024px)')
    const syncViewport = () => setIsDesktop(media.matches)

    syncViewport()
    media.addEventListener('change', syncViewport)

    return () => {
      media.removeEventListener('change', syncViewport)
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <Logo textSize="text-base sm:text-lg lg:text-xl" iconSize="text-lg sm:text-xl" />

        <div className="hidden lg:flex items-center bg-white/20 backdrop-blur-xl rounded-full px-8 py-3 gap-8 text-sm font-semibold text-white shadow-lg border border-white/20">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-indigo-200 transition-colors cursor-pointer">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 hover:scale-110"
            title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              {mounted && theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <ConnectButton
            showBalance={isDesktop}
            chainStatus="icon"
            accountStatus="avatar"
          />

          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden mt-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
