export default function EcosystemSection() {
    const integrations = [
        {
            title: "Subnet-Native PWA.",
            desc: "AVAXVERSE is now a progressive web app, giving you a smooth native-like experience on both mobile and desktop.",
            bg: "bg-card-blue",
            icon: "phonelink_setup"
        },
        {
            title: "Cross-Chain Vision.",
            desc: "Integrating Avalanche Teleporter for seamless messaging and reputation sharing across subnets.",
            bg: "bg-card-dark-2",
            icon: "dynamic_feed"
        },
        {
            title: "Asset Flexibility.",
            desc: "Manage your Avalanche-native rewards and profile metrics within our unified ecosystem interface.",
            bg: "bg-gray-800",
            icon: "account_balance_wallet"
        },
        {
            title: "Solidity Core Hooks.",
            desc: "Standardized developer SDK for easy integration of our Identity and Reputation protocols into third-party dapps.",
            bg: "bg-card-dark-1",
            icon: "terminal"
        },
        {
            title: "Zero-AVAX Onboarding.",
            desc: "Implementing Gasless meta-transactions to allow new users to build their on-chain identity without upfront costs.",
            bg: "bg-primary",
            icon: "auto_fix_high"
        }
    ]

    return (
        <>
            <div className="flex flex-col gap-12 min-w-[320px] mr-12">
                <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full border border-white/20 backdrop-blur-md w-fit">
                    <span className="material-symbols-outlined text-white text-base">account_balance_wallet</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Ecosystem</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                    Every dapp,<br />one ecosystem.
                </h2>
            </div>
            {integrations.map((item, index) => (
                <div
                    key={index}
                    className={`flex-none w-[320px] h-[450px] ${item.bg} rounded-[3rem] p-10 flex flex-col justify-between border border-white/20 shadow-2xl relative group overflow-hidden`}
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
        </>
    )
}
