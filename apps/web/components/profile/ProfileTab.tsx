interface ProfileTabProps {
    profileExists: boolean;
    displayReputation: string;
    currentLevel: number;
    trustScore: string;
    globalRank: number | null;
    reputationScore: number;
}

export default function ProfileTab({
    profileExists,
    displayReputation,
    currentLevel,
    trustScore,
    globalRank,
    reputationScore
}: ProfileTabProps) {
    return (
        <div className="space-y-8">
            <div className="relative w-full h-64 rounded-3xl overflow-hidden cinematic-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Cinematic Banner" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABcPunXsUHfXdwSaxe6TCjdEwYgRvCVp-R2a5i7Q4Ab6x7sqfLJLKA9l0wTzrvC6Vk8y7cc7guUUFlKBxy6yaHmLRyn_76h64saPzsIr2cuAce7SW7IBqr80-tmsGHaoLUHZ9fzkQZ4XM2xWhhIyzm_drwLZnMUzQ689gLfJoaPTfZ2k2Nbw_qEXTbCWfxrqzO3noiVL-ahLngKxMoAU26RQCCspE96kM-d2WCgNx7IggLNxwqsDHnP-OX0gbXMnsdO7KTbi6IQBE" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                            <span className="material-symbols-outlined text-4xl text-white">shield_person</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Elite Identity Profile</h1>
                            <p className="text-white/70 font-medium">Curated on-chain reputation for the Avalanche ecosystem</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-end mt-8 border-b border-white/10 pb-6 mb-6">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-4 backdrop-blur-md text-white">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Verified Elite
                    </span>
                    <h2 className="text-3xl font-bold mb-1 text-white">Soulbound Reputation</h2>
                    <p className="text-white/70">Unified cross-subnet performance index.</p>
                </div>
                <div className="text-right">
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8B82F6] to-fuchsia-400 tracking-tighter">{displayReputation}</div>
                    <div className="text-sm font-bold text-[#8B82F6] tracking-widest uppercase mt-1">Reputation Score</div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold text-white/80">Verification Level: <span className="text-white">Master</span></span>
                    {reputationScore > 900 ? (
                        <span className="text-xs font-bold text-[#8B82F6] bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">Elite Reached</span>
                    ) : (
                        <span className="text-xs font-bold text-[#8B82F6] bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            {Math.min(100, Math.max(0, reputationScore / 10))}% to Elite
                        </span>
                    )}
                </div>
                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#8B82F6] to-fuchsia-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, reputationScore / 10)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-white/40 uppercase font-bold tracking-widest">
                    <span>Apprentice</span>
                    <span>Voyager</span>
                    <span>Master</span>
                    <span className="text-white/80">Elite</span>
                </div>
            </div>

            <div className="glass-panel bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(30,27,75,0.4)] border border-white/40 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#8B82F6]/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-5xl text-[#8B82F6]">explore</span>
                </div>
                <h3 className="text-2xl font-bold mb-1 dark:text-white text-gray-900">Voyager Rank</h3>
                <p className="text-[#8B82F6] font-bold tracking-widest text-sm mb-6 uppercase">LEVEL {currentLevel} CONTRIBUTOR</p>
                <div className="w-full pt-6 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Global Rank</div>
                        <div className="font-bold text-xl text-gray-900 dark:text-[#F3F4F6]">{globalRank ? `#${globalRank}` : '--'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Trust Score</div>
                        <div className="font-bold text-xl text-gray-900 dark:text-[#F3F4F6]">{profileExists ? `${trustScore}/10` : '0/10'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
