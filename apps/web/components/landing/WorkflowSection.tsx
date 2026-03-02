import { Fingerprint, Lock, Star } from 'lucide-react'
import React from 'react'

export function WorkflowSection() {
    return (
        <section className="dot-grid shrink-0 w-full py-48 md:py-80 flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-6xl px-6 relative space-y-48 md:space-y-72">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
                    <div className="flex-shrink-0 relative w-12 md:w-16 flex justify-center">
                        <div className="w-12 h-1.5 bg-red-500 rounded-full mx-auto" />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic leading-none">
                            Three Steps <br />to Freedom.
                        </h2>
                    </div>
                </div>

                <div className="space-y-48 md:space-y-72">
                    <Step
                        title="Claim Identity"
                        desc="Deploy your sovereign ID on the Avalanche C-Chain. Your digital shadow begins here."
                        icon={<Fingerprint size={32} />}
                    />
                    <Step
                        title="Secure The Mission"
                        desc="Funds are locked in a trustless escrow contract. No middleman, no chargebacks."
                        icon={<Lock size={32} />}
                    />
                    <Step
                        title="Harvest Reputation"
                        desc="Completed work mints Soulbound Tokens. Your past successes fuel your future growth."
                        icon={<Star size={32} />}
                    />
                </div>
            </div>
        </section>
    )
}

function Step({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center group">
            <div className="flex-shrink-0 relative">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-red-500 group-hover:border-red-500/20 group-hover:bg-red-500/5 transition-all duration-700 shadow-xl">
                    <div className="scale-125 transform transition-transform group-hover:scale-150">{icon}</div>
                </div>
            </div>
            <div className="text-center md:text-left space-y-4 md:space-y-6">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tight uppercase group-hover:text-red-500 transition-colors leading-none">{title}</h3>
                <p className="text-white/40 text-lg md:text-2xl max-w-xl leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    )
}
