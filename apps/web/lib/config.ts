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

export const avalancheMainnet = {
  id: 43114,
  name: 'Avalanche',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Snowtrace', url: 'https://snowtrace.io' },
  },
  testnet: false,
} as const satisfies Chain

import { hardhat } from 'viem/chains'

const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK || 'localhost'

const localHardhat = {
  ...hardhat,
  name: 'AVAX Local',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
} as const satisfies Chain

export const ACTIVE_CHAIN = 
  NETWORK_NAME === 'mainnet' ? avalancheMainnet :
  NETWORK_NAME === 'testnet' ? avalancheFuji :
  localHardhat

/** AVAXVERSE deployed contract addresses */
export const CONTRACT_ADDRESSES = {
  IdentityRegistry: (process.env.NEXT_PUBLIC_IDENTITY_REGISTRY ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  ReputationToken: (process.env.NEXT_PUBLIC_REPUTATION_TOKEN ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  EscrowFactory: (process.env.NEXT_PUBLIC_ESCROW_FACTORY ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  AVAXToken: (process.env.NEXT_PUBLIC_AVAX_TOKEN ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  AVAXGovernor: (process.env.NEXT_PUBLIC_AVAX_GOVERNOR ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const
