const STATS = [
    { label: "Active Identities", value: "1,284" },
    { label: "Secured Missions", value: "342" },
    { label: "Escrow Volume", value: "42K" },
    { label: "Trust Score", value: "99.8" },
] as const

export function StatsSection() {
    return (
        <section className="min-h-screen flex items-center justify-center bg-black relative z-10 py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {STATS.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-8 glass-node rounded-2xl relative group overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-[#f42525]/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                            <h3 className="text-5xl font-black text-white mb-2 relative z-10">{stat.value}</h3>
                            <p className="text-slate-400 text-sm uppercase tracking-widest font-bold relative z-10">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
