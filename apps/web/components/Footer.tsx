export function Footer() {
    return (
        <footer className="bg-black shrink-0 w-full flex flex-col items-center py-24 md:py-32">
            <div className="w-full max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-16 opacity-40 text-xs md:text-sm font-black tracking-[0.4em] uppercase border-t border-white/10 pt-16">
                <div>© 2026 AVAXVERSE // FORGED IN AVALANCHE</div>
                <div className="flex flex-wrap justify-center gap-12 md:gap-16">
                    <a href="#" className="hover:text-red-500 transition-colors">Documentation</a>
                    <a href="#" className="hover:text-red-500 transition-colors">Governance</a>
                    <a href="#" className="hover:text-red-500 transition-colors">Fuji Lab</a>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" /> CORE ONLINE
                </div>
            </div>
        </footer>
    )
}
