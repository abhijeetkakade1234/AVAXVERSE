import Link from 'next/link'

export default function CTASection() {
    return (
        <section className="text-center py-32 glass-card rounded-[4rem] p-12 mt-12 border border-white/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
            <div className="relative z-10">
                <p className="text-white/80 mb-6 text-sm font-bold uppercase tracking-widest">
                    Trusted by a growing community
                </p>
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-12 leading-tight drop-shadow-2xl">
                    Get started.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                        Enter AVAXVERSE.
                    </span>
                </h2>
                <Link href="/missions">
                    <button className="bg-white text-primary px-12 py-6 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.2)] inline-flex items-center gap-3">
                        <span className="material-icons">rocket_launch</span>
                        Launch App
                    </button>
                </Link>
            </div>
        </section>
    )
}
