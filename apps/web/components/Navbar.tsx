export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="material-icons text-white">layers</span>
        <span className="font-bold text-xl text-white tracking-tight">AVAXVERSE</span>
      </div>

      <div className="hidden md:flex items-center bg-white/20 backdrop-blur-md rounded-full px-6 py-2 gap-6 text-sm font-medium text-white shadow-sm border border-white/10">
        <a className="hover:text-white/80 transition-colors drop-shadow-sm cursor-pointer">Features</a>
        <a className="hover:text-white/80 transition-colors drop-shadow-sm cursor-pointer">Network</a>
        <a className="hover:text-white/80 transition-colors drop-shadow-sm cursor-pointer">Explore</a>
        <a className="hover:text-white/80 transition-colors drop-shadow-sm cursor-pointer">Company</a>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-white text-primary px-4 py-2 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors shadow-sm">
          Connect Wallet
        </button>
      </div>
    </nav>
  )
}