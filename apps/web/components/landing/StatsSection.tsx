const STATS = [
    { label: 'Identities', value: '1,284', unit: 'active' },
    { label: 'Mission Ops', value: '342', unit: 'secured' },
    { label: 'Escrow Flow', value: '42k', unit: 'AVAX' },
    { label: 'Trust Score', value: '99.8', unit: 'avg' },
] as const

export function StatsSection() {
    return (
        <section className="relative z-20 shrink-0 w-full py-32 md:py-48 flex flex-col items-center mb-32 md:mb-48">
            <div className="w-full max-w-6xl px-6 relative">
                <div className="bg-white/5 rounded-[1.4rem] grid grid-cols-2 md:grid-cols-4 gap-px">
                    {STATS.map((s, i) => (
                        <div key={s.label} className="bg-black p-10 md:p-12 text-center animate-enter" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="text-5xl md:text-6xl font-black text-red-500 mb-2">{s.value}</div>
                            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-2">{s.unit}</div>
                            <div className="text-sm font-bold text-white/60">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
