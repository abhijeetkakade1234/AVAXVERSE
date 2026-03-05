import React, { useState } from 'react';

interface ProfileSidebarProps {
    profileExists: boolean;
    displayName: string;
    displayPfp: string;
    parsedSocials: { twitter: string; github: string; };
    parsedSkills: string[];
    activeTab: 'profile' | 'achievements' | 'missions' | 'settings';
    setActiveTab: (tab: 'profile' | 'achievements' | 'missions' | 'settings') => void;
    isOwnProfile: boolean;
    totalJobs?: number;
    reputationScore?: number;
    targetAddress?: string;
}

export default function ProfileSidebar({
    profileExists,
    displayName,
    displayPfp,
    parsedSocials,
    parsedSkills,
    activeTab,
    setActiveTab,
    isOwnProfile,
    totalJobs = 0,
    reputationScore = 0,
    targetAddress
}: ProfileSidebarProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/profile/${targetAddress}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getRankTitle = (score: number) => {
        if (score >= 900) return 'Elite Voyager';
        if (score >= 600) return 'Master Contributor';
        if (score >= 200) return 'Active Contributor';
        return 'Apprentice';
    };

    const rankTitle = profileExists ? getRankTitle(reputationScore) : 'Guest';
    return (
        <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
                <div className="glass-panel bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(30,27,75,0.4)] rounded-2xl p-6 shadow-sm border border-white/40 dark:border-white/10">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="relative mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-[#8B82F6]/30 object-cover" src={displayPfp} />
                            {profileExists && (
                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-[#1E1B4B] rounded-full"></div>
                            )}
                        </div>
                        <h3 className="font-bold text-xl leading-tight dark:text-white text-gray-900">{displayName}</h3>
                        <span className="text-sm text-[#8B82F6] font-semibold">
                            {rankTitle}
                        </span>

                        <button
                            onClick={handleShare}
                            className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${copied ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-[#8B82F6]/10 border-[#8B82F6]/30 text-[#8B82F6] hover:bg-[#8B82F6]/20'}`}
                        >
                            <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'share'}</span>
                            {copied ? 'Copied!' : 'Share Profile'}
                        </button>

                        <div className="flex gap-3 mt-4">
                            {parsedSocials.twitter && (
                                <a className="p-2 bg-white/50 dark:bg-white/10 rounded-xl hover:text-[#8B82F6] transition-colors border border-white/20 dark:text-gray-300" href={`https://x.com/${parsedSocials.twitter}`} target="_blank" rel="noopener noreferrer">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                </a>
                            )}
                            {parsedSocials.github && (
                                <a className="p-2 bg-white/50 dark:bg-white/10 rounded-xl hover:text-[#8B82F6] transition-colors border border-white/20 dark:text-gray-300" href={`https://github.com/${parsedSocials.github}`} target="_blank" rel="noopener noreferrer">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/30 dark:bg-white/5 rounded-2xl p-3 border border-white/20 text-center">
                            <span className="block text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Reputation</span>
                            <span className="text-lg font-black text-[#8B82F6]">{reputationScore}</span>
                        </div>
                        <div className="bg-white/30 dark:bg-white/5 rounded-2xl p-3 border border-white/20 text-center">
                            <span className="block text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Impact</span>
                            <span className="text-lg font-black text-[#8B82F6]">{totalJobs}</span>
                        </div>
                    </div>

                    {parsedSkills.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-widest mb-3">Specializations</h4>
                            <div className="flex flex-wrap gap-2">
                                {parsedSkills.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 bg-[#8B82F6]/10 text-[#8B82F6] rounded-full text-xs font-medium border border-[#8B82F6]/20">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <nav className="space-y-1">
                        <button
                            disabled={!profileExists && isOwnProfile}
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-white/60 dark:bg-[#1E1B4B] shadow-sm border border-white/50 dark:border-white/5 text-[#8B82F6]' : 'hover:bg-white/40 dark:hover:bg-white/5 text-[#4B5563] dark:text-[#9CA3AF]'} ${(!profileExists && isOwnProfile) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <span className="material-symbols-outlined text-xl">person_pin</span>
                            Profile
                        </button>
                        <button
                            disabled={!profileExists && isOwnProfile}
                            onClick={() => setActiveTab('achievements')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'achievements' ? 'bg-white/60 dark:bg-[#1E1B4B] shadow-sm border border-white/50 dark:border-white/5 text-[#8B82F6]' : 'hover:bg-white/40 dark:hover:bg-white/5 text-[#4B5563] dark:text-[#9CA3AF]'} ${(!profileExists && isOwnProfile) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <span className="material-symbols-outlined text-xl">workspace_premium</span>
                            Achievements
                        </button>
                        <button
                            disabled={!profileExists && isOwnProfile}
                            onClick={() => setActiveTab('missions')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'missions' ? 'bg-white/60 dark:bg-[#1E1B4B] shadow-sm border border-white/50 dark:border-white/5 text-[#8B82F6]' : 'hover:bg-white/40 dark:hover:bg-white/5 text-[#4B5563] dark:text-[#9CA3AF]'} ${(!profileExists && isOwnProfile) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
                            Missions
                        </button>
                        {isOwnProfile && (
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors mt-8 ${activeTab === 'settings' ? 'bg-white/60 dark:bg-[#1E1B4B] shadow-sm border border-white/50 dark:border-white/5 text-[#8B82F6]' : 'hover:bg-white/40 dark:hover:bg-white/5 text-[#4B5563] dark:text-[#9CA3AF]'}`}
                            >
                                <span className="material-symbols-outlined text-xl">settings</span>
                                Settings
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </aside>
    );
}
