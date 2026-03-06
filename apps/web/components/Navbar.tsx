import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import Logo from './Logo'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
      <Logo />

      <div className="hidden md:flex items-center bg-white/20 backdrop-blur-xl rounded-full px-8 py-3 gap-8 text-sm font-semibold text-white shadow-lg border border-white/20">
        <Link href="/explorer" className="hover:text-red-500 transition-colors cursor-pointer">Explorer</Link>
        <Link href="/governance" className="hover:text-red-500 transition-colors cursor-pointer">Governance</Link>
        <Link href="/jobs" className="hover:text-red-500 transition-colors cursor-pointer">Jobs</Link>
        <Link href="/profile" className="hover:text-red-500 transition-colors cursor-pointer">Profile</Link>
        <Link href="/vision" className="hover:text-red-500 transition-colors cursor-pointer">Vision</Link>
      </div>

      <div className="flex items-center gap-4">
        <ConnectButton
          showBalance={true}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </nav>
  )
}