import * as fs from 'fs'
import * as path from 'path'

function readArgValue(flag: string): string | undefined {
  const idx = process.argv.findIndex((arg) => arg === flag)
  if (idx >= 0 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1]
  }
  return undefined
}

function resolveNetworkArg(): string {
  const explicitNetwork = readArgValue('--network') || process.argv[2]
  if (explicitNetwork && !explicitNetwork.startsWith('--')) return explicitNetwork

  const hardhatNetwork = process.env.HARDHAT_NETWORK
  if (hardhatNetwork) return hardhatNetwork

  return 'localhost'
}

function envFileForNetwork(network: string): string {
  if (network === 'fuji' || network === 'testnet') return '.env.testnet'
  if (network === 'mainnet') return '.env.mainnet'
  return '.env.local'
}

function frontendNetworkValue(network: string): string {
  if (network === 'fuji' || network === 'testnet') return 'testnet'
  if (network === 'mainnet') return 'mainnet'
  return 'localhost'
}

async function main() {
  const network = resolveNetworkArg()
  const deploymentPath = path.resolve(__dirname, '..', 'deployments', `${network}.json`)
  const envFile = readArgValue('--env-file') || envFileForNetwork(network)
  const envPath = path.resolve(__dirname, '..', '..', '..', 'apps', 'web', envFile)

  if (!fs.existsSync(deploymentPath)) {
    console.error(`Deployment file not found for network: ${network}`)
    console.log(`Expected path: ${deploymentPath}`)
    process.exit(1)
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'))

  let envContent = ''
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }

  const updates = {
    NEXT_PUBLIC_IDENTITY_REGISTRY:
      addresses.IdentityRegistry || '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_REPUTATION_TOKEN:
      addresses.ReputationToken || '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_ESCROW_FACTORY: addresses.EscrowFactory || '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_AVAX_TOKEN: addresses.AVAXToken || '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_AVAX_GOVERNOR: addresses.AVAXGovernor || '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_NETWORK: frontendNetworkValue(network),
  }

  let newEnvContent = envContent
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*`, 'm')
    if (newEnvContent.match(regex)) {
      newEnvContent = newEnvContent.replace(regex, `${key}=${value}`)
    } else {
      newEnvContent += `\n${key}=${value}`
    }
  }

  fs.writeFileSync(envPath, newEnvContent.trim() + '\n')
  console.log(`${envFile} updated with ${network} contract addresses.`)
}

main().catch(console.error)

