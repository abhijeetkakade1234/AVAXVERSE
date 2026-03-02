'use client'

import { ReactNode } from 'react'
import { WagmiProvider, http } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { avalancheFuji } from '@/lib/config'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

const wagmiConfig = getDefaultConfig({
    appName: 'AVAXVERSE',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? 'avaxverse-dev',
    chains: [avalancheFuji],
    transports: {
        [avalancheFuji.id]: http(),
    },
    ssr: true,
})

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#E84142',       // Avalanche red
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
