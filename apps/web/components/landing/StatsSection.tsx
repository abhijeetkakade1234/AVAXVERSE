const STATS = [
    { label: "Active Identities", value: "1,284" },
    { label: "Secured Missions", value: "342" },
    { label: "Escrow Volume", value: "42K" },
    { label: "Trust Score", value: "99.8" },
] as const

export function StatsSection() {
    return (
        <section className="py-24 relative z-10 overflow-hidden">
            {/* Connecting gradient from previous section */}
            <div className="absolute top-1/2 right-[-10%] w-[30%] h-[50%] bg-[#f42525]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {STATS.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-8 glass-node rounded-2xl relative group overflow-hidden border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[#f42525]/30 hover:bg-white/10">
                            <div className="absolute inset-0 bg-[#f42525]/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl duration-500"></div>
                            <h3 className="text-5xl font-black text-white mb-2 relative z-10 drop-shadow-md">{stat.value}</h3>
                            <p className="text-slate-400 text-sm uppercase tracking-widest font-bold relative z-10">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}