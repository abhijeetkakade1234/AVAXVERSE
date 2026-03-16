'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type SnackbarType = 'success' | 'error' | 'info' | 'warning'

interface SnackbarContextType {
    showSnackbar: (message: string, type?: SnackbarType) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

export function SnackbarProvider({ children }: { children: ReactNode }) {
    const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; open: boolean } | null>(null)

    const showSnackbar = useCallback((message: string, type: SnackbarType = 'info') => {
        setSnackbar(prev => {
            // Prevent duplicate snackbars with the same message if already open
            if (prev?.open && prev.message === message) return prev
            return { message, type, open: true }
        })

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setSnackbar(prev => prev?.message === message ? { ...prev, open: false } : prev)
        }, 5000)
    }, [])

    const closeSnackbar = () => {
        setSnackbar(prev => prev ? { ...prev, open: false } : null)
    }

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            {snackbar && snackbar.open && (
                <div
                    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-slide-up
                        ${snackbar.type === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-100' :
                            snackbar.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100' :
                                'bg-primary/20 border-primary/40 text-primary-light'}
                    `}
                >
                    <span className="material-symbols-outlined">
                        {snackbar.type === 'error' ? 'error' :
                            snackbar.type === 'success' ? 'check_circle' :
                                'info'}
                    </span>
                    <p className="font-medium text-sm">{snackbar.message}</p>
                    <button onClick={closeSnackbar} aria-label="Close notification" className="ml-2 hover:opacity-70 transition-opacity">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}
        </SnackbarContext.Provider>
    )
}

export function useSnackbar() {
    const context = useContext(SnackbarContext)
    if (context === undefined) {
        throw new Error('useSnackbar must be used within a SnackbarProvider')
    }
    return context
}
