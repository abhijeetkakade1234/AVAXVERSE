export default function SecuritySection() {
    const features = [
        {
            title: "Self-custodial means you control your funds.",
            desc: "We never have access to your private keys or assets.",
            bg: "bg-white",
            icon: "lock",
            iconColor: "text-gray-200 group-hover:text-primary/20"
        },
        {
            title: "Our global Support team is here for you 24/7.",
            desc: "Get help whenever you need it, wherever you are.",
            bg: "bg-card-yellow",
            icon: "support_agent",
            iconColor: "text-yellow-600/20 group-hover:text-yellow-600/40"
        },
        {
            title: "Scam detection flags malicious transactions.",
            desc: "Stay safe with real-time alerts before you sign.",
            bg: "bg-[#FFE0E0]",
            icon: "gpp_bad",
            iconColor: "text-red-400/20 group-hover:text-red-400/40"
        },
        {
            title: "Multi-sig Protection",
            desc: "Secure your high-value assets with sophisticated multi-signature wallet configurations.",
            bg: "bg-green-100",
            icon: "verified_user",
            iconColor: "text-green-600/20 group-hover:text-green-600/40"
        }
    ]

    return (
        <section className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full border border-white/20 backdrop-blur-md">
                    <span className="material-icons text-white text-base">shield</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Your security</span>
                </div>
                <button className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors border border-white/20 backdrop-blur-md">
                    <span className="material-icons text-white">arrow_forward</span>
                </button>
            </div>

            <div className="flex overflow-x-auto gap-8 pb-8 hide-scrollbar snap-x">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`snap-start flex-none w-[320px] h-[420px] ${feature.bg} rounded-[3rem] p-10 flex flex-col justify-between shadow-xl border border-black/5 group overflow-hidden`}
                    >
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                        </div>
                        <div className="flex justify-end mt-auto">
                            <span className={`material-icons text-9xl transition-colors ${feature.iconColor}`}>
                                {feature.icon}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
