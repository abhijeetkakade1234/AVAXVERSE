import React from 'react';
import { Zap, Network, Activity } from 'lucide-react';
import Image from 'next/image';

export function AvalancheSection() {
    return (
        <section className="py-24 container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2">
                    <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                        Powered by <span className="text-[#f42525]">Avalanche</span> Consensus
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                        High-performance nodes ensuring instantaneous finality and ultra-low fees for every step of your professional journey in the decentralized world.
                    </p>
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                            <Zap className="text-[#f42525] w-8 h-8 shrink-0" />
                            <div>
                                <h4 className="text-white font-bold mb-1">Instant Finality</h4>
                                <p className="text-slate-400 text-sm">Experience sub-second transaction confirmation for all milestones.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                            <Network className="text-[#f42525] w-8 h-8 shrink-0" />
                            <div>
                                <h4 className="text-white font-bold mb-1">Decentralized Trust</h4>
                                <p className="text-slate-400 text-sm">No intermediaries. Just code, consensus, and clear outcomes.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 relative">
                    <div className="absolute -inset-4 bg-[#f42525]/20 blur-3xl rounded-full"></div>
                    <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-slate-900 shadow-2xl">
                        <Image
                            width={800}
                            height={600}
                            className="w-full h-auto opacity-80"
                            alt="Abstract 3D network nodes visualization"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQwTdkrKJq1q-dqikQBSSg7pu0YziO2CnzTUou2h36AW8OwQeo18Fq8LEONaSbzzZvlzb6eKHor5soStF_dlrcUqHxvCoXXufEKFaIzwRQ8m9E6IERl7eb98fsb0mCQIYqnqRKHUNMq1WbSmJZYl3uMMLu7AsrWRDKN1B3A8AAM2nyL5HKpFa5vbLuYUpfpuxpO_nDhG5vcXcdAAM5ngjksZ4M4ckLl0l7zzLZCQfKp8aYCcvTpNRBq96VNQpL63Bv3ouJ6Ojb5VM"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="text-white">
                                    <p className="text-xs uppercase tracking-widest text-[#f42525] font-bold mb-1">Network Status</p>
                                    <p className="text-2xl font-black">99.9% Efficiency</p>
                                </div>
                                <div className="h-12 w-12 bg-[#f42525]/20 rounded-full flex items-center justify-center border border-[#f42525]/40">
                                    <Activity className="text-[#f42525] w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
