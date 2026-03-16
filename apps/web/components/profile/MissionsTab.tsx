import { useState } from 'react';
import { formatEther } from 'viem';
import { ESCROW_STATES } from '@/lib/abis';
import Link from 'next/link';
import Pagination from '../ui/Pagination';

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
    const [filter, setFilter] = useState<'All' | 'Active' | 'Completed' | 'Disputed'>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [prevFilter, setPrevFilter] = useState(filter);

    if (filter !== prevFilter) {
        setPrevFilter(filter);
        setCurrentPage(1);
    }

    const pageSize = 100;

    const filteredJobs = allJobs.filter(job => {
        if (filter === 'All') return true;

        const isDisputed = ESCROW_STATES[job.status] === 'DISPUTED';
        const isCompleted = job.status >= 4 || ESCROW_STATES[job.status] === 'RELEASED' || ESCROW_STATES[job.status] === 'REFUNDED';
        const isActive = job.status < 4 && !isCompleted && !isDisputed;

        if (filter === 'Active') return isActive;
        if (filter === 'Completed') return isCompleted;
        if (filter === 'Disputed') return isDisputed;

        return true;
    });


    const totalPages = Math.ceil(filteredJobs.length / pageSize);
    const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-8 animate-enter">
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h3 className="text-3xl font-bold dark:text-[#F3F4F6] text-gray-900">Operational History</h3>
                        <p className="text-[#4B5563] dark:text-[#9CA3AF] mt-2">Browse the track record and concluded smart-contract engagements.</p>
                    </div>

                    <div
                        role="group"
                        aria-label="Filter missions by status"
                        className="flex p-1.5 bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 w-fit overflow-x-auto"
                    >
                        {(['All', 'Active', 'Completed', 'Disputed'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap fluid-touch ${filter === f
                                    ? 'bg-white dark:bg-surface-dark shadow-sm text-[#8B82F6]'
                                    : 'hover:bg-white/20 text-text-muted-light dark:text-text-muted-dark'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {paginatedJobs.length > 0 ? (
                        <>
                            {paginatedJobs.map(job => (
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
                                            <Link href={`/missions/${job.id}`}>
                                                <button className="px-6 py-2.5 bg-[#8B82F6] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#8B82F6]/25 hover:scale-105 transition-transform active:scale-95 fluid-touch">
                                                    Mission Control
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    ) : (
                        <div className="glass-panel p-12 text-center border-dashed border-white/10 text-white/30 rounded-3xl font-bold">
                            No missions found for filter: {filter}.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
