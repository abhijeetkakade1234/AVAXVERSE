import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="material-icons text-white">layers</span>
        <span className="font-bold text-xl text-white tracking-tight">AVAXVERSE</span>
      </Link>

      <div className="hidden md:flex items-center bg-white/10 backdrop-blur-xl rounded-full px-8 py-3 gap-8 text-sm font-semibold text-white shadow-lg border border-white/20">
        <Link href="/explorer" className="hover:text-primary transition-colors cursor-pointer">Explorer</Link>
        <Link href="/governance" className="hover:text-primary transition-colors cursor-pointer">Governance</Link>
        <Link href="/jobs" className="hover:text-primary transition-colors cursor-pointer">Jobs</Link>
        <Link href="/vision" className="hover:text-primary transition-colors cursor-pointer">Vision</Link>
      </div>

      <div className="flex items-center gap-4">
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </nav>
  )
}