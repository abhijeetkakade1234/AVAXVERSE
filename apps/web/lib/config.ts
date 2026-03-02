import type { Chain } from 'viem'

export const avalancheFuji = {
  id: 43113,
  name: 'Avalanche Fuji',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Snowtrace', url: 'https://testnet.snowtrace.io' },
  },
  testnet: true,
} as const satisfies Chain

/** AVAXVERSE deployed contract addresses (Fuji testnet) */
export const CONTRACT_ADDRESSES = {
  IdentityRegistry: (process.env.NEXT_PUBLIC_IDENTITY_REGISTRY ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  ReputationToken: (process.env.NEXT_PUBLIC_REPUTATION_TOKEN ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  EscrowFactory: (process.env.NEXT_PUBLIC_ESCROW_FACTORY ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const
