'use client'

import { ReactNode } from 'react'
import { WagmiProvider, http } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { avalancheFuji } from '@/lib/config'
import { hardhat } from 'wagmi/chains'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

const wagmiConfig = getDefaultConfig({
    appName: 'AVAXVERSE',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? 'avaxverse-dev',
    // Hardhat goes first so it is the default local network
    chains: [hardhat, avalancheFuji],
    transports: {
        [hardhat.id]: http('http://127.0.0.1:8545'),
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
                        accentColor: '#7B61FF',       // Primary Purple
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
