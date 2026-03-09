'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisible = 5

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-12 pb-8 animate-enter">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/10 text-text-muted-light dark:text-text-muted-dark hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={20} />
            </button>

            {start > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${currentPage === 1 ? 'bg-primary text-white shadow-lg' : 'bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/10 text-text-muted-light dark:text-text-muted-dark hover:bg-white/40 dark:hover:bg-black/40'}`}
                    >
                        1
                    </button>
                    {start > 2 && <span className="text-text-muted-light dark:text-text-muted-dark px-1">...</span>}
                </>
            )}

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg' : 'bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/10 text-text-muted-light dark:text-text-muted-dark hover:bg-white/40 dark:hover:bg-black/40'}`}
                >
                    {page}
                </button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="text-text-muted-light dark:text-text-muted-dark px-1">...</span>}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${currentPage === totalPages ? 'bg-primary text-white shadow-lg' : 'bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/10 text-text-muted-light dark:text-text-muted-dark hover:bg-white/40 dark:hover:bg-black/40'}`}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/10 text-text-muted-light dark:text-text-muted-dark hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    )
}
