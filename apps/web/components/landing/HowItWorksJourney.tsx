import React from 'react';

export function HowItWorksJourney() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Hero Title Section */}
        <section className="pt-20 pb-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f42525]/10 border border-[#f42525]/20 text-[#f42525] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            The Future of Work
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-100 mb-6">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f42525] to-orange-500">Works</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl">
            Experience the cinematic journey of the AVAXVERSE ecosystem, where decentralized identities meet automated trust on the Avalanche network.
          </p>
        </section>

        {/* Horizontal Journey Section */}
        <section className="relative min-h-[600px] flex items-center py-20 overflow-visible w-full">
          {/* Central Mountain Structure */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-40 mountain-glow pointer-events-none">
            <img
              className="w-full h-auto object-contain"
              alt="Glowing red crystalline mountain peaks structure"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBj-9eBSfwxFQ8G1RKaTp-9Zaa5mbON2CDQUVwXcCyCS_LwpbW2nQ-0m1e4xmpCELzQIMxBonjJw9YiV1KEoebYJpJijCOG3JaDmpxNX-q1FjV-M8PWHwXXEQl_t8IU7EgTYfR-Q9YLPfWr5QhGKN_ak_GAhOcHzeJ6CVvMqmplgNVHla957rE9JrIs8xOKlIvOfr0mEz9rtcaKlrzhKCMhrAsrfFWvJWiwP5hmg1DDsZS9qKQVpekuLN5lHj6YIl-kKTdtBRzALRs"
            />
          </div>

          {/* Timeline Path */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 neon-line z-0"></div>

          <div className="w-full px-4 relative z-10 overflow-x-auto no-scrollbar">
            <div className="flex flex-nowrap md:justify-between items-center gap-8 min-w-[1200px] py-12 px-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group w-60">
                <div className="glass-node w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                  <div className="absolute inset-0 rounded-2xl bg-[#f42525]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-[#f42525] text-4xl">badge</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Identity Minting</h3>
                <p className="text-slate-400 text-sm leading-relaxed">User mints a unique on-chain decentralized identity.</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group w-60">
                <div className="glass-node w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                  <div className="absolute inset-0 rounded-2xl bg-[#f42525]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-[#f42525] text-4xl">work_history</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Escrow Setup</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Client creates a task and locks funds in smart contract.</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group w-60">
                <div className="glass-node w-24 h-24 rounded-3xl flex items-center justify-center mb-6 scale-110 border-[#f42525]/40 bg-[#f42525]/10 relative shadow-[0_0_30px_rgba(244,37,37,0.2)]">
                  <div className="absolute inset-0 rounded-3xl bg-[#f42525]/30 blur-2xl opacity-50"></div>
                  <span className="material-symbols-outlined text-[#f42525] text-5xl">task_alt</span>
                </div>
                <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tighter">Execution</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Freelancer completes the agreed milestone deliverable.</p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center group w-60">
                <div className="glass-node w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                  <div className="absolute inset-0 rounded-2xl bg-[#f42525]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-[#f42525] text-4xl">account_balance_wallet</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Auto Settlement</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Smart contract releases payment automatically.</p>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center group w-60">
                <div className="glass-node w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                  <div className="absolute inset-0 rounded-2xl bg-[#f42525]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-[#f42525] text-4xl">security_update_good</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Trust Update</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Reputation scores update based on performance data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 w-full">
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
                  <span className="material-symbols-outlined text-[#f42525] text-3xl">speed</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Instant Finality</h4>
                    <p className="text-slate-400 text-sm">Experience sub-second transaction confirmation for all milestones.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[#f42525] text-3xl">hub</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Decentralized Trust</h4>
                    <p className="text-slate-400 text-sm">No intermediaries. Just code, consensus, and clear outcomes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative w-full">
              <div className="absolute -inset-4 bg-[#f42525]/20 blur-3xl rounded-full"></div>
              <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-slate-900 shadow-2xl">
                <img
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
                      <span className="material-symbols-outlined text-[#f42525]">analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 w-full">
          <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center border border-white/10 bg-gradient-to-br from-slate-900 to-black">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full opacity-10 pointer-events-none">
              <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                <path d="M0 100 C 20 0, 50 0, 100 100" fill="transparent" stroke="#f42525" strokeWidth="0.5"></path>
                <path d="M0 80 C 30 20, 70 20, 100 80" fill="transparent" stroke="#f42525" strokeWidth="0.5"></path>
              </svg>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to join the verse?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
              Mint your identity and start building the future of decentralized work today. Experience the power of AVAXVERSE.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <button className="bg-[#f42525] hover:bg-[#f42525]/90 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-[#f42525]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                Get Started Now
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-full text-lg font-bold backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
                View Documentation
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Wave Patterns bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20 pointer-events-none overflow-hidden z-0">
        <svg className="w-[200%] h-full animate-wave" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path d="M0 50 C 150 100, 350 0, 500 50 C 650 100, 850 0, 1000 50 L 1000 100 L 0 100 Z" fill="#f42525"></path>
        </svg>
      </div>
    </div>
  );
}
