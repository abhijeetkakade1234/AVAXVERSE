export default function SecuritySection() {
    const features = [
        {
            title: "Self-custodial mission control.",
            desc: "You retain full control of your private keys and mission assets at all times.",
            bg: "bg-white",
            icon: "lock_open",
            textColor: "text-gray-900",
            iconColor: "text-gray-200 group-hover:text-primary/20"
        },
        {
            title: "Hardened Contract Audits.",
            desc: "Our Registry and Escrow contracts are designed with industry-leading security patterns.",
            bg: "bg-card-yellow",
            icon: "verified",
            textColor: "text-gray-900",
            iconColor: "text-yellow-600/20 group-hover:text-yellow-600/40"
        },
        {
            title: "Malicious Job Detection.",
            desc: "Our reputation-based filtering flags suspicious missions before you interact with them.",
            bg: "bg-[#FFE0E0]",
            icon: "gpp_maybe",
            textColor: "text-gray-900",
            iconColor: "text-red-400/20 group-hover:text-red-400/40"
        },
        {
            title: "Hardware Wallet Support.",
            desc: "Sign your mission submissions and escrow releases using Ledger or Trezor for air-gapped security.",
            bg: "bg-gray-900",
            icon: "developer_board",
            textColor: "text-white",
            iconColor: "text-white/10 group-hover:text-white/20"
        },
        {
            title: "On-Chain Dispute Resolution.",
            desc: "Integrated arbitration mechanisms ensure fair mission outcomes based on verifiable work.",
            bg: "bg-card-blue",
            icon: "gavel",
            textColor: "text-white",
            iconColor: "text-white/10 group-hover:text-white/20"
        }
    ]

    return (
        <>
            <div className="flex flex-col gap-12 min-w-[320px] mr-12">
                <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full border border-white/20 backdrop-blur-md w-fit">
                    <span className="material-symbols-outlined text-white text-base">shield</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Your security</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                    Built to be<br />safe & secure.
                </h2>
            </div>
            {features.map((feature, index) => (
                <div
                    key={index}
                    className={`flex-none w-[320px] h-[420px] ${feature.bg} rounded-[3rem] p-10 flex flex-col justify-between shadow-xl border border-black/5 group overflow-hidden`}
                >
                    <div className="relative z-10">
                        <h3 className={`text-xl font-bold ${feature.textColor} mb-4`}>{feature.title}</h3>
                        <p className={`${feature.textColor === 'text-white' ? 'text-white/70' : 'text-gray-600'} leading-relaxed`}>{feature.desc}</p>
                    </div>
                    <div className="flex justify-end mt-auto">
                        <span className={`material-symbols-outlined text-7xl transition-colors ${feature.iconColor}`}>
                            {feature.icon}
                        </span>
                    </div>
                </div>
            ))}
        </>
    )
}
