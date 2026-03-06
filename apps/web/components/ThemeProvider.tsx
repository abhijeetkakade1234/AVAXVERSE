'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
    theme: Theme
    toggle: () => void
}>({ theme: 'dark', toggle: () => { } })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Initialize directly from localStorage to avoid cascading setState in effect
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark'
        return (localStorage.getItem('theme') as Theme) ?? 'dark'
    })

    // Sync the .dark class to <html> whenever theme changes
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    const toggle = () => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark'
            localStorage.setItem('theme', next)
            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
