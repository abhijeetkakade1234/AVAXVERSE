'use client'

import { ReactNode } from 'react'
import { WagmiProvider, http } from 'wagmi'
import {
    RainbowKitProvider,
    darkTheme,
    connectorsForWallets,
} from '@rainbow-me/rainbowkit'
import { coreWallet } from '@rainbow-me/rainbowkit/wallets'
import { createConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ACTIVE_CHAIN } from '@/lib/config'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '3a8170812b185d451f9513995ca74315'

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [coreWallet],
        },
    ],
    {
        appName: 'AVAXVERSE',
        projectId,
    }
)

const wagmiConfig = createConfig({
    connectors,
    chains: [ACTIVE_CHAIN],
    transports: {
        [ACTIVE_CHAIN.id]: http(),
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
