'use client'

import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'

export function CtaSection() {
    const router = useRouter()

    return (
        <section className="relative bg-[#0a0a0f] overflow-hidden shrink-0 w-full py-20 md:py-24 border-y border-white/5 flex flex-col items-center">
            <div className="absolute inset-0 dot-grid opacity-30" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            <div className="w-full max-w-6xl px-6 relative flex flex-col items-center text-center">
                <div className="flex justify-center mb-10 w-full">
                    <div className="inline-flex p-6 bg-red-500/10 rounded-2xl border border-red-500/20 animate-pulse">
                        <Users size={48} className="text-red-500" />
                    </div>
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-none italic uppercase">
                    READY TO <br /><span className="text-red-500 underline decoration-[8px] underline-offset-[16px]">INITIATE?</span>
                </h2>
                <p className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                    Join the decentralized workforce. Permissionless and sovereign.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
                    <button className="btn-primary py-4 px-10 text-lg w-full sm:w-1/2 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(232,65,66,0.3)]" style={{ background: 'linear-gradient(135deg, #E84142, #c0392b)' }} onClick={() => router.push('/profile')}>
                        Connect Identity
                    </button>
                    <button className="btn-secondary py-4 px-10 text-lg w-full sm:w-1/2 hover:bg-white/5 border-2 border-white/10 text-white/80 hover:text-white hover:border-white/30 backdrop-blur-sm transition-all" onClick={() => router.push('/jobs')}>
                        Enter Board
                    </button>
                </div>
            </div>
        </section>
    )
}
