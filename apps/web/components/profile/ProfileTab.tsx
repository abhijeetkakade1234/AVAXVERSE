interface ProfileTabProps {
    profileExists: boolean;
    displayReputation: string;
    currentLevel: number;
    trustScore: string;
    globalRank: number | null;
    reputationScore: number;
    currentRankName: string;
    nextRankName: string;
    progressToNext: number;
}

const RANK_THEMES: Record<string, {
    bannerGradient: string;
    icon: string;
    accentColor: string;
    pattern: string;
}> = {
    'Apprentice': {
        bannerGradient: 'from-slate-900 via-slate-800 to-indigo-950',
        icon: 'keyboard_command_key',
        accentColor: '#94A3B8',
        pattern: 'opacity-10 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]'
    },
    'Voyager': {
        bannerGradient: 'from-blue-900 via-indigo-900 to-violet-950',
        icon: 'explore',
        accentColor: '#60A5FA',
        pattern: 'opacity-15 [background-image:linear-gradient(45deg,#ffffff_12%,transparent_12%,transparent_50%,#ffffff_50%,#ffffff_62%,transparent_62%,transparent_100%)] [background-size:10px_10px]'
    },
    'Master': {
        bannerGradient: 'from-emerald-900 via-teal-900 to-cyan-950',
        icon: 'auto_awesome_motion',
        accentColor: '#34D399',
        pattern: 'opacity-10 [background-image:repeating-linear-gradient(0deg,transparent,transparent_7px,#ffffff_7px,#ffffff_8px)]'
    },
    'Elite': {
        bannerGradient: 'from-fuchsia-900 via-purple-900 to-indigo-950',
        icon: 'diamond',
        accentColor: '#E879F9',
        pattern: 'opacity-20 [background-image:radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:12px_12px]'
    },
    'Grandmaster': {
        bannerGradient: 'from-orange-900 via-red-900 to-rose-950',
        icon: 'military_tech',
        accentColor: '#FB923C',
        pattern: 'opacity-15 [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:30px_30px]'
    },
    'Legend': {
        bannerGradient: 'from-yellow-600 via-amber-700 to-yellow-900',
        icon: 'workspace_premium',
        accentColor: '#FBBF24',
        pattern: 'opacity-30 [background-image:url("https://www.transparenttextures.com/patterns/gold-scale.png")]'
    }
};

const calculateVisualProgress = (score: number) => {
    const milestones = [0, 100, 250, 500, 1000, 2500];
    const segmentWidth = 100 / (milestones.length - 1); // 20% each segment

    for (let i = 0; i < milestones.length - 1; i++) {
        if (score >= milestones[i] && score < milestones[i + 1]) {
            const segmentProgress = (score - milestones[i]) / (milestones[i + 1] - milestones[i]);
            return (i * segmentWidth) + (segmentProgress * segmentWidth);
        }
    }
    return 100;
};

