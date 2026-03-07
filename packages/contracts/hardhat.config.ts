import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import * as dotenv from 'dotenv'

dotenv.config()

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '0x' + '0'.repeat(64)
const FUJI_RPC = process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
const SNOWTRACE_API_KEY = process.env.SNOWTRACE_API_KEY || ''

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'cancun',
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    fuji: {
      url: FUJI_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 43113,
      gasPrice: 25000000000,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
      accounts: [PRIVATE_KEY],
      chainId: 43114,
    },
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: SNOWTRACE_API_KEY,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
  },
}

export default config
