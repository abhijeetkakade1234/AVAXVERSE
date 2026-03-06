import { formatEther } from 'viem';
import { ESCROW_STATES } from '@/lib/abis';
import Link from 'next/link';

interface JobData {
    id: number;
    escrow: `0x${string}`;
    client: `0x${string}`;
    freelancer: `0x${string}`;
    title: string;
    budget: bigint;
    createdAt: bigint;
    status: number;
}

interface MissionsTabProps {
    allJobs: JobData[];
}

export default function MissionsTab({ allJobs }: MissionsTabProps) {
    const activeMissions = allJobs.filter(j => j.status < 4);
    const completedMissions = allJobs.filter(j => j.status >= 4);

    return (
        <div className="space-y-12">
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-3xl font-bold dark:text-[#F3F4F6] text-gray-900">Active Missions</h3>
                        <p className="text-[#4B5563] dark:text-[#9CA3AF] mt-2">Ongoing initiatives and smart-contract engagements.</p>
                    </div>
                    <span className="px-4 py-2 bg-[#8B82F6]/10 text-[#8B82F6] rounded-2xl font-bold text-sm border border-[#8B82F6]/20 shadow-sm">
                        {activeMissions.length} ACTIVE
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {activeMissions.length > 0 ? (
                        activeMissions.map(job => (
                            <div key={job.id} className="glass-panel bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B82F6]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#8B82F6]/10 transition-colors"></div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#8B82F6]/10 flex items-center justify-center text-[#8B82F6] flex-shrink-0 border border-[#8B82F6]/20">
                                            <span className="material-symbols-outlined">rocket_launch</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold dark:text-white text-gray-900 mb-1">{job.title}</h4>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="text-xs font-semibold text-[#8B82F6] bg-[#8B82F6]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {ESCROW_STATES[job.status] || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                    {new Date(Number(job.createdAt) * 1000).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{formatEther(job.budget)} AVAX</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Rewards</div>
                                        </div>
                                        <Link href={`/jobs/${job.id}`}>
                                            <button className="px-6 py-2.5 bg-[#8B82F6] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#8B82F6]/25 hover:scale-105 active:scale-95 transition-transform">
                                                Mission Control
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-panel p-12 text-center border-dashed border-white/10 text-white/30 rounded-3xl font-bold">
                            No active missions found.
                        </div>
                    )}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-8 pt-8 border-t border-white/5">
                    <h3 className="text-2xl font-bold dark:text-[#F3F4F6] text-gray-900">Mission History</h3>
                </div>

                <div className="space-y-3">
                    {completedMissions.map(job => (
                        <div key={job.id} className="glass-panel bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-white/30 dark:hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className={`material-symbols-outlined ${job.status === 4 ? 'text-green-500' : 'text-gray-500'}`}>
                                    {job.status === 4 ? 'check_circle' : 'cancel'}
                                </span>
                                <div>
                                    <div className="font-bold dark:text-white text-gray-900">{job.title}</div>
                                    <div className="text-xs text-gray-500 tabular-nums">ID: {job.id} • {new Date(Number(job.createdAt) * 1000).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-sm font-bold dark:text-gray-300 text-gray-700">{formatEther(job.budget)} AVAX</div>
                                </div>
                                <Link href={`/jobs/${job.id}`}>
                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-[#8B82F6] transition-colors cursor-pointer">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                    {completedMissions.length === 0 && (
                        <div className="p-8 text-center text-white/20 font-medium">
                            No history available.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
