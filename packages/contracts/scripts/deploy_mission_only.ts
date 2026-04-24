import { ethers, network, upgrades } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

function parseAddress(name: string, fallback?: string, required = false): string {
  const value = process.env[name] || fallback || ''
  if (required && !process.env[name]) {
    throw new Error(`${name} is required for this network`)
  }
  if (!value || !ethers.isAddress(value)) {
    throw new Error(`${name} must be a valid EVM address`)
  }
  return value
}

/**
 * Mission-only deployment:
 * - deploys IdentityRegistry, ReputationToken, AVAXToken, EscrowFactory
 * - skips AVAXGovernor deployment
 * - uses explicit mediator addresses from env (or deployer fallback)
 *
 * Usage:
 *   npx hardhat run scripts/deploy_mission_only.ts --network fuji
 */
async function main() {
  const [deployer] = await ethers.getSigners()
  const isLocalNetwork = network.name === 'localhost' || network.name === 'hardhat'
  const deployerAddress = await deployer.getAddress()
  const mediatorAddress = parseAddress('MEDIATOR_ADDRESS', deployerAddress, !isLocalNetwork)
  const mediatorBackupAddress = parseAddress(
    'MEDIATOR_BACKUP_ADDRESS',
    deployerAddress,
    !isLocalNetwork
  )
  const timelockDelaySec = Number(process.env.TIMELOCK_DELAY_SEC || '0')
  const timelockAdmin = parseAddress('TIMELOCK_ADMIN_ADDRESS', deployerAddress)

  console.log('\nDeploying AVAXVERSE mission-only contracts with UUPS proxies...')
  console.log(`  Network  : ${network.name}`)
  console.log(`  Deployer : ${deployerAddress}`)
  console.log(`  Mediator : ${mediatorAddress}`)
  console.log(`  Backup   : ${mediatorBackupAddress}`)
  console.log(`  Timelock : ${timelockDelaySec > 0 ? `${timelockDelaySec}s` : 'disabled'}`)
  console.log(
    `  Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployerAddress))} AVAX\n`
  )

  if (mediatorAddress.toLowerCase() === mediatorBackupAddress.toLowerCase()) {
    if (!isLocalNetwork) {
      throw new Error('MEDIATOR_ADDRESS and MEDIATOR_BACKUP_ADDRESS cannot be the same on non-local network')
    }
    console.log('Warning: mediator and backup are the same address (allowed only for local MVP testing).')
  }

  // 1) IdentityRegistry
  const IdentityRegistry = await ethers.getContractFactory('IdentityRegistry')
  const registry = await upgrades.deployProxy(IdentityRegistry, [], { kind: 'uups' })
  await registry.waitForDeployment()
  console.log(`OK IdentityRegistry Proxy: ${await registry.getAddress()}`)

  // 2) ReputationToken
  const ReputationToken = await ethers.getContractFactory('ReputationToken')
  const repToken = await upgrades.deployProxy(ReputationToken, [], {
    kind: 'uups',
    unsafeAllow: ['constructor'],
  })
  await repToken.waitForDeployment()
  console.log(`OK ReputationToken Proxy: ${await repToken.getAddress()}`)

  // 3) AVAXToken
  const AVAXToken = await ethers.getContractFactory('AVAXToken')
  const avaxToken = await upgrades.deployProxy(AVAXToken, [deployerAddress], { kind: 'uups' })
  await avaxToken.waitForDeployment()
  console.log(`OK AVAXToken Proxy: ${await avaxToken.getAddress()}`)

  // 4) EscrowFactory
  const EscrowFactory = await ethers.getContractFactory('EscrowFactory')
  const factory = await upgrades.deployProxy(
    EscrowFactory,
    [
      await registry.getAddress(),
      await repToken.getAddress(),
      deployerAddress, // feeRecipient
      mediatorAddress,
      mediatorBackupAddress,
    ],
    { kind: 'uups', unsafeAllow: ['constructor'] }
  )
  await factory.waitForDeployment()
  console.log(`OK EscrowFactory Proxy: ${await factory.getAddress()}`)

  // 5) Wiring
  await repToken.setMinter(await factory.getAddress(), true)
  await registry.setAuthorizedUpdater(await factory.getAddress(), true)
  await registry.setAVAXToken(await avaxToken.getAddress())
  await avaxToken.transferOwnership(await registry.getAddress())
  console.log('OK Permissions wired.')

  let timelockAddress = ethers.ZeroAddress
  if (timelockDelaySec > 0) {
    const AVAXTimelock = await ethers.getContractFactory('AVAXTimelock')
    const timelock = await AVAXTimelock.deploy(
      timelockDelaySec,
      [timelockAdmin],
      [timelockAdmin],
      timelockAdmin
    )
    await timelock.waitForDeployment()
    timelockAddress = await timelock.getAddress()
    console.log(`OK Timelock deployed: ${timelockAddress}`)

    await registry.transferOwnership(timelockAddress)
    await factory.transferOwnership(timelockAddress)
    console.log('OK Ownership transferred to timelock for IdentityRegistry and EscrowFactory.')
  }

  // 6) Save deployments
  const addresses = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    mode: 'mission-only',
    IdentityRegistry: await registry.getAddress(),
    ReputationToken: await repToken.getAddress(),
    EscrowFactory: await factory.getAddress(),
    AVAXToken: await avaxToken.getAddress(),
    AVAXGovernor: ethers.ZeroAddress,
    TimelockController: timelockAddress,
    mediator: mediatorAddress,
    mediatorBackup: mediatorBackupAddress,
  }

  const outputDir = path.resolve(__dirname, '..', 'deployments')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, `${network.name}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2))
  console.log(`Saved addresses to: deployments/${network.name}.json`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
