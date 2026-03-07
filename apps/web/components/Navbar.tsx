'use client'

import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
      <Logo />

      <div className="hidden md:flex items-center bg-white/20 backdrop-blur-xl rounded-full px-8 py-3 gap-8 text-sm font-semibold text-white shadow-lg border border-white/20">
        <Link href="/explorer" className="hover:text-indigo-200 transition-colors cursor-pointer">Explorer</Link>
        <Link href="/governance" className="hover:text-indigo-200 transition-colors cursor-pointer">Governance</Link>
        <Link href="/jobs" className="hover:text-indigo-200 transition-colors cursor-pointer">Jobs</Link>
        <Link href="/profile" className="hover:text-indigo-200 transition-colors cursor-pointer">Profile</Link>
        <Link href="/vision" className="hover:text-indigo-200 transition-colors cursor-pointer">Vision</Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 hover:scale-110"
          title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {mounted && theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <ConnectButton
          showBalance={true}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </nav>
  )
}