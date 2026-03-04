'use client';

import { useRouter } from 'next/navigation';

export function CtaSection() {
    const router = useRouter();

    return (
        <section className="py-24 container mx-auto px-6 relative z-10">
            <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center border border-white/10 bg-gradient-to-br from-slate-900 to-black">
                {/* SVG wave background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full opacity-10 pointer-events-none">
                    <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                        <path d="M0 100 C 20 0, 50 0, 100 100" fill="transparent" stroke="#f42525" strokeWidth="0.5"></path>
                        <path d="M0 80 C 30 20, 70 20, 100 80" fill="transparent" stroke="#f42525" strokeWidth="0.5"></path>
                    </svg>
                </div>

                <h2 className="relative text-4xl md:text-5xl font-black text-white mb-8 z-10">
                    Ready to join the verse?
                </h2>
                <p className="relative text-slate-400 text-lg max-w-2xl mx-auto mb-12 z-10">
                    Mint your identity and start building the future of decentralized work today. Experience the power of AVAXVERSE.
                </p>

                <div className="relative flex flex-col sm:flex-row justify-center gap-6 z-10">
                    <button
                        onClick={() => router.push('/profile')}
                        className="bg-[#f42525] hover:bg-[#f42525]/90 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-[#f42525]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        Get Started Now
                    </button>
                    <button
                        onClick={() => router.push('/jobs')}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-full text-lg font-bold backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        View Documentation
                    </button>
                </div>
            </div>
        </section>
    );
}
