import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative pt-10 pb-10 min-h-[85vh] flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="absolute inset-0 abstract-mesh opacity-40 blur-3xl rounded-[4rem] -rotate-3 scale-110"></div>
        <div className="relative glass-card rounded-[4rem] rounded-tl-[8rem] rounded-br-[8rem] p-12 md:p-24 flex flex-col items-center shadow-2xl backdrop-blur-3xl bg-white/15 dark:bg-black/20 text-center border-white/40 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
            <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-gradient-to-br from-purple-400 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-gradient-to-tl from-blue-400 to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-10 shadow-sm border border-white/30">
              <span className="text-white text-xs font-bold uppercase tracking-widest leading-none">
                The Avalanche Operating Layer
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-bold text-white mb-10 leading-[1.1] tracking-tight drop-shadow-2xl">
              Your home for identity,<br />
              <span className="bg-gradient-to-r from-white via-indigo-200 to-white/80 bg-clip-text text-transparent">
                work, and finance.
              </span>
            </h1>

            <div className="flex flex-col items-center gap-8">
              <Link href="/jobs">
                <button className="bg-white text-primary px-12 py-6 rounded-full font-bold text-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.3)] flex items-center gap-4 group">
                  <span className="material-icons group-hover:rotate-12 transition-transform">rocket_launch</span>
                  Enter the Verse
                </button>
              </Link>
              <p className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em] drop-shadow-md">
                Join the next generation of Web3
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}