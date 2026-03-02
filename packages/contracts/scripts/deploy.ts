import { ethers, network } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Deployment script for AVAXVERSE contracts.
 * Run with: hardhat run scripts/deploy.ts --network fuji
 *           hardhat run scripts/deploy.ts --network localhost
 */
async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('\n🚀 Deploying AVAXVERSE contracts...')
  console.log(`  Network  : ${network.name}`)
  console.log(`  Deployer : ${deployer.address}`)
  console.log(`  Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} AVAX\n`)

  // 1. IdentityRegistry
  const IdentityRegistry = await ethers.getContractFactory('IdentityRegistry')
  const registry = await IdentityRegistry.deploy()
  await registry.waitForDeployment()
  console.log(`✅ IdentityRegistry deployed: ${await registry.getAddress()}`)

  // 2. ReputationToken (Soulbound NFT)
  const ReputationToken = await ethers.getContractFactory('ReputationToken')
  const repToken = await ReputationToken.deploy()
  await repToken.waitForDeployment()
  console.log(`✅ ReputationToken    deployed: ${await repToken.getAddress()}`)

  // 3. EscrowFactory — use deployer as fee recipient and mediator for MVP
  const EscrowFactory = await ethers.getContractFactory('EscrowFactory')
  const factory = await EscrowFactory.deploy(
    await registry.getAddress(),
    await repToken.getAddress(),
    deployer.address, // feeRecipient — change for production
    deployer.address, // mediator     — change for production
  )
  await factory.waitForDeployment()
  console.log(`✅ EscrowFactory      deployed: ${await factory.getAddress()}`)

  // 4. Wire up permissions
  await repToken.setMinter(await factory.getAddress(), true)
  await registry.setAuthorizedUpdater(await factory.getAddress(), true)
  console.log('\n🔗 Permissions set. EscrowFactory authorized on Registry + RepToken.')

  // 5. Save deployed addresses to a JSON file (for frontend use)
  const addresses = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    IdentityRegistry: await registry.getAddress(),
    ReputationToken: await repToken.getAddress(),
    EscrowFactory: await factory.getAddress(),
  }

  const outputDir = path.resolve(__dirname, '..', 'deployments')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, `${network.name}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2))
  console.log(`\n📄 Addresses saved to: deployments/${network.name}.json`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