export default function ProfileTab({
    profileExists,
    displayReputation,
    currentLevel,
    trustScore,
    globalRank,
    reputationScore,
    currentRankName,
    nextRankName,
    progressToNext
}: ProfileTabProps) {
    const visualProgress = calculateVisualProgress(reputationScore);
    const theme = RANK_THEMES[currentRankName] || RANK_THEMES['Apprentice'];

    return (
        <div className="space-y-8">
            <div className={`relative w-full h-64 rounded-3xl overflow-hidden cinematic-shadow bg-gradient-to-br ${theme.bannerGradient}`}>
                <div className={`absolute inset-0 ${theme.pattern}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                            <span className="material-symbols-outlined text-4xl text-white">{theme.icon}</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">{currentRankName} Identity Profile</h1>
                            <p className="text-white/70 font-medium">Curated on-chain reputation for the Avalanche ecosystem</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-end mt-8 border-b border-white/10 pb-6 mb-6">
                <div>
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
                    <span className="text-sm font-semibold text-white/80">Rank: <span className="text-white font-bold text-lg ml-1">{currentRankName}</span></span>
                    {progressToNext === 100 ? (
                        <span className="text-xs font-bold text-[#8B82F6] bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider italic">Maximum Rank Achieved</span>
                    ) : (
                        <span className="text-xs font-bold text-[#8B82F6] bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            {progressToNext}% to {nextRankName}
                        </span>
                    )}
                </div>
                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#8B82F6] to-fuchsia-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(139,130,246,0.5)]" style={{ width: `${visualProgress}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-white/40 uppercase font-bold tracking-widest px-2">
                    <span>Apprentice</span>
                    <span className={reputationScore >= 100 ? 'text-white/80' : ''}>Voyager</span>
                    <span className={reputationScore >= 250 ? 'text-white/80' : ''}>Master</span>
                    <span className={reputationScore >= 500 ? 'text-white/80' : ''}>Elite</span>
                    <span className={reputationScore >= 1000 ? 'text-white/80' : ''}>Grandmaster</span>
                    <span className={reputationScore >= 2500 ? 'text-white/80' : ''}>Legend</span>
                </div>
            </div>

            <div className="glass-panel bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(30,27,75,0.4)] border border-white/40 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#8B82F6]/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-5xl text-[#8B82F6]">stars</span>
                </div>
                <h3 className="text-2xl font-bold mb-1 dark:text-white text-gray-900">{currentRankName} Rank</h3>
                <p className="text-[#8B82F6] font-bold tracking-widest text-sm mb-6 uppercase">LEVEL {currentLevel} CONTRIBUTOR</p>
                <div className="w-full pt-6 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Global Influence</div>
                        <div className="font-bold text-xl text-gray-900 dark:text-[#F3F4F6]">{globalRank ? `#${globalRank}` : '--'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Trust Integrity</div>
                        <div className="font-bold text-xl text-gray-900 dark:text-[#F3F4F6]">{profileExists ? `${trustScore}/10` : '0/10'}</div>
                    </div>
                </div>
            </div>

            <div className="glass-panel bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-fuchsia-400">auto_awesome</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Path to Legend</h3>
                        <p className="text-white/60 text-sm">How to increase your rank and status</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-[#8B82F6] font-bold mb-1">Step 1</div>
                        <div className="text-white font-bold mb-2 text-sm">Complete Missions</div>
                        <p className="text-white/50 text-xs leading-relaxed">Every job you successfully finish awards you 25 Reputation points automatically.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-fuchsia-400 font-bold mb-1">Step 2</div>
                        <div className="text-white font-bold mb-2 text-sm">Prestige Milestones</div>
                        <p className="text-white/50 text-xs leading-relaxed">Earn badges as you reach point milestones. Legend status requires consistent elite performance.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-emerald-400 font-bold mb-1">Step 3</div>
                        <div className="text-white font-bold mb-2 text-sm">Soulbound Trust</div>
                        <p className="text-white/50 text-xs leading-relaxed">Ranks are locked on-chain. Your status is permanent proof of your expertise and reliability.</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <div className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Prestige Milestones Table</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                        {[
                            { name: 'Apprentice', exp: '0', missions: 'Start' },
                            { name: 'Voyager', exp: '100', missions: '4 Jobs' },
                            { name: 'Master', exp: '250', missions: '10 Jobs' },
                            { name: 'Elite', exp: '500', missions: '20 Jobs' },
                            { name: 'Grandmaster', exp: '1000', missions: '40 Jobs' },
                            { name: 'Legend', exp: '2500', missions: '100+ Jobs' },
                        ].map((milestone) => (
                            <div key={milestone.name} className="flex flex-col">
                                <span className={`text-sm font-bold ${reputationScore >= parseInt(milestone.exp) ? 'text-white' : 'text-white/40'}`}>
                                    {milestone.name}
                                </span>
                                <span className="text-[10px] text-[#8B82F6] font-medium">{milestone.missions}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
