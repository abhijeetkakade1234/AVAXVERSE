import React from 'react';
import { BadgeCheck, FileClock, CheckCircle2, Wallet, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export function WorkflowSection() {
    return (
        <section className="relative min-h-[600px] flex flex-col items-center py-20 overflow-visible w-full bg-[#0a0a0f]">
            {/* Title Section (Matching the Reference) */}
            <div className="pt-20 pb-10 text-center px-4 z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E84142]/10 border border-[#E84142]/20 text-[#E84142] text-xs font-bold uppercase tracking-widest mb-6">
                    <span className="text-sm">✨</span>
                    The Future of Work
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
                    How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84142] to-orange-500">Works</span>
                </h2>
                <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl">
                    Experience the cinematic journey of the AVAXVERSE ecosystem, where decentralized identities meet automated trust on the Avalanche network.
                </p>
            </div>

            {/* Horizontal Journey Section */}
            <div className="relative w-full min-h-[500px] flex items-center">
                {/* Central Mountain Structure */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-40 mountain-glow pointer-events-none z-0">
                    <Image
                        width={900}
                        height={600}
                        className="w-full h-auto object-contain mix-blend-screen"
                        alt="Glowing red crystalline mountain peaks structure"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBj-9eBSfwxFQ8G1RKaTp-9Zaa5mbON2CDQUVwXcCyCS_LwpbW2nQ-0m1e4xmpCELzQIMxBonjJw9YiV1KEoebYJpJijCOG3JaDmpxNX-q1FjV-M8PWHwXXEQl_t8IU7EgTYfR-Q9YLPfWr5QhGKN_ak_GAhOcHzeJ6CVvMqmplgNVHla957rE9JrIs8xOKlIvOfr0mEz9rtcaKlrzhKCMhrAsrfFWvJWiwP5hmg1DDsZS9qKQVpekuLN5lHj6YIl-kKTdtBRzALRs"
                    />
                </div>

                {/* Timeline Path */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 neon-line z-0"></div>

                <div className="w-full px-4 relative z-10 overflow-x-auto no-scrollbar">
                    <div className="flex flex-nowrap md:justify-center items-center gap-8 min-w-[1200px] py-12 px-10 max-w-7xl mx-auto">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center group w-60">
                            <div className="glass-node w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                                <div className="absolute inset-0 rounded-2xl bg-[#E84142]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <BadgeCheck className="text-[#E84142] w-10 h-10" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Identity Minting</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">User mints a unique on-chain decentralized identity.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center group w-60">
                            <div className="glass-node w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                                <div className="absolute inset-0 rounded-2xl bg-[#E84142]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <FileClock className="text-[#E84142] w-10 h-10" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Escrow Setup</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Client creates a task and locks funds in smart contract.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center group w-60">
                            <div className="glass-node w-24 h-24 rounded-3xl flex items-center justify-center mb-6 scale-110 border-[#E84142]/40 bg-[#E84142]/10 relative shadow-[0_0_30px_rgba(232,65,66,0.2)]">
                                <div className="absolute inset-0 rounded-3xl bg-[#E84142]/30 blur-2xl opacity-50"></div>
                                <CheckCircle2 className="text-[#E84142] w-12 h-12" />
                            </div>
                            <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tighter">Execution</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Freelancer completes the agreed milestone deliverable.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center text-center group w-60">
                            <div className="glass-node w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                                <div className="absolute inset-0 rounded-2xl bg-[#E84142]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Wallet className="text-[#E84142] w-10 h-10" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Auto Settlement</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Smart contract releases payment automatically.</p>
                        </div>

                        {/* Step 5 */}
                        <div className="flex flex-col items-center text-center group w-60">
                            <div className="glass-node w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                                <div className="absolute inset-0 rounded-2xl bg-[#E84142]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <ShieldCheck className="text-[#E84142] w-10 h-10" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Trust Update</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Reputation scores update based on performance data.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
