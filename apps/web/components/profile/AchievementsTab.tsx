interface AchievementsTabProps {
    totalJobs: number;
    reputationScore: number;
}

export default function AchievementsTab({ totalJobs, reputationScore }: AchievementsTabProps) {
    const hasGenesis = totalJobs >= 1;
    const hasAuditMaster = reputationScore >= 500;
    const hasArchitect = totalJobs >= 5;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-3xl font-bold dark:text-[#F3F4F6] text-gray-900">Soulbound Achievements</h3>
                    <p className="text-[#4B5563] dark:text-[#9CA3AF] mt-2">Verified history of your impact on the AVAXVERSE.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Genesis Pioneer */}
                <div className={`glass-panel border rounded-2xl p-6 transition-all group ${hasGenesis ? 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer' : 'bg-black/20 border-white/5 grayscale opacity-50'}`}>
                    <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2 dark:text-[#F3F4F6] text-gray-900">Genesis Pioneer</h4>
                    <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF]">
                        {hasGenesis ? 'Verified contract deployer on Avalanche.' : 'Complete your first job to unlock.'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-[#8B82F6] bg-[#8B82F6]/10 px-2 py-1 rounded">Rarity: 1.2%</span>
                        {hasGenesis && <span className="text-[#8B82F6] material-symbols-outlined text-sm">verified</span>}
                    </div>
                </div>

                {/* Audit Master */}
                <div className={`glass-panel border rounded-2xl p-6 transition-all group ${hasAuditMaster ? 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer' : 'bg-black/20 border-white/5 grayscale opacity-50'}`}>
                    <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">verified_user</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2 dark:text-[#F3F4F6] text-gray-900">Elite Contributor</h4>
                    <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF]">
                        {hasAuditMaster ? 'Reached 500+ Reputation points.' : 'Reach 500 Reputation points to unlock.'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">Rarity: 5.4%</span>
                        {hasAuditMaster && <span className="text-green-500 material-symbols-outlined text-sm">verified</span>}
                    </div>
                </div>

                {/* Subnet Architect */}
                <div className={`glass-panel border rounded-2xl p-6 transition-all group ${hasArchitect ? 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer' : 'bg-black/20 border-white/5 grayscale opacity-50'}`}>
                    <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">terminal</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2 dark:text-[#F3F4F6] text-gray-900">Subnet Architect</h4>
                    <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF]">
                        {hasArchitect ? 'Completed 5+ distinct network jobs.' : 'Complete 5 jobs to unlock.'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded">Rarity: 8.9%</span>
                        {hasArchitect && <span className="text-purple-500 material-symbols-outlined text-sm">verified</span>}
                    </div>
                </div>
            </div>
        </section>
    );
}
