export default function MissionLifecycle() {
    const steps = [
        {
            number: "01",
            title: "Post a Mission",
            desc: "Client defines the scope, budget, and requirements. A commitment deposit ensures the mission is serious.",
            bg: "bg-white/10",
            icon: "post_add",
            textColor: "text-white"
        },
        {
            number: "02",
            title: "Submit Proposals",
            desc: "Operators browse missions and apply with a proposal and a stake. High reputation reduces the required stake.",
            bg: "bg-primary/20",
            icon: "edit_note",
            textColor: "text-white"
        },
        {
            number: "03",
            title: "Select Talent",
            desc: "Client reviews applications and selects the best-fit operator based on their on-chain reputation and proposal.",
            bg: "bg-card-blue/50",
            icon: "person_search",
            textColor: "text-white"
        },
        {
            number: "04",
            title: "Accept Assignment",
            desc: "The selected operator confirms the mission, locking in the commitment and officially starting the collaboration.",
            bg: "bg-card-dark-2",
            icon: "handshake",
            textColor: "text-white"
        },
        {
            number: "05",
            title: "Fund Escrow",
            desc: "Client deposits the full mission budget into an automated Escrow contract, where funds are held safely.",
            bg: "bg-card-yellow/80",
            icon: "account_balance",
            textColor: "text-gray-900"
        },
        {
            number: "06",
            title: "Deliver Work",
            desc: "Operator completes the milestones and submits the deliverable URI for client review and verification.",
            bg: "bg-[#FFE0E0]/20",
            icon: "cloud_upload",
            textColor: "text-white"
        },
        {
            number: "07",
            title: "Instant Release",
            desc: "Once approved, the Escrow contract releases funds instantly. Both parties earn reputation points.",
            bg: "bg-green-500/20",
            icon: "verified",
            textColor: "text-green-400"
        },
        {
            number: "08",
            title: "Juror Arbitration",
            desc: "If a dispute arises, it enters the Dispute DAO. Reputation-weighted jurors review the evidence and cast the final deciding vote.",
            bg: "bg-red-500/10",
            icon: "gavel",
            textColor: "text-red-400"
        }
    ]

    return (
        <>
            <div className="flex flex-col gap-12 min-w-[320px] mr-12">
                <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full border border-white/20 backdrop-blur-md w-fit">
                    <span className="material-symbols-outlined text-white text-base">account_tree</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Mission Flow</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                    The Mission<br />Lifecycle.
                </h2>
            </div>
            {steps.map((step, index) => (
                <div
                    key={index}
                    className={`flex-none w-[320px] h-[450px] ${step.bg} rounded-[3rem] p-10 flex flex-col justify-between border border-white/20 backdrop-blur-sm shadow-2xl relative group overflow-hidden`}
                >
                    <div className="absolute -top-4 -right-4 text-[10rem] font-bold text-white/5 select-none transition-transform group-hover:scale-110">
                        {step.number}
                    </div>
                    <div className="relative z-10">
                        <span className={`material-symbols-outlined text-5xl ${step.textColor} mb-6 block`}>
                            {step.icon}
                        </span>
                        <h3 className={`text-2xl font-bold ${step.textColor} mb-4`}>{step.title}</h3>
                        <p className={`opacity-80 leading-relaxed ${step.textColor}`}>{step.desc}</p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                        <div className="h-px flex-1 bg-white/20"></div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${step.textColor}/60`}>Step {step.number}</span>
                    </div>
                </div>
            ))}
        </>
    )
}
