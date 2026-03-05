export default function EcosystemSection() {
    const integrations = [
        {
            title: "One home for all your assets.",
            desc: "Manage tokens, NFTs, and yield positions from a single dashboard.",
            bg: "bg-card-blue",
            icon: "account_balance"
        },
        {
            title: "Cross-subnet composability.",
            desc: "Interact with any application across Avalanche subnets effortlessly.",
            bg: "bg-card-dark-2",
            icon: "hub"
        },
        {
            title: "Seamless fiat on-ramps.",
            desc: "Convert between fiat and crypto using major payment providers.",
            bg: "bg-gray-800",
            icon: "currency_exchange"
        }
    ]

    return (
        <section className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full border border-white/20 backdrop-blur-md">
                    <span className="material-icons text-white text-base">account_balance_wallet</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Ecosystem Integration</span>
                </div>
            </div>

            <div className="flex overflow-x-auto gap-8 pb-8 hide-scrollbar snap-x">
                {integrations.map((item, index) => (
                    <div
                        key={index}
                        className={`snap-start flex-none w-[320px] h-[450px] ${item.bg} rounded-[3rem] p-10 flex flex-col justify-between border border-white/20 shadow-2xl relative group overflow-hidden`}
                    >
                        <div className="bg-white/10 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                            <p className="text-white/80 leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="flex justify-end mt-auto relative z-10">
                            <span className="material-symbols-outlined text-7xl text-white/40 drop-shadow-lg group-hover:scale-110 transition-transform">
                                {item.icon}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
